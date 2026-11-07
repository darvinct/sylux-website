\set ON_ERROR_STOP on
-- Run only against an EMPTY, DISPOSABLE PostgreSQL database as its owner:
-- psql "$SYLUX_TEST_DATABASE_URL" -X -f tests/database.sql
-- Everything, including auth stubs, is rolled back. Never use production here.
begin;
\ir fixtures/auth.sql
\ir ../supabase/schema.sql
-- Applying twice must safely update an existing installation.
\ir ../supabase/schema.sql

create function public.test_assert(condition boolean, label text) returns void
language plpgsql as $$ begin
  if condition is not true then raise exception 'Assertion failed: %', label; end if;
end $$;
create function public.test_denied(statement text, expected_code text) returns void
language plpgsql as $$ begin
  begin
    execute statement;
  exception when others then
    if sqlstate = expected_code then return; end if;
    raise;
  end;
  raise exception 'Expected SQLSTATE % for %', expected_code, statement;
end $$;

insert into auth.users values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
insert into auth.identities values
 ('discord-a','00000000-0000-0000-0000-000000000001','discord','{"full_name":"Listener A"}'),
 ('discord-b','00000000-0000-0000-0000-000000000002','discord','{"full_name":"Listener B"}'),
 ('discord-host','00000000-0000-0000-0000-000000000003','discord','{"full_name":"Host"}');
insert into public.radio_operators(user_id) values ('00000000-0000-0000-0000-000000000003');

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
insert into public.radio_requests(user_id,song_title,artist,message) values
 (auth.uid(),'First','Artist','Message'), (auth.uid(),'Second','Artist','Message');
select public.test_assert((select count(*)=2 from public.radio_requests),'two requests accepted');
select public.test_assert((select bool_and(username='Listener A') from public.radio_requests),'identity set by server');
insert into public.radio_requests(user_id,song_title,artist,message)
 values(auth.uid(),'Third','Artist','Message');
select public.test_assert((select count(*)=3 from public.radio_requests),'third request accepted without quota');
select public.test_denied($q$insert into public.radio_requests(user_id,song_title,artist,message,created_at)
 values(auth.uid(),'Forged','Artist','Message','2000-01-01')$q$,'42501');
select public.test_denied($q$insert into public.radio_requests(user_id,song_title,artist,message,username)
 values(auth.uid(),'Forged','Artist','Message','Host')$q$,'42501');
select public.test_denied($q$insert into public.radio_requests(user_id,song_title,artist,message)
 values('00000000-0000-0000-0000-000000000002','Forged','Artist','Message')$q$,'42501');
select public.test_denied($q$update public.radio_requests set status='approved'$q$,'42501');
select public.test_denied($q$delete from public.radio_requests$q$,'42501');
select public.test_denied($q$insert into public.radio_operators(user_id) values(auth.uid())$q$,'42501');
select public.test_denied('select public.display_next_request()','42501');
select public.test_denied($q$select public.moderate_request(gen_random_uuid(),'approved')$q$,'42501');
select public.test_assert(not public.is_operator('00000000-0000-0000-0000-000000000003'),'cannot enumerate another role');

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select public.test_assert((select count(*)=0 from public.radio_requests),'member cannot read others');
insert into public.radio_requests(user_id,song_title,artist,message) values
 (auth.uid(),'Reject me','Artist','Message'), (auth.uid(),'Pending','Artist','Message');

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
select public.test_assert((select count(*)=0 from public.radio_requests),'non-Discord account reads nothing');
select public.test_denied($q$insert into public.radio_requests(user_id,song_title,artist,message)
 values(auth.uid(),'Email only','Artist','Message')$q$,'42501');

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select public.test_assert(public.is_operator(auth.uid()),'operator recognized');
select public.test_assert((select count(*)=5 from public.radio_requests),'operator reads queue');
select public.test_denied($q$update public.radio_requests set song_title='Tampered'$q$,'42501');
select public.moderate_request((select id from public.radio_requests where song_title='Reject me'),'rejected');
select public.moderate_request((select id from public.radio_requests where song_title='Second'),'approved');
select public.moderate_request((select id from public.radio_requests where song_title='First'),'approved');
select public.test_assert((public.display_next_request()).song_title='First','FIFO follows submission, not approval');
select public.test_assert((public.display_next_request()).song_title='Second','next approved request becomes live');
select public.display_next_request();
select public.test_assert((select count(*)=1 from public.radio_requests where status='now_playing'),'empty queue preserves current live request');
select public.test_assert((select status='completed' from public.radio_requests where song_title='First'),'previous request completed');
select public.test_denied($q$select public.moderate_request((select id from public.radio_requests where song_title='First'),'approved')$q$,'23514');
select public.moderate_request((select id from public.radio_requests where song_title='Second'),'completed');
select public.test_assert((select count(*)=0 from public.radio_requests where status='now_playing'),'finish removes live popup');

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
insert into public.radio_requests(user_id,song_title,artist,message)
 values(auth.uid(),'Completed requests do not block new ones','Artist','Message');
select public.test_assert((select count(*)=4 from public.radio_requests),'completed requests do not limit new submissions');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
insert into public.radio_requests(user_id,song_title,artist,message)
 values(auth.uid(),'Replacement','Artist','Message');
select public.test_assert((select count(*)=2 from public.radio_requests where status<>'rejected'),'new submissions allowed alongside rejected ones');

set local role anon;
select public.test_denied('select * from public.radio_requests','42501');
select public.test_denied('select public.display_next_request()','42501');
select public.test_denied('select public.has_discord_identity()','42501');
reset role;
rollback;
\echo 'Database authorization, unlimited requests, transitions and FIFO assertions passed.'
