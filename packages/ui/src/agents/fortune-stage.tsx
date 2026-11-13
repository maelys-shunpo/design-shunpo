import type { ReactElement, ReactNode } from "react";

import { cn } from "../lib/cn.ts";

export interface CookieImages {
  whole: ReactElement;
  cracked: ReactElement;
  openLeft: ReactElement;
  openRight: ReactElement;
  /* `multiply` lets a photograph shot on white sit on the page's paper. */
  blend: "multiply" | "normal";
}

/* The cookie's states stacked in the photographs' own box; only the whole cookie shows before scripts run. */
function CookieLayers({ art }: { art: CookieImages }) {
  const layer = "absolute inset-0 [&_img]:object-cover";
  const waiting = cn(layer, "invisible opacity-0");
  return (
    <div
      aria-hidden="true"
      data-cookie-part="float"
      className={cn(
        "relative aspect-1380/793 w-full",
        art.blend === "multiply" && "mix-blend-multiply",
      )}
    >
      <div data-cookie-part="whole" className={layer}>
        {art.whole}
      </div>
      <div data-cookie-part="cracked" className={waiting}>
        {art.cracked}
      </div>
      <div data-cookie-part="openLeft" className={waiting}>
        {art.openLeft}
      </div>
      <div data-cookie-part="openRight" className={waiting}>
        {art.openRight}
      </div>
    </div>
  );
}

interface CookiePaperProps {
  id: string;
  open: boolean;
  prefix: string;
  figure: string;
  unit: string;
  fortune: string;
}

/* A strip of washi folded in two: the figure and what qualifies it on the left panel, the sentence inside the fold. */
function CookiePaper({ id, open, prefix, figure, unit, fortune }: CookiePaperProps) {
  const sheet =
    "absolute inset-0 bg-agents-paper-light agents-paper-fibres shadow-agents-card backface-hidden";
  return (
    <div
      data-cookie-part="paper"
      id={id}
      tabIndex={-1}
      aria-hidden={!open}
      className="invisible absolute origin-top-left transform-3d focus:outline-none"
    >
      <div
        data-cookie-panel
        className="absolute inset-y-0 left-0 flex items-center bg-agents-paper-light agents-paper-fibres px-4 shadow-agents-card"
      >
        <p className="font-display text-agents-ink">
          <span className="block text-md md:inline md:text-lg 2xl:text-xl">{prefix} </span>
          <span className="text-5xl font-medium text-agents-signal">
            {figure}
            <span className="text-3xl">{`\u202F${unit}`}</span>
          </span>
        </p>
      </div>
      <div
        data-cookie-part="fold"
        data-cookie-panel
        className="absolute inset-y-0 origin-left transform-3d"
      >
        <div className={cn(sheet, "flex items-center px-4")}>
          <p className="font-display text-sm text-pretty text-agents-ink md:text-lg 2xl:text-xl">
            {fortune}
          </p>
        </div>
        <div className={cn(sheet, "rotate-y-180")} />
      </div>
    </div>
  );
}

interface CookieStageProps {
  art: CookieImages;
  paperId: string;
  open: boolean;
  /* Opening: the button is on its way out, its focus ring hidden. */
  opening: boolean;
  label: string;
  cursor: string;
  prefix: string;
  figure: string;
  unit: string;
  fortune: string;
  link: ReactNode;
  onPress: () => void;
  onRelease: () => void;
  onOpen: () => void;
}

type CookieButtonProps = Pick<
  CookieStageProps,
  "paperId" | "open" | "opening" | "label" | "cursor" | "onPress" | "onRelease" | "onOpen"
>;

/* The button over the cookie: its label under it, set as the page's links (underlined on a 40 % rule), and the pill
   that follows a mouse over it. */
function CookieButton({
  paperId,
  open,
  opening,
  label,
  cursor,
  onPress,
  onRelease,
  onOpen,
}: CookieButtonProps) {
  return (
    <button
      data-cookie-part="button"
      type="button"
      hidden={open}
      aria-label={label}
      aria-expanded={open}
      aria-busy={opening}
      aria-controls={paperId}
      onPointerDown={(event) => {
        if (event.button === 0) {
          onPress();
        }
      }}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      onClick={onOpen}
      className="group/cookie absolute inset-0 cursor-pointer focus-visible:ring-ring/45 focus-visible:outline-none focus-visible:not-aria-busy:ring-3"
    >
      <span
        data-cookie-part="label"
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 py-1 text-md whitespace-nowrap underline decoration-foreground/40 underline-offset-4 transition-colors group-hover/cookie:decoration-foreground"
      >
        <span data-cookie-label-text>{label}</span>
      </span>
      <span
        data-cookie-part="cursor"
        aria-hidden="true"
        className="agents-cut pointer-events-none invisible absolute top-0 left-0 isolate inline-flex h-10 items-center px-4 text-sm font-medium text-primary-foreground before:bg-primary"
      >
        {cursor}
      </span>
    </button>
  );
}

/* The cookie in its halo, the button that opens it, the folded paper and the link. */
export function CookieStage({
  art,
  paperId,
  open,
  opening,
  label,
  cursor,
  link,
  onPress,
  onRelease,
  onOpen,
  ...paper
}: CookieStageProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 aspect-1380/793 scale-150 agents-cookie-halo"
      />
      <CookieLayers art={art} />
      <CookieButton
        paperId={paperId}
        open={open}
        opening={opening}
        label={label}
        cursor={cursor}
        onPress={onPress}
        onRelease={onRelease}
        onOpen={onOpen}
      />
      <CookiePaper id={paperId} open={open} {...paper} />
      <div data-cookie-part="link-box" className="absolute flex justify-center overflow-clip p-1">
        <div data-cookie-part="link" inert={!open} className="invisible">
          {link}
        </div>
      </div>
    </>
  );
}
