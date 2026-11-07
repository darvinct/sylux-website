-- Apply in Supabase SQL Editor. No song audio is uploaded or played by this application.
create extension if not exists pgcrypto;

create table if not exists public.radio_operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

create table if not exists public.radio_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 64),
  song_title text not null check (char_length(song_title) between 1 and 120),
  artist text not null check (char_length(artist) between 1 and 120),
  dedication_to text check (dedication_to is null or char_length(dedication_to) <= 64),
  message text not null check (char_length(message) between 1 and 500),
  is_anonymous boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','now_playing','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing installations keep request history intact and get the new field.
alter table public.radio_requests
  add column if not exists is_anonymous boolean not null default false;

create index if not exists radio_requests_fifo_idx on public.radio_requests (status, created_at, id);
create index if not exists radio_requests_member_idx on public.radio_requests (user_id);
create unique index if not exists radio_only_one_live_idx
  on public.radio_requests ((true)) where status = 'now_playing';

create or replace function public.has_discord_identity()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.identities
    where user_id = (select auth.uid()) and provider = 'discord');
$$;

create or replace function public.is_operator(_uid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select _uid = (select auth.uid()) and public.has_discord_identity()
    and exists(select 1 from public.radio_operators where user_id = _uid);
$$;

create or replace function public.prepare_radio_request_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- BEFORE triggers execute before RLS WITH CHECK. Reject foreign user IDs
  -- before looking up identities, avoiding account enumeration.
  if auth.uid() is null or new.user_id is distinct from auth.uid() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  -- Identity and FIFO timestamps are server-owned, never supplied by a member.
  -- Discord OAuth: 'name' is the display name; 'full_name' can be the handle.
  -- Never fall back to a Discord username when a display name is missing.
  select left(coalesce(nullif(btrim(identity_data->>'global_name'), ''),
    nullif(btrim(identity_data->>'name'), ''),
    nullif(btrim(identity_data->>'display_name'), ''),
    'SYLUX Listener'), 64) into new.username
    from auth.identities where user_id = new.user_id and provider = 'discord'
    order by id limit 1;
  if not found then
    raise exception 'Discord sign-in required' using errcode = '42501';
  end if;
  new.status = 'pending';
  new.created_at = clock_timestamp();
  new.updated_at = new.created_at;
  new.song_title = btrim(new.song_title);
  new.artist = btrim(new.artist);
  new.message = btrim(new.message);
  new.dedication_to = nullif(btrim(new.dedication_to), '');
  return new;
end;
$$;
-- Replace the legacy quota trigger without changing Discord identity validation.
drop trigger if exists radio_limit_on_insert on public.radio_requests;
drop trigger if exists radio_prepare_on_insert on public.radio_requests;
create trigger radio_prepare_on_insert before insert on public.radio_requests
  for each row execute function public.prepare_radio_request_insert();
drop function if exists public.enforce_request_limit();

create or replace function public.radio_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists radio_touch on public.radio_requests;
create trigger radio_touch before update on public.radio_requests
  for each row execute function public.radio_touch_updated_at();

create or replace function public.display_next_request()
returns public.radio_requests
language plpgsql security definer set search_path = '' as $$
declare
  next_request public.radio_requests%rowtype;
begin
  if auth.uid() is null or not public.is_operator(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(8405293);
  select * into next_request from public.radio_requests
    where status = 'approved' order by created_at asc, id asc limit 1 for update;
  if found then
    update public.radio_requests set status = 'completed' where status = 'now_playing';
    update public.radio_requests set status = 'now_playing'
      where id = next_request.id returning * into next_request;
    return next_request;
  end if;
  return null;
end;
$$;

create or replace function public.moderate_request(request_id uuid, next_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  affected integer;
begin
  if auth.uid() is null or not public.is_operator(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(8405293);
  update public.radio_requests set status = next_status
    where id = request_id and (
      (status = 'pending' and next_status in ('approved', 'rejected')) or
      (status = 'now_playing' and next_status = 'completed')
    );
  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Request changed or invalid transition' using errcode = '23514';
  end if;
end;
$$;

alter table public.radio_requests enable row level security;
alter table public.radio_operators enable row level security;

drop policy if exists "member reads own or operator reads all" on public.radio_requests;
create policy "member reads own or operator reads all"
  on public.radio_requests for select to authenticated
  using ((select public.has_discord_identity()) and
    (user_id = (select auth.uid()) or (select public.is_operator(auth.uid()))));

drop policy if exists "member submits pending own request" on public.radio_requests;
create policy "member submits pending own request"
  on public.radio_requests for insert to authenticated
  with check ((select public.has_discord_identity()) and
    user_id = (select auth.uid()) and status = 'pending');

drop policy if exists "operator may moderate requests" on public.radio_requests;
-- No direct UPDATE policy. Only the two checked operator RPCs may change status.

drop policy if exists "operator reads own operator record" on public.radio_operators;
create policy "operator reads own operator record"
  on public.radio_operators for select to authenticated
  using (user_id = (select auth.uid()) and (select public.has_discord_identity()));

-- Explicit grants also remove Supabase's permissive default table privileges.
revoke all on public.radio_requests, public.radio_operators from public, anon, authenticated;
grant select on public.radio_requests, public.radio_operators to authenticated;
grant select on public.radio_requests to service_role;
grant insert (user_id, song_title, artist, dedication_to, message, is_anonymous)
  on public.radio_requests to authenticated;

revoke all on function public.display_next_request() from public, anon;
grant execute on function public.display_next_request() to authenticated;
revoke all on function public.is_operator(uuid) from public, anon;
grant execute on function public.is_operator(uuid) to authenticated;
revoke all on function public.has_discord_identity() from public, anon;
grant execute on function public.has_discord_identity() to authenticated;
revoke all on function public.moderate_request(uuid, text) from public, anon;
grant execute on function public.moderate_request(uuid, text) to authenticated;
revoke all on function public.prepare_radio_request_insert() from public, anon, authenticated;
revoke all on function public.radio_touch_updated_at() from public, anon, authenticated;

-- BOOTSTRAP: After signing in as an operator once, copy your auth.users UUID in
-- Supabase Authentication > Users and run the following with the real UUID:
-- insert into public.radio_operators(user_id) values ('YOUR-AUTH-USER-UUID');

