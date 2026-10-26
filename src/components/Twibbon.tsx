import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowCounterClockwise,
  DownloadSimple,
  ImageSquare,
  UploadSimple,
} from "@phosphor-icons/react";
import { site, type Language } from "../data/site";
import { ToolHeading } from "./Shell";

export default function Twibbon({ lang }: { lang: Language }) {
  const id = lang === "id";
  const canvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const activeUrl = useRef<string | null>(null);
  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => { if (active) setLogo(image); };
    image.src = "/images/sylux-logo.png";
    return () => { active = false; };
  }, []);
  useEffect(
    () => () => {
      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    },
    [],
  );
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#130d26";
    ctx.fillRect(0, 0, 1080, 1080);
    if (photo) {
      const size = Math.min(photo.naturalWidth, photo.naturalHeight) / zoom;
      const left = ((photo.naturalWidth - size) * (x + 100)) / 200;
      const top = ((photo.naturalHeight - size) * (y + 100)) / 200;
      ctx.drawImage(photo, left, top, size, size, 0, 0, 1080, 1080);
    } else {
      ctx.fillStyle = "#a9afb4";
      ctx.textAlign = "center";
      ctx.font = "26px sans-serif";
      ctx.fillText(
        id ? "Foto kamu akan muncul di sini" : "Your photo appears here",
        540,
        480,
      );
    }
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, "#bf8fff");
    gradient.addColorStop(.6, "#9588ff");
    gradient.addColorStop(1, "#8cddff");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 14;
    ctx.strokeRect(24, 24, 1032, 1032);
    ctx.fillStyle = "#130d26";
    ctx.fillRect(0, 860, 1080, 220);
    ctx.fillStyle = "#eeeDE8";
    ctx.textAlign = "left";
    let fontSize = 88;
    ctx.font = `700 ${fontSize}px Outfit, sans-serif`;
    while (
      ctx.measureText(site.name.toLowerCase() + ".").width > 940 &&
      fontSize > 24
    ) {
      fontSize -= 2;
      ctx.font = `700 ${fontSize}px Outfit, sans-serif`;
    }
    if (logo) ctx.drawImage(logo, 0, 48, 128, 36, 60, 880, 360, 102);
    else ctx.fillText(site.name, 60, 966);
    ctx.fillStyle = "#cbb9ed";
    ctx.font = "28px Outfit, sans-serif";
    ctx.fillText(name.trim() || site.tagline, 65, 1020, 940);
  }, [photo, logo, zoom, x, y, name, id]);

  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError(
        id
          ? "Pilih JPG, PNG, atau WebP maksimal 10 MB."
          : "Choose a JPG, PNG, or WebP up to 10 MB.",
      );
      e.target.value = "";
      return;
    }
    setLoading(true);
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    const url = URL.createObjectURL(file);
    activeUrl.current = url;
    const image = new Image();
    image.onload = () => {
      if (activeUrl.current !== url) return;
      setPhoto(image);
      setZoom(1);
      setX(0);
      setY(0);
      setLoading(false);
    };
    image.onerror = () => {
      if (activeUrl.current === url) {
        setError(
          id
            ? "Foto tidak bisa dibaca. Coba berkas lain."
            : "Cannot read this image. Try another file.",
        );
        setLoading(false);
      }
    };
    image.src = url;
  };
  const download = async () => {
    if (!photo || !canvas.current) return;
    canvas.current.toBlob((blob) => {
      if (!blob) {
        setError(
          id
            ? "Gambar gagal dibuat. Coba lagi."
            : "Could not create the image. Try again.",
        );
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.name.toLowerCase()}-twibbon.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };
  return (
    <main className="tool-page wrap">
      <ToolHeading
        lang={lang}
        title="Twibbon Studio"
        body={
          id
            ? "Foto kamu, bagian dari komunitas. Buat dan unduh bingkaimu sendiri."
            : "Your photo, part of the community. Create and download your own frame."
        }
      />
      <div className="tool-grid">
        <div className="canvas-panel">
          <canvas
            ref={canvas}
            width="1080"
            height="1080"
            aria-label={id ? "Pratinjau twibbon" : "Twibbon preview"}
          />
          <div className="canvas-caption">
            <ImageSquare size={18} />
            <span>1080 × 1080 px · PNG</span>
          </div>
        </div>
        <div className="tool-panel">
          <h2>{id ? "Buat jadi milikmu." : "Make it yours."}</h2>
          <p>
            {id
              ? "Foto diproses di perangkatmu dan tidak diunggah ke server."
              : "Your photo stays on your device. Nothing is uploaded."}
          </p>
          <label className="upload-button">
            <UploadSimple size={22} />
            <span>
              {loading
                ? id
                  ? "Membaca foto…"
                  : "Reading photo…"
                : id
                  ? "Pilih foto"
                  : "Choose a photo"}
            </span>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={upload}
            />
          </label>
          <small className="muted">JPG, PNG, WebP · max 10 MB</small>
          <label className="field">
            {id ? "Namamu (opsional)" : "Your name (optional)"}
            <input
              value={name}
              maxLength={30}
              placeholder={id ? "Nama panggilan" : "Nickname"}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {[
            {
              label: id ? "Perbesar" : "Zoom",
              value: zoom,
              min: 1,
              max: 3,
              step: 0.01,
              set: setZoom,
            },
            {
              label: id ? "Posisi horizontal" : "Horizontal position",
              value: x,
              min: -100,
              max: 100,
              step: 1,
              set: setX,
            },
            {
              label: id ? "Posisi vertikal" : "Vertical position",
              value: y,
              min: -100,
              max: 100,
              step: 1,
              set: setY,
            },
          ].map((control) => (
            <label className="range-field" key={control.label}>
              <span>{control.label}</span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                onChange={(e) => control.set(Number(e.target.value))}
                disabled={!photo}
              />
            </label>
          ))}
          <div className="button-row">
            <button
              className="button secondary"
              onClick={() => {
                setZoom(1);
                setX(0);
                setY(0);
              }}
              disabled={!photo}
            >
              <ArrowCounterClockwise size={17} />
              Reset
            </button>
            <button
              className="button primary"
              disabled={!photo || loading}
              onClick={download}
            >
              <DownloadSimple size={18} />
              {id ? "Unduh PNG" : "Download PNG"}
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
