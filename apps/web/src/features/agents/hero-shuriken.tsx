import { HeroShuriken as HeroShurikenScene } from "@repo/ui/agents/hero-shuriken";
import Image from "next/image";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";

import { HeroShurikenCopy } from "./hero-shuriken-copy";
import folded from "./images/shuriken-folded.webp";
import laid from "./images/shuriken-laid.webp";
/* The four tools printed on the sheets, from the top point of the sign clockwise: messaging, CRM, ERP, sheets. */
const marks = [siGmail, siHubspot, siOdoo, siGooglesheets].map(({ title, path }) => ({
  title,
  path,
}));

const STAGE_SIZES = "(min-width: 64rem) 50vw, (min-width: 48rem) 75vw, 100vw";

/* Hero « Le signe plié »: four tools on four sheets of paper fold into one SHUNPO sign. */
export function HeroShuriken() {
  return (
    <HeroShurikenScene
      copy={<HeroShurikenCopy />}
      poster={
        <Image
          src={laid}
          alt="Quatre feuilles de papier posées à plat, une par outil : Gmail, HubSpot, Odoo, Google Sheets."
          sizes={STAGE_SIZES}
          loading="eager"
        />
      }
      folded={
        <Image
          src={folded}
          alt="Les quatre feuilles pliées et emboîtées en un seul signe SHUNPO, posé sur son galet rouge."
          sizes={STAGE_SIZES}
        />
      }
      marks={marks}
      caption={{
        before: "4 outils · chacun de son côté",
        after: "1 système · vos outils ensemble",
      }}
    />
  );
}
