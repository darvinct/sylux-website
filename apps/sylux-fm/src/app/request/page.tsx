"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, RadioTower, Send } from "lucide-react";
import styles from "./request.module.css";

const initialForm = {
  display_name: "",
  song_title: "",
  artist: "",
  dedication_to: "",
  message: "",
  is_anonymous: false
};

export default function RequestPage() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/guest-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit request.");
      setNotice("Request berhasil masuk ke antrean. Tunggu persetujuan operator.");
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <RadioTower size={20} aria-hidden="true" />
            <span>LUXCAST<span className={styles.brandAccent}>: AFTERHOURS</span></span>
          </div>
          <div className={styles.headerDetails}>
            <span className={styles.stationName}>SYLUX BOARDCAST</span>
            <Link href="/admin" className={styles.operator}>
              Operator <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className={styles.layout}>
          <div className={styles.editorial}>
            <section className={styles.intro} aria-labelledby="luxcast-title">
              <p className={styles.kicker}>WHERE WORDS MEET MELODIES</p>
              <h1 id="luxcast-title">Turn Your Feelings <em>Into a Song</em></h1>
              <p className={styles.description}>
                Let your feelings fill the night. Pilih lagu favoritmu, tulis pesan untuk seseorang, dan biarkan ceritamu mengudara bersama LUXCAST: AFTERHOURS.
              </p>
            </section>

            <section className={styles.station} aria-labelledby="station-title">
              <div className={styles.stationTop}>
                <h2 id="station-title" className={styles.kicker}>NOW TUNING IN</h2>
                <span className={styles.onAir}>ON AIR</span>
              </div>
              <img className={styles.stationImage} src="/afterhours-turntable.webp" width={960} height={640} alt="" />
              <div className={styles.stationCaption}>
                <span className={styles.stationMark}>LUX<span>CAST</span></span>
                <span>AFTERHOURS: SYLUX BOARDCAST</span>
              </div>
              <p className={styles.stationMotto}>LET YOUR FEELINGS FILL THE NIGHT</p>
            </section>

         </div>

          <section className={styles.request} aria-labelledby="request-title">
            <p className={styles.kicker}>01 / SEND YOUR STORY</p>
            <h2 id="request-title">A Song &amp; A Little Note</h2>

            <form className={styles.form} onSubmit={submit}>
              <fieldset className={styles.identity}>
                <legend>SENDER IDENTITY</legend>
                <div className={styles.identityOptions}>
                  <label>
                    <input type="radio" name="sender-visibility" checked={!form.is_anonymous}
                      onChange={() => setForm({ ...form, is_anonymous: false })} />
                    <span><strong>Use my name</strong><small>Show your chosen name on air</small></span>
                  </label>
                  <label>
                    <input type="radio" name="sender-visibility" checked={form.is_anonymous}
                      onChange={() => setForm({ ...form, is_anonymous: true })} />
                    <span><strong>Anonymous</strong><small>Show Anonymous on air</small></span>
                  </label>
                </div>
              </fieldset>

              {!form.is_anonymous && (
                <label className={styles.field}>
                  <span>Your name <span aria-hidden="true">*</span></span>
                  <input name="display_name" autoComplete="nickname" required maxLength={64}
                    value={form.display_name} onChange={event => setForm({ ...form, display_name: event.target.value })}
                    placeholder="Enter your name" />
                </label>
              )}

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span>Song title <span aria-hidden="true">*</span></span>
                  <input name="song_title" autoComplete="off" required maxLength={120}
                    value={form.song_title} onChange={event => setForm({ ...form, song_title: event.target.value })}
                    placeholder="e.g. Those Eyes" />
                </label>
                <label className={styles.field}>
                  <span>Artist <span aria-hidden="true">*</span></span>
                  <input name="artist" autoComplete="off" required maxLength={120}
                    value={form.artist} onChange={event => setForm({ ...form, artist: event.target.value })}
                    placeholder="e.g. New West" />
                </label>
              </div>

              <label className={styles.field}>
                <span>Dedicated to <small>(OPTIONAL)</small></span>
                <input name="dedication_to" autoComplete="off" maxLength={64}
                  value={form.dedication_to} onChange={event => setForm({ ...form, dedication_to: event.target.value })}
                  placeholder="Someone special..." />
              </label>

              <div className={styles.message}>
                <label className={styles.field}>
                  <span>Your message <span aria-hidden="true">*</span></span>
                  <textarea name="message" autoComplete="off" required maxLength={500} rows={4}
                    aria-describedby="message-count"
                    value={form.message} onChange={event => setForm({ ...form, message: event.target.value })}
                    placeholder="Your words will be read live on air..." />
                </label>
                <div className={styles.formDetails}>
                  <span id="message-count">{form.message.length} / 500 characters</span>
                  <span>Free · No Discord login required</span>
                </div>
              </div>

              <button className={styles.submit} type="submit" disabled={busy}>
                <span className={styles.submitIcon} aria-hidden="true">
                  {busy ? <span className={styles.spinner} /> : <Send size={17} />}
                </span>
                {busy ? "Submitting..." : "Send dedication"}
              </button>

              <div className={styles.feedback} role="status">{notice}</div>
              <div className={styles.feedback} role="alert">{error}</div>
            </form>
          </section>

          <section className={styles.guide} aria-labelledby="guide-title">
            <h2 id="guide-title" className={styles.kicker}>HOW IT WORKS</h2>
            <ol className={styles.steps}>
              <li><span aria-hidden="true">01</span>Choose a name or send anonymously, then fill in your song request.</li>
              <li><span aria-hidden="true">02</span>Operator checks and approves your message.</li>
              <li><span aria-hidden="true">03</span>Host reads it on air and plays the song manually.</li>
            </ol>
            <p className={styles.airtime}><Clock3 size={15} aria-hidden="true" /> Requests are played as airtime allows.</p>
          </section>
        </main>

        <footer className={styles.footer}>
          <span>© LUXCAST: AFTERHOURS · WHERE WORDS MEET MELODIES</span>
          <span>Made for the community.</span>
        </footer>
      </div>
    </div>
  );
}
