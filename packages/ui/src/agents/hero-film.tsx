"use client";

import { Fragment, lazy, type ReactElement, type ReactNode, type RefObject, useRef } from "react";

import { Container } from "../layout/container.tsx";
import { AfterIdle } from "../motion/after-idle.tsx";
import type { VideoSources } from "../motion/video-seeker.ts";
import { Headline } from "./headline.tsx";
import { type FilmCues, HOLD_SCREENS } from "./hero-film-course.ts";

declare module "react" {
  interface CSSProperties {
    /* HeroFilm's arrival: a word's rank in the promise, and the promise's word count for the action to wait past. */
    "--i"?: number;
    "--word-count"?: number;
  }
}

const LazyHeroFilmMotion = lazy(async () => {
  const { HeroFilmMotion } = await import("./hero-film-motion.tsx");
  return { default: HeroFilmMotion };
});

interface PlacedWord {
  word: string;
  at: number;
}

/* The promise's words. Each word holds its place in the sentence (`word`), and a `rise` inside it the arrival lifts
   from behind its edge after the night, one word a step after the last; the spaces between words stay text, so the
   heading reads as one sentence. The scroll later splits each `rise` into letters for the sunlight to climb. */
function Words({ text }: { text: string }) {
  const words = text.split(" ").reduce<PlacedWord[]>((placed, word) => {
    const previous = placed.at(-1);
    placed.push({ word, at: previous === undefined ? 0 : previous.at + previous.word.length + 1 });
    return placed;
  }, []);
  return words.map(({ word, at }, index) => (
    <Fragment key={at}>
      {at === 0 ? null : " "}
      <span data-hero-film="word" className="agents-hero-word">
        <span data-hero-film="rise" className="agents-hero-rise" style={{ "--i": index }}>
          {word}
        </span>
      </span>
    </Fragment>
  ));
}

interface FilmProps {
  video: RefObject<HTMLVideoElement | null>;
  poster: ReactElement;
  still: ReactElement;
}

/* The film over its first frame; it stays unloaded until the motion asks for it, and gives way to the still under
   reduced motion. */
function Film({ video, poster, still }: FilmProps) {
  return (
    <div
      data-hero-film="film"
      className="absolute inset-0 *:absolute *:inset-0 *:size-full [&_img]:size-full [&_img]:object-cover"
    >
      <div className="motion-reduce:hidden">{poster}</div>
      <video
        ref={video}
        className="object-cover motion-reduce:hidden"
        muted
        playsInline
        disablePictureInPicture
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="hidden motion-reduce:block">{still}</div>
    </div>
  );
}

/* The promise and its action, centred over the film. The promise is Kome on the night; the scroll then lets the
   sunlight climb through its letters (`--lit`) and finally overexpose them (`--heat`), the theme painting both.
   Lifted on tall screens so the sun rises below it, as on the home page. */
function Call({ title, action }: { title: string; action: ReactNode }) {
  const wordCount = title.split(" ").length;
  return (
    <div data-hero-film="call" className="absolute inset-0 grid place-items-center text-foreground">
      <Container className="md:tall:-translate-y-24">
        <div className="flex flex-col items-center gap-10">
          <Headline level={1} size="title" align="center">
            <Words text={title} />
          </Headline>
          <div data-hero-film="action">
            <div
              data-hero-film="action-rise"
              className="agents-hero-action-rise"
              style={{ "--word-count": wordCount }}
            >
              {action}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

interface HeroFilmProps extends FilmCues {
  sources: VideoSources;
  /* The film's first frame, the page's LCP: `<Image fill … loading="eager" fetchPriority="high" />`. */
  poster: ReactElement;
  /* Shown instead of the film under reduced motion. */
  still: ReactElement;
  /* The promise (h1), centred over the film. */
  title: string;
  action: ReactNode;
}

/* The home page's hero, in the « Agents » direction: a full-screen film read by the scroll behind the centred promise
   (ADR-0031). The promise arrives from the night word by word in CSS, so it never waits on GSAP (ADR-0032). Held from
   the page's top: the night lifts and a red sun rises, the sunlight climbs through the promise's letters from the
   horizon, then overexposes it from the sun out (A1) and the film's last frame holds. The stage then stays where it
   is, under the rest of the page, which rises over it as a sheet of paper (`CoverSheet`): the hero's root draws no
   box, so the stage holds against the page itself. Reduced motion: the risen sun behind the promise. */
export function HeroFilm({ sources, poster, still, title, action, ...cues }: HeroFilmProps) {
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  return (
    <div data-slot="hero-film" className="contents">
      <div
        ref={stage}
        data-hero-film="stage"
        className="relative h-svh overflow-clip bg-background scheme-dark motion-safe:sticky motion-safe:top-0"
      >
        <Film video={video} poster={poster} still={still} />
        <Call title={title} action={action} />
      </div>
      <div ref={track} data-hero-film="track" aria-hidden="true" className="motion-reduce:hidden">
        {Array.from({ length: HOLD_SCREENS }, (_, screen) => (
          <div key={screen} className="agents-film-hold" />
        ))}
      </div>
      <AfterIdle>
        <LazyHeroFilmMotion
          stage={stage}
          track={track}
          video={video}
          sources={sources}
          cues={cues}
        />
      </AfterIdle>
    </div>
  );
}
