"use client";

import { useEffect } from "react";

import type { CourseSignal, CourseValue, FilmRest, Signal } from "./wheel-film-course.ts";
import { createFilmFrames, type FilmFrames } from "./wheel-film-frames.ts";
import { createLoops, type FilmLayer } from "./wheel-film-loops.ts";

const WIDE_WITH_MOTION = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";
/* Frames load once the wheel is within a screen of the window. */
const NEAR = "100% 0px";
const MAX_PIXEL_RATIO = 2;

type EffectCleanup = (() => void) | undefined;

interface Film {
  frames: readonly string[];
  /* Each phase's stretch of the film, in phase order. */
  rests: readonly FilmRest[];
}

async function fetchFrame(url: string, signal: AbortSignal): Promise<Blob> {
  const response = await fetch(url, { signal, priority: "low" });
  if (!response.ok) {
    throw new Error(`Frame ${url}: ${String(response.status)}`);
  }
  return response.blob();
}

/* Each layer's two decoded frames around its position, added at their weights: premultiplied colours and alphas blend
   exactly, so the paper moves between frames instead of stepping, a frame still decoding is bridged by its neighbours,
   and a loop caught mid-way fades into the moving paper. */
function paint(
  context: CanvasRenderingContext2D,
  store: FilmFrames<ImageBitmap>,
  layers: readonly FilmLayer[],
): boolean {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  Object.assign(context, { globalCompositeOperation: "lighter" });
  let drawn = false;
  for (const { position, weight } of layers) {
    const pair = store.around(position);
    if (pair !== undefined && weight > 0) {
      drawn = true;
      Object.assign(context, { globalAlpha: weight * (1 - pair.share) });
      context.drawImage(pair.first, 0, 0, width, height);
      Object.assign(context, { globalAlpha: weight * pair.share });
      context.drawImage(pair.second, 0, 0, width, height);
    }
  }
  Object.assign(context, { globalCompositeOperation: "source-over", globalAlpha: 1 });
  return drawn;
}

function fitCanvas(canvas: HTMLCanvasElement): void {
  const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  const width = Math.round(canvas.clientWidth * ratio);
  const height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    Object.assign(canvas, { width, height });
  }
}

interface Playing {
  box: HTMLElement;
  film: Film;
  course: CourseSignal;
  paused: Signal<boolean>;
  onReady: (ready: boolean) => void;
}

/* Watches the box: `near` once it comes within a screen of the window (frames start loading), `inWindow` while it is
   in the window (the loops play). */
function watch(box: HTMLElement, near: () => void, inWindow: (seen: boolean) => void) {
  const nearing = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        nearing.disconnect();
        near();
      }
    },
    { rootMargin: NEAR },
  );
  const showing = new IntersectionObserver((entries) => {
    inWindow(entries.some((entry) => entry.isIntersecting));
  });
  nearing.observe(box);
  showing.observe(box);
  return () => {
    nearing.disconnect();
    showing.disconnect();
  };
}

function createCanvas(box: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset["wheelFilm"] = "";
  box.append(canvas);
  return canvas;
}

/* Puts the film's canvas in its box and draws what the wheel's course and the phases' loops ask for, from the moment
   the wheel nears the window. Returns what takes it all away. */
function play({ box, film, course, paused, onReady }: Playing): () => void {
  const canvas = createCanvas(box);
  const context = canvas.getContext("2d");
  const state: { store?: FilmFrames<ImageBitmap>; course: CourseValue; frame: number } = {
    course: { travel: 0, active: -1 },
    frame: 0,
  };
  function draw() {
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    if (context === null || state.store === undefined) {
      return;
    }
    const layers = loops.layers(state.course);
    state.store.seek(layers.at(-1)?.position ?? 0);
    fitCanvas(canvas);
    onReady(paint(context, state.store, layers));
  }
  function schedule() {
    if (state.frame === 0) {
      state.frame = requestAnimationFrame(draw);
    }
  }
  const loops = createLoops({ rests: film.rests, paused, draw });
  const unwatch = watch(
    box,
    () => {
      state.store = createFilmFrames({
        urls: film.frames,
        keys: film.rests.flatMap((rest) => [
          rest.pose,
          rest.loop?.from ?? rest.pose,
          rest.entrance?.from ?? rest.pose,
        ]),
        fetchFrame,
        decode: (blob) => createImageBitmap(blob),
        onChange: schedule,
      });
      schedule();
    },
    loops.see,
  );
  const resize = new ResizeObserver(schedule);
  resize.observe(canvas);
  /* The wheel's course runs inside GSAP's frame: the paper is drawn in that same frame, in step with the dots. */
  const stop = course.listen((value) => {
    state.course = value;
    loops.follow(value);
    draw();
  });
  return () => {
    stop();
    unwatch();
    resize.disconnect();
    loops.stop();
    cancelAnimationFrame(state.frame);
    state.store?.dispose();
    canvas.remove();
    onReady(false);
  };
}

interface WheelFilmProps extends Film {
  /* Where the canvas goes: the box the phases' stills fill. */
  box: HTMLElement | null;
  course: CourseSignal;
  paused: Signal<boolean>;
  onReady: (ready: boolean) => void;
}

/* The method wheel's paper film, from tablets up with motion only (internal to `MethodWheel`, loaded once the page is
   idle): carried by the scroll from one phase to the next, and each phase's short loop played in time while the wheel
   rests on it, held when paused or out of the window. Phones and reduced motion keep the phases' stills and never get a
   canvas. */
export function WheelFilm({ box, frames, rests, course, paused, onReady }: WheelFilmProps): null {
  useEffect((): EffectCleanup => {
    if (box === null) {
      return undefined;
    }
    const media = window.matchMedia(WIDE_WITH_MOTION);
    const playing = { box, film: { frames, rests }, course, paused, onReady };
    let stop: (() => void) | undefined;
    function update() {
      stop?.();
      stop = media.matches ? play(playing) : undefined;
    }
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      stop?.();
    };
  }, [box, frames, rests, course, paused, onReady]);
  return null;
}
