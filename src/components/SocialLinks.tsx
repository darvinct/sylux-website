import { DiscordLogo, InstagramLogo, TiktokLogo, ArrowUpRight } from "@phosphor-icons/react";
import { site, type Language } from "../data/site";

export function SocialLinks({ lang }: { lang: Language }) {
  const id = lang === "id";
  const accounts = [
    { name: "Instagram", handle: "@syluxcommunity_", href: "https://www.instagram.com/syluxcommunity_/", Icon: InstagramLogo, className: "instagram", description: id ? "Kabar, dokumentasi, dan momen komunitas SYLUX." : "Updates, photos, and moments from the SYLUX community." },
    { name: "TikTok", handle: "@syluxcommunity_", href: "https://www.tiktok.com/@syluxcommunity_", Icon: TiktokLogo, className: "tiktok", description: id ? "Cuplikan kegiatan dan cerita seru dari SYLUX." : "Community highlights and stories from SYLUX." },
    { name: "Discord", handle: "discord.gg/sylux", href: site.discordInvite, Icon: DiscordLogo, className: "discord", description: id ? "Tempat ngobrol, berbagi musik, dan ikut kegiatan bersama." : "Join conversations, share music, and take part in community events." },
  ];
  return <div className="social-layout">
    <div className="social-intro">
      <p className="social-eyebrow">{id ? "Media sosial resmi" : "Official social media"}</p>
      <h2>{id ? "Ikuti Media Sosial Resmi SYLUX" : "Follow SYLUX on Social Media"}</h2>
      <p className="social-description">{id ? "Tetap terhubung dengan komunitas SYLUX melalui berbagai platform media sosial resmi kami." : "Stay connected with the SYLUX community across our official social platforms."}</p>
      <div className="social-qr"><span>{id ? "Scan untuk gabung" : "Scan to join"}</span><a href={site.discordInvite} target="_blank" rel="noreferrer" aria-label={id ? "Gabung server Discord SYLUX" : "Join the SYLUX Discord server"}><img src="/images/sylux-join-qr.svg" width="180" height="180" loading="lazy" alt={id ? "Kode QR undangan Discord SYLUX" : "QR code for the SYLUX Discord invitation"} /></a><span>discord.gg/sylux</span></div>
    </div>
    <div className="social-cards">{accounts.map(({ name, handle, href, Icon, className, description }) => <article className="social-card" key={name}>
      <div className="social-card-title"><span className={`social-icon ${className}`}><Icon size={26} weight="fill" aria-hidden="true" /></span><div><h3>{name}{name === "Discord" ? " Community" : " Official"}</h3><p>{handle}</p></div></div>
      <p className="social-card-description">{description}</p>
      <a href={href} target="_blank" rel="noreferrer" className="social-visit"><Icon size={16} aria-hidden="true" />{id ? "Kunjungi" : "Visit"} {name}<ArrowUpRight size={15} aria-hidden="true" /></a>
    </article>)}</div>
  </div>;
}
