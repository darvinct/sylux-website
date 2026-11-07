import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authDestination } from '../src/lib/auth-redirect.ts';
import { parseOverlayPayload, POPUP_DURATION_MS } from '../src/lib/overlay.ts';
import { createPopup } from '../src/lib/popup.ts';
import { hasOverlayAccess } from '../src/lib/overlay-access.ts';
import { getSupabaseConfig } from '../src/lib/supabase/config.ts';
import { isPublicSupabaseKey } from '../src/lib/overlay-service.ts';
import { overlayErrorMessage } from '../src/lib/overlay-errors.ts';
import { publicSenderName } from '../src/lib/requests.ts';

const item = { id: 'one', display_name: 'Listener', is_anonymous: false, song_title: 'Song', artist: 'Artist',
  dedication_to: null, message: '<script>alert(1)</script>', updated_at: '2026-11-02T00:00:00Z' };

test('OBS server configuration identifies public keys without granting trust to JWT claims', () => {
  const token = role => `test.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.test`;
  assert.equal(isPublicSupabaseKey('sb_publishable_test'), true);
  assert.equal(isPublicSupabaseKey(token('anon')), true);
  assert.equal(isPublicSupabaseKey(token('service_role')), false);
  assert.equal(isPublicSupabaseKey('sb_secret_test'), false);
  assert.equal(isPublicSupabaseKey('malformed'), false);
});

test('OBS distinguishes a bad source key from server and database configuration failures', () => {
  assert.match(overlayErrorMessage(401), /Kunci OBS tidak cocok/);
  assert.match(overlayErrorMessage(503, 'OVERLAY_KEY_NOT_CONFIGURED'), /32 karakter/);
  assert.match(overlayErrorMessage(503, 'OVERLAY_SERVICE_ROLE_REQUIRED'), /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(overlayErrorMessage(500), /Supabase/);
  assert.match(overlayErrorMessage(0), /Koneksi/);
  assert.doesNotMatch(overlayErrorMessage(503, '<private-error-details>'), /private-error-details/);
});

test('Supabase configuration rejects keys in the URL field and unsafe URLs without throwing', () => {
  for (const url of [undefined, '', 'sb_publishable_test_key', 'project.supabase.co',
    'NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co', 'file:///tmp/config',
    'javascript:alert(1)', 'https://user:password@project.supabase.co',
    'https://project.supabase.co?apikey=private', 'https://project.supabase.co/#token']) {
    assert.equal(getSupabaseConfig(url, 'test-anon-key'), null);
  }
  assert.equal(getSupabaseConfig('https://project.supabase.co', '  '), null);
  assert.equal(getSupabaseConfig('https://project.supabase.co', undefined), null);
  assert.deepEqual(getSupabaseConfig(' https://project.supabase.co/ ', ' test-key '),
    { url: 'https://project.supabase.co', key: 'test-key' });
  assert.deepEqual(getSupabaseConfig('http://127.0.0.1:54321/', 'test-key'),
    { url: 'http://127.0.0.1:54321', key: 'test-key' });
});

test('OBS secret authorization fails closed and handles different byte lengths', () => {
  const key = 'test-only-' + 'x'.repeat(32);
  assert.equal(hasOverlayAccess(key, key), true);
  for (const [received, expected] of [['', ''], ['short', 'short'], ['', key],
    [key + 'x', key], ['y' + key.slice(1), key], ['é'.repeat(key.length), key]]) {
    assert.equal(hasOverlayAccess(received, expected), false);
  }
});

test('OAuth accepts only application destinations, including hostile URL parser inputs', () => {
  assert.equal(authDestination('/admin'), '/admin');
  for (const input of [null, '/request', '//evil.example', '/\\evil.example',
    '/\t/evil.example', 'https://evil.example', '/%5cevil.example', '/admin?next=//evil.example']) {
    assert.equal(authDestination(input), '/request');
    assert.equal(new URL(authDestination(input), 'https://fm.example').origin, 'https://fm.example');
  }
});

test('OBS accepts standby and complete requests; rejects malformed payloads', () => {
  assert.equal(parseOverlayPayload({ active: null }), null);
  assert.deepEqual(parseOverlayPayload({ active: item }), item);
  for (const payload of [null, {}, { active: [] }, { active: 'hello' },
    { active: { ...item, message: null } }, { active: { ...item, is_anonymous: "true" } },
    { active: { ...item, dedication_to: {} } },
    { active: { ...item, display_name: null, username: 'Old Handle' } }]) {
    assert.throws(() => parseOverlayPayload(payload));
  }
});

function fixture(onVisible = () => {}) {
  let now = 0, sequence = 0;
  const timers = new Map();
  const shown = [], visibility = [];
  const popup = createPopup(value => shown.push(value), value => visibility.push(value),
    (callback, delay) => { const id = ++sequence; timers.set(id, { at: now + delay, callback }); return id; },
    id => timers.delete(id), onVisible);
  function advance(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      now = next[1].at; timers.delete(next[0]); next[1].callback();
    }
    now = end;
  }
  return { popup, shown, visibility, timers, advance };
}

