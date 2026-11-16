"use client";

import { lazy, type ReactNode, useCallback, useId, useRef, useState } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";
import type { CookieControls, CookieShown } from "./fortune-cookie-motion.tsx";
import type { CookieArtGeometry } from "./fortune-geometry.ts";
import { type CookieImages, CookieStage } from "./fortune-stage.tsx";

const LazyCookieMotion = lazy(async () => {
  const { CookieMotion } = await import("./fortune-cookie-motion.tsx");
  return { default: CookieMotion };
});

export interface CookieArt extends CookieArtGeometry, CookieImages {
  /* Where the one open photograph splits into its two halves (0 to 100). */
  split: number;
}

interface FortuneCookieProps {
  /* The cookie's three states as `<Image fill />` (whole with its paper, cracked, open halves) and where its
     paper sits. */
  art: CookieArt;
  /* Opened by the visitor, or by itself once it is well into the screen. */
  trigger: "click" | "arrival";
  /* The gesture's label under the cookie, e.g. « Ouvrir le biscuit ». */
  label: string;
  /* What the pill following a mouse over the cookie says, e.g. « Casser ». */
  cursor: string;
  /* The fortune: a figure with what qualifies it (e.g. « Jusqu’à ») and its unit on the left of the paper, a
     sentence inside the fold. */
  prefix: string;
  figure: string;
  unit: string;
  fortune: string;
  /* Rises under the paper once it is read, e.g. a link to the conditions. */
  link: ReactNode;
}

/* A fortune cookie that hides a figure, in a soft halo of paper light, never wider than a prose column so the
   cookie, the paper and its link fit one laptop screen; larger on phones. Painted whole at first; once the page is
   idle its motion loads (`CookieMotion`): at rest it floats, pressing cracks it and releasing opens it, then the
   folded paper slides out, rests in front of the halves and unfolds. Reduced motion: open. */
export function FortuneCookie({ art, trigger, ...content }: FortuneCookieProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [shown, setShown] = useState<CookieShown>("closed");
  const controls = useRef<CookieControls | null>(null);
  const paperId = useId();
  const keepControls = useCallback((next: CookieControls) => {
    controls.current = next;
  }, []);

  return (
    <div
      ref={setRoot}
      data-slot="fortune-cookie"
      className="relative mx-auto aspect-square w-full max-w-prose sm:aspect-690/569"
    >
      <CookieStage
        art={art}
        paperId={paperId}
        open={shown === "open"}
        opening={shown === "opening"}
        onPress={() => controls.current?.press()}
        onRelease={() => controls.current?.release()}
        onOpen={() => controls.current?.open()}
        {...content}
      />
      {root === null ? null : (
        <AfterIdle>
          <LazyCookieMotion
            root={root}
            art={art}
            trigger={trigger}
            onShown={setShown}
            onControls={keepControls}
          />
        </AfterIdle>
      )}
    </div>
  );
}
