"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RadioTower, LogOut, Play, Check, X, Square, RefreshCw, ArrowUpRight, Copy } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { publicSenderName, type RadioRequest } from "@/lib/requests";

export default function AdminPage() {
  const [db, setDb] = useState<ReturnType<typeof createClient> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<RadioRequest[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [obsBusy, setObsBusy] = useState(false);
  const [obsLink, setObsLink] = useState("");
  const [obsNotice, setObsNotice] = useState("");

  const currentUserId = useRef<string | null>(null);
  const reloadSequence = useRef(0);

  useEffect(() => {
    let alive = true;
    try {
      const client = createClient();
      setDb(client);
      function acceptUser(next: User | null) {
        if (!alive) return;
        if (currentUserId.current !== (next?.id ?? null)) {
          setRows([]); setAllowed(false); setObsLink(""); setObsNotice("");
        }
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
      setError("Supabase belum dikonfigurasi.");
    }
  }, []);

  const reload = useCallback(async () => {
    const sequence = ++reloadSequence.current;
    if (!db || !user) { setAllowed(false); setRows([]); return; }
    const { data: isAdmin, error: roleError } = await db.rpc("is_operator", { _uid: user.id });
    if (sequence !== reloadSequence.current || currentUserId.current !== user.id) return;
    if (roleError || !isAdmin) { setAllowed(false); setRows([]); setObsLink(""); setObsNotice(""); return; }
    setAllowed(true);
    const { data, error: fetchError } = await db.from("radio_requests").select("*")
      .order("created_at", { ascending: true }).order("id", { ascending: true });
    if (sequence !== reloadSequence.current || currentUserId.current !== user.id) return;
    if (fetchError) setError(fetchError.message);
    else { setError(""); setRows((data || []) as RadioRequest[]); }
  }, [db, user]);

  useEffect(() => {
    void reload();
    const timer = setInterval(() => { void reload(); }, 5000);
    return () => clearInterval(timer);
  }, [reload]);

  async function login() {
    if (!db) return;
    const { error: loginError } = await db.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin + "/auth/callback?next=/admin" }
    });
    if (loginError) setError(loginError.message);
  }

  async function logout() {
    if (!db) return;
    await db.auth.signOut();
    setUser(null); setAllowed(false); setRows([]); setObsLink(""); setObsNotice("");
  }

  async function copyObsLink() {
    if (!allowed || !user || obsBusy) return;
    const userId = user.id;
    setObsBusy(true); setObsNotice(""); setObsLink("");
    try {
      const response = await fetch("/api/operator/overlay-link", { cache: "no-store" });
      const data = await response.json();
      if (currentUserId.current !== userId) return;
      if (!response.ok) throw new Error(data.error || "URL OBS belum tersedia.");
      if (typeof data.path !== "string") throw new Error("URL OBS belum tersedia.");
      const url = new URL(data.path, window.location.origin);
      if (url.origin !== window.location.origin || url.pathname !== "/overlay") {
        throw new Error("URL OBS tidak valid.");
      }
      try {
        await navigator.clipboard.writeText(url.href);
        if (currentUserId.current === userId) setObsNotice("URL OBS berhasil disalin. Tempel di Browser Source OBS (1920 × 1080).");
      } catch {
        if (currentUserId.current === userId) {
          setObsLink(url.href);
          setObsNotice("Salin URL di kolom berikut ke Browser Source OBS (1920 × 1080).");
        }
      }
    } catch (err) {
      if (currentUserId.current === userId) setObsNotice(err instanceof Error ? err.message : "URL OBS belum tersedia.");
    } finally {
      setObsBusy(false);
    }
  }

  async function moderate(id: string, status: "approved" | "rejected" | "completed") {
    if (!db || !allowed || busy) return;
    setBusy(true); setError("");
    const { error: updateError } = await db.rpc("moderate_request", { request_id: id, next_status: status });
    setBusy(false);
    if (updateError) setError(updateError.message);
    else void reload();
  }

  async function displayNext() {
    if (!db || !allowed || busy) return;
    setBusy(true); setError("");
    const { error: rpcError } = await db.rpc("display_next_request");
    setBusy(false);
    if (rpcError) setError(rpcError.message);
    else void reload();
  }

  const pending = rows.filter(r => r.status === "pending");
  const approved = rows.filter(r => r.status === "approved");
  const active = rows.find(r => r.status === "now_playing");
  const completed = rows.filter(r => r.status === "completed").length;
  const rejected = rows.filter(r => r.status === "rejected").length;

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand"><span className="brand-icon"><RadioTower size={18}/></span><span className="brand-wordmark">LUXCAST<span className="accent">: AFTERHOURS</span></span></div>
        <div className="header-links"><span className="live-pill"><i/> CONTROL ROOM</span><Link className="subtle-link" href="/request">Member portal <ArrowUpRight size={14}/></Link></div>
      </header>
      <section className="admin-intro"><div className="eyebrow">LUXCAST: AFTERHOURS / OPERATIONS</div><h1>Control <em>Room.</em></h1><p>Kelola permintaan lagu, moderasi pesan, dan atur popup OBS.</p></section>
      {!user ? <div className="panel gate-panel"><h2>Operator sign in</h2><p>Only whitelisted Discord accounts can access the queue.</p><button className="primary-button" disabled={!db} onClick={login}>Continue with Discord <ArrowUpRight size={16}/></button></div> :
        !allowed ? <div className="panel gate-panel"><h2>Access restricted</h2><p>Akun ini belum didaftarkan sebagai operator. Tambahkan auth user UUID kamu ke tabel radio_operators di Supabase.</p><button className="secondary-button" onClick={logout}><LogOut size={15}/> Sign out</button><button className="secondary-button" onClick={()=>void reload()}><RefreshCw size={15}/> Check access</button></div> :
        <>
          <div className="dashboard-stats">
            <div className="panel stat-panel"><small>TOTAL REQUESTS</small><strong>{rows.length}</strong><span>Received this event</span></div>
            <div className="panel stat-panel"><small>PENDING REVIEW</small><strong>{pending.length}</strong><span>Awaiting moderation</span></div>
            <div className="panel stat-panel"><small>APPROVED QUEUE</small><strong>{approved.length}</strong><span>Ready for air</span></div>
            <div className="panel stat-panel"><small>COMPLETED</small><strong>{completed}</strong><span>{rejected} rejected</span></div>
          </div>
          <section className="panel active-panel">
            <div className="panel-heading"><div><div className="eyebrow">LIVE OUTPUT</div><h2>On Air</h2></div><span className={"status-tag "+(active ? "now_playing" : "pending")}>{active ? "● BROADCASTING" : "STANDBY"}</span></div>
            {active ? <div className="active-request"><div><h3>{active.song_title}</h3><p>{active.artist} · requested by {publicSenderName(active)}</p><blockquote>“{active.message}”</blockquote></div><button className="secondary-button" onClick={()=>void moderate(active.id,"completed")} disabled={busy}><Square size={14}/> Finish</button></div> :
              <p className="muted">No dedication is currently live. Approve at least one request, then display the next one.</p>}
            <div className="action-row"><button className="primary-button compact" disabled={busy || approved.length===0} onClick={displayNext}><Play size={17}/> Display next approved request</button><button className="secondary-button" disabled={obsBusy} onClick={copyObsLink}><Copy size={15}/>{obsBusy ? "Menyiapkan URL…" : "Salin URL OBS"}</button><span className="muted">Previous active request is completed automatically.</span></div>
            {obsNotice && <div role="status" className="helper-note">{obsNotice}</div>}
            {obsLink && <input className="obs-url" aria-label="URL OBS privat" readOnly value={obsLink} onFocus={event => event.currentTarget.select()}/>}
          </section>
          <div className="admin-columns">
            <section className="panel queue-panel"><div className="panel-heading"><div><div className="eyebrow">01 / MODERATION</div><h2>Incoming requests</h2></div><span className="count-label">{pending.length}</span></div>
              {pending.length === 0 && <p className="muted">No new requests.</p>}
              {pending.map(r => <div className="queue-entry" key={r.id}><div className="queue-meta"><span>{new Date(r.created_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span><span>{r.display_name}{r.is_anonymous ? " · ANONIM ON AIR" : ""}</span></div><h3>{r.song_title} <span>— {r.artist}</span></h3>{r.dedication_to && <p className="dedication-to">To: {r.dedication_to}</p>}<p className="request-message">{r.message}</p><div className="queue-actions"><button disabled={busy} className="small-button accept" onClick={()=>void moderate(r.id,"approved")}><Check size={15}/> Approve</button><button disabled={busy} className="small-button reject" onClick={()=>void moderate(r.id,"rejected")}><X size={15}/> Reject</button></div></div>)}
            </section>
            <section className="panel queue-panel"><div className="panel-heading"><div><div className="eyebrow">02 / BROADCAST LIST</div><h2>Approved queue</h2></div><span className="count-label">{approved.length}</span></div>
              {approved.length === 0 && <p className="muted">Queue is empty.</p>}
              {approved.map((r,i) => <div className="approved-entry" key={r.id}><span className="queue-number">{String(i+1).padStart(2,"0")}</span><div><strong>{r.song_title}</strong><span>{r.artist} · {publicSenderName(r)}</span></div><span className="status-tag approved">READY</span></div>)}
              <div className="helper-note">FIFO mengikuti waktu pengiriman request. Host membaca pesan dan memutar lagu secara manual.</div>
            </section>
          </div>
        </>
      }
      {error && <div role="alert" className="notice error">{error}</div>}
      <footer className="site-footer"><span>LUXCAST: AFTERHOURS / STAFF ONLY</span><button className="text-button" onClick={()=>void reload()}><RefreshCw size={14}/> Refresh</button></footer>
    </main>
  );
}

