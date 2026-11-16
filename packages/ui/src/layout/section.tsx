import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const sectionVariants = cva("text-foreground", {
  variants: {
    spacing: {
      xs: "py-4",
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-24 md:py-32",
      xl: "py-32 md:py-48",
      /* The rhythm of the page grid: each side pads half the gap it names, so neighbours add up. */
      flush: "py-0",
      seam: "py-rhythm-seam",
      tight: "py-rhythm-tight",
      regular: "py-rhythm-regular",
      breath: "py-rhythm-breath",
    },
    tone: {
      default: "",
      muted: "bg-muted",
      sheet: "bg-surface",
    },
    /* `screen`: at least the window's height, its content centred between two bands the floating nav's height (and a
       step of air from tablets up, `header-clear`), in place of the rhythm `spacing` would give. */
    height: {
      auto: "",
      screen: "flex min-h-svh flex-col justify-center py-header md:py-header-clear",
    },
    /* `clip`: what floats inside never spills over the neighbouring sections. */
    overflow: {
      visible: "",
      clip: "overflow-clip",
    },
    /* The folds, crumples or grain of a paper over the section's own colour, which they keep on average. `grain` is a
       film grain for dark islands, under the content, still under reduced motion. */
    paper: {
      plain: "",
      washi: "agents-washi",
      froisse: "agents-froisse",
      plie: "agents-plie",
      grain: "agents-grain",
    },
    scheme: {
      inherit: "",
      light: "bg-background scheme-light",
      dark: "bg-background scheme-dark",
      field: "bg-background scheme-field",
    },
  },
  defaultVariants: {
    spacing: "md",
    tone: "default",
    height: "auto",
    overflow: "visible",
    paper: "plain",
    scheme: "inherit",
  },
});

type SectionElement = "section" | "header" | "footer" | "aside";
type SectionVariants = VariantProps<typeof sectionVariants>;

/* The colour scheme a section shows, whatever the page's: islands set it; the Blue Tenku field reads as dark. */
function shownScheme({ scheme }: SectionVariants): "light" | "dark" | undefined {
  if (scheme === "field") {
    return "dark";
  }
  if (scheme === "light" || scheme === "dark") {
    return scheme;
  }
  return undefined;
}

interface SectionProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  as?: SectionElement;
}

export function Section({
  as: Element = "section",
  spacing,
  tone,
  height,
  overflow,
  paper,
  scheme,
  className,
  ...props
}: SectionProps) {
  return (
    <Element
      data-slot="section"
      data-scheme={shownScheme({ scheme, tone })}
      className={cn(
        sectionVariants({
          spacing: height === "screen" ? "flush" : spacing,
          tone,
          height,
          overflow,
          paper,
          scheme,
        }),
        className,
      )}
      {...props}
    />
  );
}
