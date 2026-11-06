import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl"],
      container: ["prose", "narrow", "default", "wide"],
      ease: ["standard", "emphasized", "shift"],
      font: ["sans", "mono", "display"],
      "font-weight": ["light", "regular", "medium", "semibold", "heading"],
      tracking: ["normal", "wide", "wider"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
