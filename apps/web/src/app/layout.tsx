import type { Metadata } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Hanken_Grotesk,
  Shippori_Mincho_B1,
  Zen_Kaku_Gothic_New,
} from "next/font/google";

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
const mincho = Shippori_Mincho_B1({
  variable: "--font-family-mincho",
  subsets: ["latin"],
  weight: ["500", "800"],
  preload: false,
});
const zen = Zen_Kaku_Gothic_New({
  variable: "--font-family-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
