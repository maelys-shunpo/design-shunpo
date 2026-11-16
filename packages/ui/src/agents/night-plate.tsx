import { cva } from "class-variance-authority";
import { EyeOff, Hourglass, RotateCcw, UserMinus } from "lucide-react";

import { Icon } from "../components/icon.tsx";
import { cn } from "../lib/cn.ts";

const plateVariants = cva("flex flex-col gap-3 p-3 text-foreground md:gap-4 md:p-5");
/* On a phone the night must fit the screen without shrinking its sentences, so the glyph waits for `md`. */
const glyphClass = "hidden stroke-1 text-muted-foreground md:block";

/* The pains a plate can name, each drawn as a hairline glyph (the DA's notation: a 1 px line that never thickens). */
const PLATE_ICONS = {
  time: Hourglass,
  departure: UserMinus,
  hidden: EyeOff,
  restart: RotateCcw,
} as const;

export type PlateIcon = keyof typeof PLATE_ICONS;

interface NightPlateProps {
  /* The glyph above the title: time (hours lost to retyping and searching), departure (what leaves with someone),
     hidden (steering blind), restart (an assistant starting from nothing). Decorative: the title says it. */
  icon: PlateIcon;
  title: string;
  text: string;
  className?: string | undefined;
}

/* One thing named on a Fuji Night island, set straight on the night with no surface of its own: a hairline icon, a
   title (h3, in the display serif) and a sentence, with no number (the things it names have no order). Compact on
   phones, where the icon is left out. Dark islands only. */
export function NightPlate({ icon, title, text, className }: NightPlateProps) {
  return (
    <article data-slot="night-plate" className={cn(plateVariants(), className)}>
      <Icon icon={PLATE_ICONS[icon]} size="lg" className={glyphClass} />
      <div className="flex flex-col gap-1 md:gap-2">
        <h3 className="font-display text-lg text-balance md:text-2xl">{title}</h3>
        <p className="text-sm text-muted-foreground md:text-md">{text}</p>
      </div>
    </article>
  );
}
