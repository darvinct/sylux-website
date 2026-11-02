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
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','now_playing','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists radio_requests_fifo_idx on public.radio_requests (status, created_at, id);
create index if not exists radio_requests_member_idx on public.radio_requests (user_id);
create unique index if not exists radio_only_one_live_idx
  on public.radio_requests ((true)) where status = 'now_playing';

create or replace function public.is_operator(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.radio_operators where user_id = _uid);
$$;

create or replace function public.enforce_request_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.radio_requests
      where user_id = new.user_id and status <> 'rejected') >= 2 then
    raise exception 'Maksimal 2 request per member.' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists radio_limit_on_insert on public.radio_requests;
create trigger radio_limit_on_insert before insert on public.radio_requests
  for each row execute function public.enforce_request_limit();

create or replace function public.radio_touch_updated_at()
returns trigger language plpgsql as $$
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
language plpgsql security definer set search_path = public as $$
declare
  next_request public.radio_requests%rowtype;
begin
  if auth.uid() is null or not public.is_operator(auth.uid()) then
    raise exception 'Not authorized';
  end if;

  perform pg_advisory_xact_lock(8405293);
  update public.radio_requests set status = 'completed' where status = 'now_playing';
  select * into next_request from public.radio_requests
    where status = 'approved' order by created_at asc, id asc limit 1 for update;
  if found then
    update public.radio_requests set status = 'now_playing'
      where id = next_request.id returning * into next_request;
    return next_request;
  end if;
  return null;
end;
$$;

alter table public.radio_requests enable row level security;
alter table public.radio_operators enable row level security;

drop policy if exists "member reads own or operator reads all" on public.radio_requests;
create policy "member reads own or operator reads all"
  on public.radio_requests for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_operator(auth.uid())));

drop policy if exists "member submits pending own request" on public.radio_requests;
create policy "member submits pending own request"
  on public.radio_requests for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

drop policy if exists "operator may moderate requests" on public.radio_requests;
create policy "operator may moderate requests"
  on public.radio_requests for update to authenticated
  using ((select public.is_operator(auth.uid())))
  with check ((select public.is_operator(auth.uid())));

drop policy if exists "operator reads own operator record" on public.radio_operators;
create policy "operator reads own operator record"
  on public.radio_operators for select to authenticated using (user_id = (select auth.uid()));

revoke all on function public.display_next_request() from public;
grant execute on function public.display_next_request() to authenticated;
revoke all on function public.is_operator(uuid) from public;
grant execute on function public.is_operator(uuid) to authenticated;

-- BOOTSTRAP: After signing in as an operator once, copy your auth.users UUID in
-- Supabase Authentication > Users and run the following with the real UUID:
-- insert into public.radio_operators(user_id) values ('YOUR-AUTH-USER-UUID');
