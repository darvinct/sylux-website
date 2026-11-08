import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUXCAST: AFTERHOURS — Where Words Meet Melodies",
  description: "Where words meet melodies. Turn your feelings into a song — request lagu dan kirim pesan dedikasi lewat LUXCAST: AFTERHOURS."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
