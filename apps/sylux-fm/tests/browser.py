"""Browser integration tests with synthetic Supabase responses, never real accounts.

Requires Python Playwright and Chromium. Starts an isolated copy of the app on
port 3001 and a local auth/data fixture on 54321. No production env is copied.
Set SYLUX_BROWSER_TEST_MODE=invalid-config to reproduce a key in the URL field.
"""
import base64
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[1]
invalid_config = os.environ.get("SYLUX_BROWSER_TEST_MODE") == "invalid-config"
origin = "http://127.0.0.1:3001"
member = "00000000-0000-0000-0000-000000000001"
host = "00000000-0000-0000-0000-000000000002"
secret = "browser-test-key-" + "x" * 32
requests = []
calls = []
lock = threading.Lock()


def session(uid):
    user = {"id": uid, "aud": "authenticated", "role": "authenticated",
            "email": "test@example.invalid", "created_at": "2026-01-01T00:00:00Z",
            "app_metadata": {"provider": "discord", "providers": ["discord"]},
            "user_metadata": {"full_name": "listener_handle", "name": "Test Display"},
            "identities": [{"id": uid, "user_id": uid, "provider": "discord", "identity_data": {}}]}
    expiry = int(time.time()) + 3600
    payload = base64.urlsafe_b64encode(json.dumps({"sub": uid, "exp": expiry, "iat": expiry-3600,
        "aud": "authenticated", "role": "authenticated"}).encode()).decode().rstrip("=")
    return {"access_token": "eyJhbGciOiJIUzI1NiJ9." + payload + ".test",
            "refresh_token": "test-refresh", "expires_at": expiry, "expires_in": 3600,
            "token_type": "bearer", "user": user}


def row(index, status):
    return {"id": f"10000000-0000-0000-0000-{index:012d}", "user_id": member,
            "username": "Handle for legacy", "display_name": "Test Display", "is_anonymous": False, "song_title": f"Song {index}", "artist": "Artist",
            "message": "<script>alert('text only')</script>", "dedication_to": "Community",
            "status": status, "created_at": f"2026-01-01T00:00:0{index}Z",
            "updated_at": f"2026-01-01T00:00:0{index}Z"}


class Fixture(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def respond(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Headers", self.headers.get("Access-Control-Request-Headers",
            "authorization,apikey,content-type,x-client-info,x-supabase-api-version,prefer"))
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self.respond(None)

    def do_GET(self):
        if self.path.startswith("/auth/v1/user"):
            token = self.headers.get("Authorization", "").removeprefix("Bearer ")
            try:
                encoded = token.split(".")[1]
                uid = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))["sub"]
                self.respond(session(uid)["user"])
            except (ValueError, KeyError, IndexError):
                self.respond({"message": "Unauthorized"}, 401)
        elif self.path.startswith("/rest/v1/radio_requests"):
            params = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            with lock:
                data = [dict(item) for item in requests]
            for field in ("user_id", "status"):
                value = params.get(field, [""])[0]
                if value.startswith("eq."):
                    data = [item for item in data if item[field] == value[3:]]
            fields = params.get("select", ["*"])[0]
            if fields != "*":
                data = [{field: item[field] for field in fields.split(",")} for item in data]
            self.respond(data)
        else:
            self.respond({"message": "Unknown fixture endpoint"}, 404)

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))) or "{}")
        with lock:
            calls.append((self.path, body))
            if self.path == "/rest/v1/rpc/is_operator":
                result = body.get("_uid") == host
            elif self.path == "/rest/v1/rpc/moderate_request":
                item = next(item for item in requests if item["id"] == body["request_id"])
                item["status"] = body["next_status"]
                result = None
            elif self.path == "/rest/v1/rpc/display_next_request":
                approved = sorted((item for item in requests if item["status"] == "approved"),
                                  key=lambda item: (item["created_at"], item["id"]))
                result = approved[0] if approved else None
                if result:
                    for item in requests:
                        if item["status"] == "now_playing":
                            item["status"] = "completed"
                    result["status"] = "now_playing"
            elif self.path == "/rest/v1/radio_requests":
                item = {**row(len(requests)+1, "pending"), **body}
                requests.append(item)
                result = None
            elif self.path.startswith("/auth/v1/logout"):
                result = None
            else:
                self.respond({"message": "Unknown fixture endpoint"}, 404)
                return
            self.respond(result)


def signed_context(browser, uid):
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, permissions=["clipboard-read", "clipboard-write"])
    value = "base64-" + base64.urlsafe_b64encode(json.dumps(session(uid)).encode()).decode().rstrip("=")
    context.add_cookies([{"name": "sb-127-auth-token", "value": value, "url": origin}])
    return context


