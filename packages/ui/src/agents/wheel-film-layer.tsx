"use client";

import { Pause, Play } from "lucide-react";
import { lazy, useCallback, useState } from "react";

import { Button } from "../components/button.tsx";
import { Icon } from "../components/icon.tsx";
import { GridArea } from "../layout/grid-area.tsx";
import { AfterIdle } from "../motion/after-idle.tsx";
import { type CourseSignal, createSignal, type FilmRest } from "./wheel-film-course.ts";
import { PANEL_COLUMNS } from "./wheel-step.tsx";

const LazyWheelFilm = lazy(async () => {
  const { WheelFilm } = await import("./wheel-film.tsx");
  return { default: WheelFilm };
});

/* The paper film the phases' stills are taken from: its frames in order, and each phase's stretch of it (the loop it
   plays in time while the wheel rests on it, its still cut from `to`). `labels` name the control that pauses the
   loops. */
export interface WheelFilmSource {
  frames: readonly string[];
  rests: readonly FilmRest[];
  labels: { pause: string; play: string };
}

interface WheelFilmLayerProps {
  film: WheelFilmSource;
  course: CourseSignal;
  onReady: (ready: boolean) => void;
}

/* The film's box, exactly over the phases' stills (internal to `MethodWheel`): its canvas goes in once the page is
   idle, from tablets up with motion. The phases' loops move on their own, so the film carries a control that pauses
   them (WCAG 2.2.2), opaque over the paper like a stage's, shown with the film. */
export function WheelFilmLayer({ film, course, onReady }: WheelFilmLayerProps) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [paused] = useState(() => createSignal(false));
  const [isPaused, setPaused] = useState(false);
  /* The control exists only once the film draws: phones and reduced motion, which never get the film, never get it. */
  const [ready, setReady] = useState(false);
  const onFilmReady = useCallback(
    (drawn: boolean) => {
      setReady(drawn);
      onReady(drawn);
    },
    [onReady],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid-page hidden items-center md:motion-safe:grid">
      <GridArea columns={PANEL_COLUMNS} align="center" overflow="visible">
        <div ref={setBox} className="agents-wheel-film relative aspect-square w-full">
          {ready ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={isPaused ? film.labels.play : film.labels.pause}
              className="pointer-events-auto absolute inset-e-4 bottom-4 z-10 size-10 rounded-full border border-rule bg-surface text-foreground hover:bg-muted"
              onClick={() => {
                paused.set(!isPaused);
                setPaused(!isPaused);
              }}
            >
              <Icon icon={isPaused ? Play : Pause} size="sm" />
            </Button>
          ) : null}
        </div>
      </GridArea>
      <AfterIdle>
        <LazyWheelFilm
          box={box}
          frames={film.frames}
          rests={film.rests}
          course={course}
          paused={paused}
          onReady={onFilmReady}
        />
      </AfterIdle>
    </div>
  );
}
