import { compactMarks } from "./references-marks";
import { wordmarks } from "./references-wordmarks";

/* The clients' own logos, one column of four each, every logo once on the wall, compact marks and wordmarks
   alternating so the ink is even. */
export const referenceLogoColumns = [
  [wordmarks.lemlist, compactMarks.carteNoire, wordmarks.opsClean, compactMarks.donnadieu],
  [compactMarks.tf1, wordmarks.initial, compactMarks.insiders, wordmarks.frenchAbroad],
  [wordmarks.hetic, compactMarks.altaroc, wordmarks.revoltrain, wordmarks.yBrush],
] as const;
