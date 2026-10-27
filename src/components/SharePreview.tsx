import { ArrowUpRight } from "@phosphor-icons/react";
import data from "../data/share.json";
import { site, type Language } from "../data/site";
import "../share-preview.css";

export default function SharePreview({ lang }: { lang: Language }) {
  const id = lang === "id";
  const year = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date());
  return (
    <main className="share-preview-page wrap">
      <div className="share-preview-intro">
        <span className="eyebrow">SYLUX / DISCORD</span>
        <h1>{id ? "Satu tautan. Pintu ke komunitasmu." : "One link. Your community’s front door."}</h1>
        <p>{id
          ? "Simulasi kartu saat link SYLUX dibagikan. Tampilan akhir ditentukan oleh Discord; pengujian kartu asli memerlukan halaman yang dapat diakses publik."
          : "A simulation of the SYLUX link card. Discord determines the final appearance; testing the actual card requires a publicly accessible page."}</p>
      </div>
      <article className="discord-share-card" aria-label={id ? "Simulasi pratinjau tautan Discord" : "Simulated Discord link preview"}>
        <div className="discord-share-heading">
          <div>
            <h2><a href="/">SYLUX</a> | Komunitas Discord</h2>
            <p>{data.description}</p>
          </div>
          <img className="discord-share-thumbnail" src={data.thumbnail} alt="Logo SYLUX" width="80" height="80" />
        </div>
        <img className="discord-share-cover" src={data.image} alt={data.imageAlt} width="1200" height="630" />
        <hr />
        <p className="discord-share-message">{data.message}</p>
        <div className="discord-share-links">
          {data.links.map((link) => (
            <a key={link.label} href={link.href === "$invite" ? site.discordInvite : link.href} target="_blank" rel="noreferrer">
              {link.label}<ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="discord-share-footer">© {year} SYLUX Community. Ruangmu untuk bersinar.</p>
      </article>
      <p className="share-preview-note">{id ? "Kartu mengambil identitas dan tautan dari konfigurasi website. Tidak memerlukan bot atau webhook." : "The card uses the website’s identity and links. No bot or webhook required."}</p>
    </main>
  );
}
