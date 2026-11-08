import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUXCAST: AFTERHOURS — Your Song, Your Story",
  description: "Your song, your story. Request lagu, kirim pesan dedikasi, dan biarkan ceritamu mengudara di LUXCAST: AFTERHOURS."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
