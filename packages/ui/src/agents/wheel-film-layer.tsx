"use client";

import { lazy, useState } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { AfterIdle } from "../motion/after-idle.tsx";
import { type CourseSignal, type FilmRest } from "./wheel-film-course.ts";
import { PANEL_COLUMNS } from "./wheel-step.tsx";

const LazyWheelFilm = lazy(async () => {
  const { WheelFilm } = await import("./wheel-film.tsx");
  return { default: WheelFilm };
});

/* The paper film the phases' stills are taken from: its frames in order, and each phase's stretch of it (the loop it
   plays in time while the wheel rests on it, its still cut from `to`). */
export interface WheelFilmSource {
  frames: readonly string[];
  rests: readonly FilmRest[];
}

interface WheelFilmLayerProps {
  film: WheelFilmSource;
  course: CourseSignal;
  onReady: (ready: boolean) => void;
}

/* The film's box, exactly over the phases' stills (internal to `MethodWheel`): its canvas goes in once the page is
   idle, from tablets up with motion. */
export function WheelFilmLayer({ film, course, onReady }: WheelFilmLayerProps) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid-page hidden items-center md:motion-safe:grid">
      <GridArea columns={PANEL_COLUMNS} align="center" overflow="visible">
        <div ref={setBox} className="agents-wheel-film relative aspect-square w-full" />
      </GridArea>
      <AfterIdle>
        <LazyWheelFilm
          box={box}
          frames={film.frames}
          rests={film.rests}
          course={course}
          onReady={onReady}
        />
      </AfterIdle>
    </div>
  );
}
