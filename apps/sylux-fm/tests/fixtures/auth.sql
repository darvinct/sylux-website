-- Minimal Supabase auth stubs for an empty disposable database only.
do $$ begin
  if to_regclass('auth.users') is not null or to_regclass('public.radio_requests') is not null then
    raise exception 'Use an empty disposable database, never a Supabase project';
  end if;
  if not exists(select from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists(select from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists(select from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key);
create table auth.identities (id text primary key, user_id uuid references auth.users, provider text, identity_data jsonb);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema public, auth to authenticated, anon;
