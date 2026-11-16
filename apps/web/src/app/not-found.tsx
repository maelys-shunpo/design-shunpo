import type { Metadata } from "next";

import { NotFoundPage } from "@/features/not-found/not-found-page";

/* Next injects `<meta name="robots" content="noindex">` for the 404 automatically; only the title is set here. */
export const metadata: Metadata = {
  title: "Page introuvable",
};

/* The root not-found catches every unmatched URL and renders inside the root layout (fonts and providers inherited).
   In the static export it is written as 404.html, which GitHub Pages serves for any unknown address. */
export default function NotFound() {
  return <NotFoundPage />;
}
