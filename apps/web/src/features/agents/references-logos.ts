import { compactMarks } from "./references-marks";
import { wordmarks } from "./references-wordmarks";

/* The clients' own logos, six to a column so a column never shows the same logo twice in its window: each column's four,
   then two from another column, compact marks and wordmarks alternating so the ink is even. */
export const referenceLogoColumns = [
  [
    wordmarks.lemlist,
    compactMarks.carteNoire,
    wordmarks.opsClean,
    compactMarks.donnadieu,
    wordmarks.hetic,
    compactMarks.altaroc,
  ],
  [
    compactMarks.tf1,
    wordmarks.initial,
    compactMarks.insiders,
    wordmarks.frenchAbroad,
    compactMarks.donnadieu,
    wordmarks.lemlist,
  ],
  [
    wordmarks.hetic,
    compactMarks.altaroc,
    wordmarks.revoltrain,
    wordmarks.yBrush,
    compactMarks.insiders,
    wordmarks.initial,
  ],
] as const;
