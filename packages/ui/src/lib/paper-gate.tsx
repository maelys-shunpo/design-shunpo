"use client";

import { useEffect } from "react";

import { whenIdle } from "./idle.ts";

/* Holds the heavy paper textures off the first paint: a section keeps its own flat colour until the page has painted
   and gone idle, then this gate opens them all at once by marking the document (`html[data-papers]`, read by the paper
   utilities in theme.css), the way motion waits for `AfterIdle`. Renders nothing. */
export function PaperGate(): null {
  useEffect(
    () =>
      whenIdle(() => {
        document.documentElement.dataset["papers"] = "";
      }),
    [],
  );

  return null;
}
