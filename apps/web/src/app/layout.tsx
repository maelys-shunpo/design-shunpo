import type { Metadata } from "next";
import { Archivo, Bricolage_Grotesque, Geist, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local";

import { Providers } from "./providers";

import "./globals.css";

/* Each art direction uses two or three of these faces. A face downloads only on the page whose CSS uses it,
   so none is preloaded on every route. */
const hanken = Hanken_Grotesk({ variable: "--font-family-hanken", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-family-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  preload: false,
});
/* The Japanese faces, self-hosted in their Latin subset (from Fontsource, OFL): Google serves them as a hundred
   CJK slices. The few kanji the pages show fall back to the system mincho and gothic. */
const mincho = localFont({
  variable: "--font-family-mincho",
  src: [
    { path: "./fonts/shippori-mincho-b1-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/shippori-mincho-b1-latin-800-normal.woff2", weight: "800" },
  ],
  preload: false,
});
const zen = localFont({
  variable: "--font-family-zen",
  src: [
    { path: "./fonts/zen-kaku-gothic-new-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/zen-kaku-gothic-new-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/zen-kaku-gothic-new-latin-700-normal.woff2", weight: "700" },
  ],
  preload: false,
});
const archivo = Archivo({
  variable: "--font-family-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  preload: false,
});
const geist = Geist({ variable: "--font-family-geist", subsets: ["latin"], preload: false });
const geistMono = Geist_Mono({
  variable: "--font-family-geist-mono",
  subsets: ["latin"],
  preload: false,
});
const fontVariables = [hanken, bricolage, mincho, zen, archivo, geist, geistMono]
  .map((font) => font.variable)
  .join(" ");

export const metadata: Metadata = {
  title: {
    default: "SHUNPO · Agence IA, automatisation et logiciels sur mesure",
    template: "%s · SHUNPO",
  },
  description:
    "SHUNPO vous libère du temps. Agence lyonnaise d’intelligence artificielle, d’automatisation et de développement sur mesure pour PME, ETI et grands comptes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