test('OBS displays once, fades after 40 seconds, and ignores repeated polling', () => {
  assert.equal(POPUP_DURATION_MS, 40_000);
  const f = fixture();
  f.popup.display(item); f.advance(90);
  assert.equal(f.visibility.at(-1), true);
  f.advance(2000); f.popup.display(item);
  assert.equal(f.shown.length, 1);
  f.advance(POPUP_DURATION_MS - 2090);
  assert.equal(f.visibility.at(-1), false);
  f.popup.display(item); f.advance(1000);
  assert.equal(f.visibility.at(-1), false);
});

test('OBS cancels entrance on standby, cleanup or failure; a new request replaces old timers', () => {
  const f = fixture();
  f.popup.display(item); f.popup.display(null); f.advance(100);
  assert.equal(f.visibility.at(-1), false);
  assert.equal(f.timers.size, 0);
  f.popup.display(item); f.advance(90);
  f.popup.display({ ...item, id: 'two' }); f.advance(90);
  assert.equal(f.shown.at(-1).id, 'two');
  f.popup.clear(); f.advance(20_000);
  assert.equal(f.visibility.at(-1), false);
  assert.equal(f.timers.size, 0);
});

test('OBS notification rings once per visible request, not on repeated API polls', () => {
  const played = [];
  const f = fixture(current => played.push(current.id));
  f.popup.display(item);
  f.advance(89);
  assert.deepEqual(played, []);
  f.advance(1);
  assert.deepEqual(played, ['one']);
  f.popup.display(item); f.advance(8_000);
  assert.deepEqual(played, ['one']);
  f.popup.display({ ...item, id: 'two' }); f.advance(90);
  assert.deepEqual(played, ['one', 'two']);
  f.popup.display(null);
  f.popup.display({ ...item, id: 'three' });
  f.popup.clear();
  f.advance(200);
  assert.deepEqual(played, ['one', 'two']);
});

test('OBS treats a new updated_at as a new broadcast', () => {
  const f = fixture();
  f.popup.display(item); f.advance(POPUP_DURATION_MS);
  f.popup.display({ ...item, updated_at: '2026-11-02T00:01:00Z' }); f.advance(90);
  assert.equal(f.shown.length, 2);
  assert.equal(f.visibility.at(-1), true);
});


test('anonymous display never discloses the real sender name', () => {
  assert.equal(publicSenderName({ display_name: 'Hidden identity', is_anonymous: true }), 'Anonymous');
  assert.equal(publicSenderName({ display_name: 'Actual Display Name', is_anonymous: false }), 'Actual Display Name');
  assert.equal(publicSenderName({ display_name: 'Discord Display', username: 'discord.handle', is_anonymous: false }), 'Discord Display');
  assert.deepEqual(parseOverlayPayload({ active: { ...item, is_anonymous: true, display_name: 'Anonymous' } }),
    { ...item, is_anonymous: true, display_name: 'Anonymous' });
});
