export type LiveKind = "appear" | "type" | "grow" | "transient";

export interface LiveStep {
  /* The step at which this piece enters when the interface replays (LiveSurface); pieces of a step enter together. */
  live?: number | undefined;
  liveKind?: LiveKind | undefined;
}

/* The data attributes LiveSurface's runtime reads: none when the piece is static. */
export function liveAttributes({ live, liveKind }: LiveStep): Record<string, string | undefined> {
  if (live === undefined) {
    return {};
  }
  return {
    "data-live": String(live),
    "data-live-kind": liveKind === undefined || liveKind === "appear" ? undefined : liveKind,
  };
}
