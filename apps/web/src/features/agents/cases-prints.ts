import type { StaticImageData } from "next/image";

import altaroc from "./images/cases-altaroc.webp";
import lemlist from "./images/cases-lemlist.webp";
import opsClean from "./images/cases-ops-clean.webp";
import tf1 from "./images/cases-tf1.webp";
import vicat from "./images/cases-vicat.webp";
import { compactMarks } from "./references-marks";
import { wordmarks } from "./references-wordmarks";

interface Logo {
  image: StaticImageData;
  width: number;
  height: number;
}

/* Each published case's product, cropped to what it shows best, by reference id. */
const prints: Record<string, StaticImageData> = {
  tf1,
  altaroc,
  lemlist,
  vicat,
  "ops-clean": opsClean,
};

/* The clients' own logos, the ones the references wall shows; Vicat has none yet, its name is set instead. */
const logos: Record<string, Logo> = {
  tf1: compactMarks.tf1,
  altaroc: compactMarks.altaroc,
  lemlist: wordmarks.lemlist,
  "ops-clean": wordmarks.opsClean,
};

export function printOf(id: string): StaticImageData | undefined {
  return prints[id];
}

export function logoOf(id: string): Logo | undefined {
  return logos[id];
}
