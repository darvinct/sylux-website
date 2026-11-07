import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYLUX FM — Frequencies of the Night",
  description: "Community radio request & dedication queue"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
