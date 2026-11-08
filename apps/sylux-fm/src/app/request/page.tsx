"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Disc3, RadioTower, Headphones, ArrowUpRight, LogOut, Send, Clock3 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { RadioRequest } from "@/lib/requests";

const initialForm = { song_title: "", artist: "", dedication_to: "", message: "", is_anonymous: false };

export default function RequestPage() {
  const [db, setDb] = useState<ReturnType<typeof createClient> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RadioRequest[]>([]);
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const currentUserId = useRef<string | null>(null);
  const reloadSequence = useRef(0);

  useEffect(() => {
    let alive = true;
    try {
      const client = createClient();
      setDb(client);
      function acceptUser(next: User | null) {
        if (!alive) return;
        if (currentUserId.current !== (next?.id ?? null)) { setRequests([]); setNotice(""); }
        currentUserId.current = next?.id ?? null;
        setUser(next);
      }
      let authChanged = false;
      void client.auth.getUser().then(({ data }) => {
        if (!authChanged) acceptUser(data.user);
      });
      const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
        authChanged = true;
        acceptUser(session?.user ?? null);
      });
      return () => { alive = false; subscription.subscription.unsubscribe(); };
    } catch {
      setError("Konfigurasi Supabase belum tersedia. Isi environment variables terlebih dahulu.");
    }
  }, []);

  const reload = useCallback(async () => {
    const sequence = ++reloadSequence.current;
    if (!db || !user) { setRequests([]); return; }
    const { data, error: fetchError } = await db.from("radio_requests")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (sequence !== reloadSequence.current || currentUserId.current !== user.id) return;
    if (fetchError) setError(fetchError.message);
    else { setError(""); setRequests((data ?? []) as RadioRequest[]); }
  }, [db, user]);

  useEffect(() => {
    void reload();
    const timer = setInterval(() => { void reload(); }, 5000);
    return () => clearInterval(timer);
  }, [reload]);

  const displayName = String(user?.user_metadata?.global_name || user?.user_metadata?.display_name || user?.user_metadata?.name || "SYLUX Listener");

  async function login() {
    if (!db) return;
    setError("");
    const { error: loginError } = await db.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin + "/auth/callback?next=/request" }
    });
    if (loginError) setError(loginError.message);
  }

  async function logout() {
    if (!db) return;
    await db.auth.signOut();
    setRequests([]);
    setUser(null);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db || !user || busy) return;
    if (!form.song_title.trim() || !form.artist.trim() || !form.message.trim()) {
      setError("Judul, artis, dan pesan tidak boleh kosong.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    const { error: submitError } = await db.from("radio_requests").insert({
      user_id: user.id,
      song_title: form.song_title.trim(),
      artist: form.artist.trim(),
      dedication_to: form.dedication_to.trim() || null,
      message: form.message.trim(),
      is_anonymous: form.is_anonymous
    });
    if (submitError) {
      setError(submitError.message);
    } else {
      setNotice("Request berhasil masuk ke antrean. Tunggu persetujuan operator.");
      setForm(initialForm);
      await reload();
    }
    setBusy(false);
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand"><span className="brand-icon"><RadioTower size={18}/></span> SYLUX<span className="accent">AIRWAVES</span></div>
        <div className="header-links"><span className="live-pill"><i/> YOUR SONG, YOUR STORY</span><Link href="/admin" className="subtle-link">Operator <ArrowUpRight size={14}/></Link></div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="tiny-line"/> A LITTLE NOTE, A LOT OF FEELING</div>
        <h1>Let your feelings <em>find the airwaves.</em></h1>
        <p>Setiap lagu punya ceritanya sendiri. Pilih lagu favoritmu, tulis pesan untuk seseorang, dan biarkan ceritamu mengudara bersama SYLUX AIRWAVES.</p>
      </section>

      <div className="content-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">01 / SEND YOUR STORY</div><h2>A Song & A Little Note</h2></div>
            <div className="round-icon"><Disc3 size={22}/></div>
          </div>
          {user ? (
            <>
              <div className="user-bar"><div><small>LOGGED IN AS</small><strong>{displayName}</strong></div><button type="button" className="text-button" onClick={logout}><LogOut size={14}/> Sign out</button></div>
              <div className="quota">
                <div><small>YOUR REQUESTS</small><strong>{requests.length} sent</strong></div>
                <span>Unlimited submissions</span>
              </div>
              <form onSubmit={submit}>
                  <div className="field-row">
                    <label>Song title <span>*</span><input required maxLength={120} value={form.song_title} onChange={e => setForm({ ...form, song_title:e.target.value })} placeholder="e.g. Those Eyes"/></label>
                    <label>Artist <span>*</span><input required maxLength={120} value={form.artist} onChange={e => setForm({ ...form, artist:e.target.value })} placeholder="e.g. New West"/></label>
                  </div>
                  <label>Dedicated to <small>(OPTIONAL)</small><input maxLength={64} value={form.dedication_to} onChange={e => setForm({ ...form, dedication_to:e.target.value })} placeholder="Someone special, your best friend..."/></label>
                  <label>Your message <span>*</span><textarea required minLength={1} maxLength={500} rows={5} value={form.message} onChange={e => setForm({ ...form, message:e.target.value })} placeholder="Your words will be read live on air..."/></label>
                  <fieldset className="identity-choice">
                    <legend>IDENTITAS PENGIRIM</legend>
                    <div className="identity-options">
                      <label className={"identity-option " + (!form.is_anonymous ? "identity-selected" : "")}>
                        <input type="radio" name="sender-visibility" checked={!form.is_anonymous} onChange={() => setForm({ ...form, is_anonymous: false })}/>
                        <span><strong>Tampilkan nama</strong><small>{displayName}</small></span>
                      </label>
                      <label className={"identity-option " + (form.is_anonymous ? "identity-selected" : "")}>
                        <input type="radio" name="sender-visibility" checked={form.is_anonymous} onChange={() => setForm({ ...form, is_anonymous: true })}/>
                        <span><strong>Anonim</strong><small>Nama disembunyikan saat siaran</small></span>
                      </label>
                    </div>
                    <p>Kalau anonim, penonton cuma lihat “Anonymous”. Operator tetap bisa melihat pengirim untuk moderasi.</p>
                  </fieldset>
                  <div className="form-bottom"><span>{form.message.length} / 500 characters</span><span>Free · Unlimited requests</span></div>
                  <button className="primary-button" type="submit" disabled={busy}><Send size={17}/>{busy ? "Submitting..." : "Send dedication"}<ArrowUpRight size={17}/></button>
              </form>
            </>
          ) : (
            <div className="login-panel">
              <Headphones size={30}/>
              <h3>Tune in with Discord</h3>
              <p>Masuk melalui Discord untuk mengirim request lagu dan pesan dedikasi tanpa batas jumlah pengiriman.</p>
              <button className="primary-button" onClick={login} disabled={!db}>Continue with Discord <ArrowUpRight size={17}/></button>
            </div>
          )}
          {notice && <div role="status" className="notice success">{notice}</div>}
          {error && <div role="alert" className="notice error">{error}</div>}
        </section>

        <aside className="sidebar">
          <div className="panel secondary-panel">
            <div className="eyebrow">NOW TUNING IN</div>
            <div className="station-art"><RadioTower size={52} strokeWidth={1}/><div className="frequency">AIR<span>WAVES</span></div><div className="frequency-caption">YOUR SONG · YOUR STORY</div></div>
            <div className="sidebar-footer"><span><i className="status-dot"/> ON AIR</span><span>WHERE STORIES FIND A FREQUENCY</span></div>
          </div>
          <div className="panel info-panel">
            <div className="eyebrow">HOW IT WORKS</div>
            <div className="info-item"><span>01</span><p>Sign in with Discord and fill in your song request.</p></div>
            <div className="info-item"><span>02</span><p>Operator checks and approves your message.</p></div>
            <div className="info-item"><span>03</span><p>Host reads it on air and plays the song manually.</p></div>
            <div className="info-foot"><Clock3 size={15}/> Requests are played as airtime allows.</div>
          </div>
          {user && requests.length > 0 && <div className="panel info-panel">
            <div className="eyebrow">YOUR SUBMISSIONS</div>
            {requests.map(r => <div className="my-request" key={r.id}><strong>{r.song_title}</strong><span>{r.artist}</span><span className={"status-tag "+r.status}>{r.is_anonymous ? "Anonim · " : ""}{r.status.replace("_", " ")}</span></div>)}
          </div>}
        </aside>
      </div>
      <footer className="site-footer"><span>© SYLUX AIRWAVES · YOUR SONG, YOUR STORY</span><span>Made for the community.</span></footer>
    </main>
  );
}