server = ThreadingHTTPServer(("127.0.0.1", 54321), Fixture)
threading.Thread(target=server.serve_forever, daemon=True).start()
with tempfile.TemporaryDirectory(prefix="sylux-browser-") as temp:
    directory = Path(temp)
    for name in ("src", "public", "package.json", "next.config.ts", "tsconfig.json", "next-env.d.ts"):
        source = root / name
        if source.is_dir():
            shutil.copytree(source, directory/name)
        else:
            shutil.copy2(source, directory/name)
    (directory/"node_modules").symlink_to(root/"node_modules", target_is_directory=True)
    env = os.environ.copy()
    env.update({"NEXT_PUBLIC_SUPABASE_URL": "sb_publishable_test_key" if invalid_config else "http://127.0.0.1:54321",
                "NEXT_PUBLIC_SUPABASE_ANON_KEY": "test-anon-key",
                "SUPABASE_SERVICE_ROLE_KEY": "test-service-key", "OVERLAY_VIEW_KEY": secret})
    with (directory/"server.log").open("w+") as log:
        process = subprocess.Popen(["node", str(root/"node_modules/next/dist/bin/next"), "dev",
            "--hostname", "127.0.0.1", "--port", "3001"], cwd=directory, env=env,
            stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            for _ in range(100):
                if process.poll() is not None:
                    raise RuntimeError("Test app exited during startup")
                try:
                    with urllib.request.urlopen(origin+"/request", timeout=2) as response:
                        if response.status == 200:
                            break
                except (urllib.error.URLError, TimeoutError):
                    time.sleep(0.5)
            else:
                raise RuntimeError("Test app did not start")

            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True,
                    args=["--no-sandbox"])
                if invalid_config:
                    context = browser.new_context()
                    page = context.new_page()
                    for path in ['/request', '/admin']:
                        response = page.goto(origin+path)
                        assert response.status == 200
                        expect(page.get_by_role("button", name="Continue with Discord")).to_be_disabled()
                        expect(page.locator(".notice.error")).to_be_visible()
                    response = context.request.get(origin+"/auth/callback?code=invalid-test-code", max_redirects=0)
                    assert response.status == 307
                    destination = urllib.parse.urlsplit(response.headers["location"])
                    assert destination.path == "/request" and destination.query == "error=auth"
                    assert destination.hostname in ("127.0.0.1", "localhost")
                    response = context.request.get(origin+"/api/overlay", headers={"x-overlay-key": secret})
                    assert response.status == 503
                    assert response.headers["cache-control"] == "no-store"
                    response = context.request.get(origin+"/api/overlay")
                    assert response.status == 401
                    assert calls == []
                    context.close()
                    browser.close()
                    print("PASS: malformed Supabase URL cannot crash member/admin pages, OAuth callback or OBS API; login stays disabled", flush=True)
                else:
                    context = browser.new_context()
                    page = context.new_page()
                    page.goto(origin+"/request")
                    expect(page.get_by_role("button", name="Continue with Discord")).to_be_enabled()
                    page.goto(origin+"/admin")
                    expect(page.get_by_role("heading", name="Operator sign in")).to_be_visible()
                    response = context.request.get(origin+"/api/operator/overlay-link")
                    assert response.status == 401 and "path" not in response.json()
                    context.close()
                    print("PASS: logged-out pages and no private OBS link for anonymous users", flush=True)

                    context = signed_context(browser, member)
                    page = context.new_page()
                    response = context.request.get(origin+"/api/operator/overlay-link?user_id="+host)
                    assert response.status == 403 and "path" not in response.json()
                    page.goto(origin+"/admin")
                    expect(page.get_by_role("heading", name="Access restricted")).to_be_visible(timeout=20000)
                    page.goto(origin+"/request")
                    expect(page.get_by_text("0 sent")).to_be_visible()
                    expect(page.get_by_text("Test Display", exact=True)).to_be_visible()
                    for index in (1, 2, 3):
                        page.get_by_label("Song title").fill(f"Member song {index}")
                        page.get_by_label("Artist", exact=False).fill("Artist")
                        page.get_by_label("Your message").fill("A dedication")
                        if index == 2:
                            page.get_by_label("Anonim").check()
                        else:
                            page.get_by_label("Tampilkan nama").check()
                        page.get_by_role("button", name="Send dedication").click()
                        expect(page.get_by_text(f"{index} sent")).to_be_visible()
                    expect(page.get_by_role("button", name="Send dedication")).to_be_visible()
                    submitted = [body for path, body in calls if path == "/rest/v1/radio_requests"]
                    assert len(submitted) == 3
                    assert [body["is_anonymous"] for body in submitted] == [False, True, False]
                    assert all("username" not in body and "status" not in body for body in submitted)
                    context.close()
                    print("PASS: member gate, unlimited submissions and server-owned columns", flush=True)

                    with lock:
                        requests[:] = [row(1, "pending"), row(2, "approved")]
                    context = signed_context(browser, host)
                    page = context.new_page()
                    page.goto(origin+"/admin")
                    expect(page.get_by_role("button", name="Approve", exact=True)).to_be_visible(timeout=20000)
                    response = context.request.get(origin+"/api/operator/overlay-link")
                    assert response.status == 200
                    assert "no-store" in response.headers["cache-control"]
                    path = response.json()["path"]
                    assert urllib.parse.parse_qs(urllib.parse.urlsplit(path).query)["key"] == [secret]
                    assert "test-service-key" not in response.text()
                    page.get_by_role("button", name="Salin URL OBS").click()
                    expect(page.get_by_text("URL OBS berhasil disalin.", exact=False)).to_be_visible()
                    assert page.evaluate("navigator.clipboard.readText()") == origin+path
                    page.get_by_role("button", name="Approve", exact=True).click()
                    expect(page.locator(".approved-entry")).to_have_count(2)
                    page.get_by_role("button", name="Display next approved request").click()
                    expect(page.locator(".active-request h3")).to_have_text("Song 1")
                    expect(page.locator(".approved-entry")).to_have_count(1)
                    page.get_by_role("button", name="Finish", exact=True).click()
                    expect(page.locator(".active-request")).to_have_count(0)
                    assert any(path.endswith("/moderate_request") for path, _ in calls)
                    context.close()
                    print("PASS: operator moderation, FIFO display and Finish", flush=True)

                    context = browser.new_context(viewport={"width": 1920, "height": 1080})
                    page = context.new_page()
                    page.goto(origin+"/overlay?key=wrong-key")
                    expect(page.locator(".overlay-warning")).to_contain_text("Kunci OBS tidak cocok")
                    sound = context.request.get(origin+"/love-alarm-notification.mp3")
                    assert sound.status == 200
                    assert "audio/mpeg" in sound.headers.get("content-type", "")
                    assert sound.body().startswith(b"ID3")
                    page.goto(origin+"/overlay?preview=1")
                    expect(page.locator(".overlay-card")).to_have_class("overlay-card overlay-visible")
                    expect(page.get_by_text("SYLUX FM", exact=True)).to_be_visible()
                    expect(page.locator(".overlay-window")).to_have_count(1)
                    expect(page.get_by_text("SONG REQUEST")).to_be_visible()
                    expect(page.locator(".overlay-content h1")).to_have_text("Mellie")
                    expect(page.locator(".overlay-song-title")).to_have_text("Those Eyes")
                    expect(page.locator(".overlay-to")).to_be_visible()
                    assert float(page.locator(".overlay-message").evaluate("(el) => getComputedStyle(el).fontSize").removesuffix("px")) >= 33
                    assert float(page.locator(".overlay-to").evaluate("(el) => getComputedStyle(el).fontSize").removesuffix("px")) >= 30
                    assert page.evaluate("getComputedStyle(document.body).backgroundColor") == "rgba(0, 0, 0, 0)"
                    page.goto(origin+"/overlay?preview=anonymous")
                    expect(page.locator(".overlay-content h1")).to_have_text("Anonymous")
                    assert page.locator("audio,video").count() == 0
                    response = context.request.get(origin+"/api/overlay")
                    assert response.status == 401
                    assert response.headers["cache-control"] == "no-store"
                    response = context.request.get(origin+"/api/overlay", headers={"x-overlay-key": secret})
                    assert response.status == 200 and response.json() == {"active": None}
                    assert response.headers["referrer-policy"] == "no-referrer"
                    with lock:
                        requests[:] = [row(3, "now_playing")]
                    page.goto(origin+"/overlay?key="+secret)
                    expect(page.locator(".overlay-card")).to_have_class("overlay-card overlay-visible")
                    expect(page.locator(".overlay-song-title")).to_have_text("Song 3")
                    expect(page.locator(".overlay-message")).to_contain_text("<script>")
                    response = context.request.get(origin+"/api/overlay", headers={"x-overlay-key": secret})
                    assert "user_id" not in response.json()["active"]
                    assert "username" not in response.json()["active"]
                    assert response.json()["active"]["display_name"] == "Test Display"
                    expect(page.locator(".overlay-card")).to_have_class("overlay-card ", timeout=15000)
                    page.wait_for_timeout(3300)
                    expect(page.locator(".overlay-card")).to_have_class("overlay-card ")
                    with lock:
                        requests[:] = [row(4, "now_playing")]
                    response = context.request.get(origin+"/api/overlay", headers={"x-overlay-key": secret})
                    assert response.status == 200
                    assert response.json()["active"]["song_title"] == "Song 4", response.json()
                    expect(page.locator(".overlay-song-title")).to_have_text("Song 4", timeout=10000)
                    expect(page.locator(".overlay-card")).to_have_class("overlay-card overlay-visible")
                    with lock:
                        requests[0]["status"] = "completed"
                    expect(page.locator(".overlay-card")).to_have_class("overlay-card ", timeout=5000)
                    context.close()
                    browser.close()
                    print("PASS: transparent OBS, live API popup, 12-second fade, no replay, replacement, Finish and key/cache headers", flush=True)
        except BaseException:
            log.flush()
            log.seek(0)
            print(log.read()[-5000:])
            raise
        finally:
            os.killpg(process.pid, signal.SIGTERM)
            process.wait(timeout=20)
            server.shutdown()
