import { LiveSurface } from "@repo/ui/agents/live-surface";
import { PhotoStage } from "@repo/ui/agents/photo-stage";
import { ToastNote } from "@repo/ui/agents/toast-note";
import Image from "next/image";

import plaster from "./images/hero-plaster.webp";
import { OfficeConsole } from "./office-console";

/* The back-office agent on a sunlit plaster wall: it replays its morning while the visitor reads. */
export function HeroStage() {
  return (
    <LiveSurface hold={4}>
      <PhotoStage
        backdrop={
          <Image src={plaster} alt="" fill sizes="(min-width: 90rem) 90rem, 100vw" priority />
        }
        floating={
          <ToastNote
            app="Canal #compta"
            time="09:44"
            message="F-2026-1184 approuvée et enregistrée dans Odoo. Paiement planifié au 04/12."
            live={8}
          />
        }
      >
        <OfficeConsole />
      </PhotoStage>
    </LiveSurface>
  );
}
