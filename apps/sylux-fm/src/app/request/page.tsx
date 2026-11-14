"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Disc3, RadioTower, ArrowUpRight, Send, Clock3 } from "lucide-react";

const initialForm = { display_name: "", song_title: "", artist: "", dedication_to: "", message: "", is_anonymous: false };

export default function RequestPage() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/guest-request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit request.");
      setNotice("Request berhasil masuk ke antrean. Tunggu persetujuan operator.");
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit request.");
    } finally { setBusy(false); }
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand"><span className="brand-icon"><RadioTower size={18}/></span><span className="brand-wordmark">LUXCAST<span className="accent">: AFTERHOURS</span></span></div>
        <div className="header-links"><span className="live-pill"><i/> SYLUX BOARDCAST</span><Link href="/admin" className="subtle-link">Operator <ArrowUpRight size={14}/></Link></div>
      </header>

      <section className="hero">
        <div className="luxcast-banner" aria-hidden="true">
          <img src="/luxcast-hero.svg" width={2048} height={503} alt="" />
        </div>
        <h1 className="luxcast-a11y-title">Turn Your Feelings Into a Song</h1>
        <div className="luxcast-mobile-title" aria-hidden="true">
          <div className="eyebrow"><span className="tiny-line"/> WHERE WORDS MEET MELODIES</div>
          <p>Turn Your Feelings <em>Into a Song</em></p>
        </div>
        <p>Let your feelings fill the night. Pilih lagu favoritmu, tulis pesan untuk seseorang, dan biarkan ceritamu mengudara bersama LUXCAST: AFTERHOURS.</p>
      </section>

      <div className="content-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div><div className="eyebrow">01 / SEND YOUR STORY</div><h2>A Song & A Little Note</h2></div>
            <div className="round-icon"><Disc3 size={22}/></div>
          </div>
          <form onSubmit={submit}>
            <fieldset className="identity-choice">
              <legend>SENDER IDENTITY</legend>
              <div className="identity-options">
                <label className={"identity-option " + (!form.is_anonymous ? "identity-selected" : "")}>
                  <input type="radio" name="sender-visibility" checked={!form.is_anonymous} onChange={() => setForm({ ...form, is_anonymous: false })}/>
                  <span><strong>Use my name</strong><small>Show your chosen name on air</small></span>
                </label>
                <label className={"identity-option " + (form.is_anonymous ? "identity-selected" : "")}>
                  <input type="radio" name="sender-visibility" checked={form.is_anonymous} onChange={() => setForm({ ...form, is_anonymous: true })}/>
                  <span><strong>Anonymous</strong><small>Show Anonymous on air</small></span>
                </label>
              </div>
            </fieldset>
            {!form.is_anonymous && <label>Your name <span>*</span>
              <input required maxLength={64} value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Enter your name"/>
            </label>}
            <div className="field-row">
              <label>Song title <span>*</span><input required maxLength={120} value={form.song_title} onChange={e => setForm({ ...form, song_title:e.target.value })} placeholder="e.g. Those Eyes"/></label>
              <label>Artist <span>*</span><input required maxLength={120} value={form.artist} onChange={e => setForm({ ...form, artist:e.target.value })} placeholder="e.g. New West"/></label>
            </div>
            <label>Dedicated to <small>(OPTIONAL)</small><input maxLength={64} value={form.dedication_to} onChange={e => setForm({ ...form, dedication_to:e.target.value })} placeholder="Someone special..."/></label>
            <label>Your message <span>*</span><textarea required maxLength={500} rows={5} value={form.message} onChange={e => setForm({ ...form, message:e.target.value })} placeholder="Your words will be read live on air..."/></label>
            <div className="form-bottom"><span>{form.message.length} / 500 characters</span><span>Free · No Discord login required</span></div>
            <button className="primary-button" type="submit" disabled={busy}><Send size={17}/>{busy ? "Submitting..." : "Send dedication"}<ArrowUpRight size={17}/></button>
          </form>
          {notice && <div role="status" className="notice success">{notice}</div>}
          {error && <div role="alert" className="notice error">{error}</div>}
        </section>

        <aside className="sidebar">
          <div className="panel secondary-panel">
            <div className="eyebrow">NOW TUNING IN</div>
            <div className="station-art"><RadioTower size={52} strokeWidth={1}/><div className="frequency">LUX<span>CAST</span></div><div className="frequency-caption">AFTERHOURS: SYLUX BOARDCAST</div></div>
            <div className="sidebar-footer"><span><i className="status-dot"/> ON AIR</span><span>LET YOUR FEELINGS FILL THE NIGHT</span></div>
          </div>
          <div className="panel info-panel">
            <div className="eyebrow">HOW IT WORKS</div>
            <div className="info-item"><span>01</span><p>Choose a name or send anonymously, then fill in your song request.</p></div>
            <div className="info-item"><span>02</span><p>Operator checks and approves your message.</p></div>
            <div className="info-item"><span>03</span><p>Host reads it on air and plays the song manually.</p></div>
            <div className="info-foot"><Clock3 size={15}/> Requests are played as airtime allows.</div>
          </div>

        </aside>
      </div>
      <footer className="site-footer"><span>© LUXCAST: AFTERHOURS · WHERE WORDS MEET MELODIES</span><span>Made for the community.</span></footer>
    </main>
  );
}

