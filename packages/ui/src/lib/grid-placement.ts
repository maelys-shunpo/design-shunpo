/* Class names for placing an area on the page grid, written out so Tailwind finds them. Columns count from 1 on
   the content columns; the grid's first track is the left margin, so column n starts on line n + 1. */

export type Breakpoint = "base" | "md" | "lg";

/* How many content columns each breakpoint has: 4 on phones, 8 on tablets, 12 from 64rem. */
export const columnsAt: Record<Breakpoint, number> = { base: 4, md: 8, lg: 12 };

export const startClasses: Record<Breakpoint, Record<number, string>> = {
  base: { 1: "col-start-2", 2: "col-start-3", 3: "col-start-4", 4: "col-start-5" },
  md: {
    1: "md:col-start-2",
    2: "md:col-start-3",
    3: "md:col-start-4",
    4: "md:col-start-5",
    5: "md:col-start-6",
    6: "md:col-start-7",
    7: "md:col-start-8",
    8: "md:col-start-9",
  },
  lg: {
    1: "lg:col-start-2",
    2: "lg:col-start-3",
    3: "lg:col-start-4",
    4: "lg:col-start-5",
    5: "lg:col-start-6",
    6: "lg:col-start-7",
    7: "lg:col-start-8",
    8: "lg:col-start-9",
    9: "lg:col-start-10",
    10: "lg:col-start-11",
    11: "lg:col-start-12",
    12: "lg:col-start-13",
  },
};

export const spanClasses: Record<Breakpoint, Record<number, string>> = {
  base: { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4" },
  md: {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
  },
  lg: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
  },
};

/* Every content column. */
export const contentClasses: Record<Breakpoint, string> = {
  base: "col-content",
  md: "md:col-content",
  lg: "lg:col-content",
};

/* Full bleed: from the left page edge to the right one, through both margins. */
export const bleedClasses: Record<Breakpoint, string> = {
  base: "col-bleed",
  md: "md:col-bleed",
  lg: "lg:col-bleed",
};
