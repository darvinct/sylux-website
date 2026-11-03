import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authDestination } from '../src/lib/auth-redirect.ts';
import { parseOverlayPayload, POPUP_DURATION_MS } from '../src/lib/overlay.ts';
import { createPopup } from '../src/lib/popup.ts';
import { hasOverlayAccess } from '../src/lib/overlay-access.ts';
import { getSupabaseConfig } from '../src/lib/supabase/config.ts';

const item = { id: 'one', username: 'Listener', song_title: 'Song', artist: 'Artist',
  dedication_to: null, message: '<script>alert(1)</script>', updated_at: '2026-11-02T00:00:00Z' };

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
    { active: { ...item, message: null } }, { active: { ...item, dedication_to: {} } }]) {
    assert.throws(() => parseOverlayPayload(payload));
  }
});

function fixture() {
  let now = 0, sequence = 0;
  const timers = new Map();
  const shown = [], visibility = [];
  const popup = createPopup(value => shown.push(value), value => visibility.push(value),
    (callback, delay) => { const id = ++sequence; timers.set(id, { at: now + delay, callback }); return id; },
    id => timers.delete(id));
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

test('OBS displays once, fades after 12 seconds, and ignores repeated polling', () => {
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

test('OBS treats a new updated_at as a new broadcast', () => {
  const f = fixture();
  f.popup.display(item); f.advance(POPUP_DURATION_MS);
  f.popup.display({ ...item, updated_at: '2026-11-02T00:01:00Z' }); f.advance(90);
  assert.equal(f.shown.length, 2);
  assert.equal(f.visibility.at(-1), true);
});
