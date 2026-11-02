"""Exercise real PostgreSQL locks via independent psql sessions in a test container.

Usage: python3 tests/concurrency.py sylux-fm-tests
Creates and drops its own empty database. Requires a local Docker postgres image
running as a disposable test container; never pass a production container.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import os
import re
import subprocess
import sys
import threading
import uuid


container = sys.argv[1] if len(sys.argv) == 2 else "sylux-fm-tests"
if not re.fullmatch(r"[a-zA-Z0-9_.-]+", container):
    raise SystemExit("Invalid test container name")
database = "sylux_race_" + uuid.uuid4().hex
root = Path(__file__).resolve().parents[1]
env = os.environ.copy()
for selector in ("DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"):
    env.pop(selector, None)
member = "00000000-0000-0000-0000-000000000001"
host = "00000000-0000-0000-0000-000000000002"


def sql(statement, db=database, check=True):
    result = subprocess.run(
        ["docker", "--host=unix:///var/run/docker.sock", "exec", "-i", container,
         "psql", "-U", "postgres", "-d", db, "-X", "-qAt", "-v", "ON_ERROR_STOP=1",
         "-v", "VERBOSITY=verbose"],
        input=statement, text=True, capture_output=True, env=env,
    )
    if check and result.returncode:
        raise RuntimeError(result.stderr)
    return result


def session(uid, statement):
    return (f"begin; set local role authenticated; "
            f"select set_config('request.jwt.claim.sub','{uid}',true); "
            f"{statement}; select pg_sleep(0.15); commit;")


def parallel(statements):
    barrier = threading.Barrier(len(statements))

    def run(statement):
        barrier.wait(timeout=20)
        return sql(statement, check=False)

    with ThreadPoolExecutor(max_workers=len(statements)) as pool:
        return list(pool.map(run, statements))


sql(f'create database "{database}";', db="postgres")
try:
    sql((root / "tests/fixtures/auth.sql").read_text()
        + (root / "supabase/schema.sql").read_text()
        + f"""
        insert into auth.users values ('{member}'),('{host}');
        insert into auth.identities values
          ('member','{member}','discord','{{"full_name":"Listener"}}'),
          ('host','{host}','discord','{{"full_name":"Host"}}');
        insert into public.radio_operators(user_id) values ('{host}');
        """)
    for iteration in range(5):
        sql("truncate public.radio_requests;")
        submissions = [session(member,
            "insert into public.radio_requests(user_id,song_title,artist,message) "
            f"values(auth.uid(),'Concurrent {i}','Artist','Message')") for i in range(3)]
        results = parallel(submissions)
        assert sum(result.returncode == 0 for result in results) == 2, [r.stderr for r in results]
        assert sum("23514" in result.stderr for result in results) == 1, [r.stderr for r in results]
        assert sql("select count(*) from public.radio_requests;").stdout.strip() == "2"
        sql(session(host, "select public.moderate_request(id,'approved') from public.radio_requests"))
        results = parallel([session(host, "select public.display_next_request()") for _ in range(2)])
        assert all(result.returncode == 0 for result in results), [r.stderr for r in results]
        counts = sql("select status,count(*) from public.radio_requests group by status order by status;").stdout.strip()
        assert counts == "completed|1\nnow_playing|1", counts
        print(f"Round {iteration + 1}: 3 simultaneous submissions -> 2 accepted, 1 quota rejection; "
              "2 simultaneous Display Next -> 1 active, 1 completed.", flush=True)
finally:
    sql(f'drop database "{database}" with (force);', db="postgres")
