import { afterEach, describe, expect, it, vi } from "vitest";

import { createVideoSeeker, frameTime, whenNear } from "../src/motion/video-seeker.ts";
import mp4 from "../stories/support/rising-sun.mp4?url";
import webm from "../stories/support/rising-sun.webm?url";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";

describe("frameTime", () => {
  it("maps the progress of the film onto its duration", () => {
    expect(frameTime(0.5, 8)).toBe(4);
  });

  it("starts on the first frame before the range", () => {
    expect(frameTime(-0.2, 8)).toBe(0);
  });

  it("stops just before the end so the last frame stays painted", () => {
    expect(frameTime(1.4, 8)).toBeCloseTo(7.97);
  });

  it("stays on the first frame while the duration is still unknown", () => {
    expect(frameTime(0.5, Number.NaN)).toBe(0);
    expect(frameTime(0.5, 0)).toBe(0);
  });
});

function film(): HTMLElement {
  const element = document.createElement("div");
  element.style.height = "100px";
  document.body.append(element);
  return element;
}

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

describe("whenNear", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.scrollTo(0, 0);
    document.body.replaceChildren();
  });

  it("waits for the visitor to engage before it loads", async () => {
    const release = holdIdleCallbacks();
    const load = vi.fn<() => void>();
    const stop = whenNear(film(), load);

    await nextFrame();
    release();
    expect(load).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("scroll"));
    await expect
      .poll(() => {
        release();
        return load.mock.calls.length;
      })
      .toBe(1);
    stop();
  });

  it("counts a page already scrolled as engaged", async () => {
    const element = film();
    const spacer = document.createElement("div");
    spacer.style.height = "300vh";
    document.body.append(spacer);
    window.scrollTo(0, 50);
    const release = holdIdleCallbacks();
    const load = vi.fn<() => void>();
    const stop = whenNear(element, load);

    await expect
      .poll(() => {
        release();
        return load.mock.calls.length;
      })
      .toBe(1);
    stop();
  });
});

describe("createVideoSeeker", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("attaches the sources once, then paints the frame asked for", async () => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "none";
    document.body.append(video);
    const seeker = createVideoSeeker(video, { mp4, webm });

    seeker.seek(0.5);
    seeker.load();
    seeker.load();

    expect(video.querySelectorAll("source")).toHaveLength(2);
    expect(video.querySelector("source")?.type).toBe("video/mp4");
    await expect.poll(() => video.readyState >= HTMLMediaElement.HAVE_METADATA).toBe(true);
    await expect.poll(() => video.currentTime).toBeCloseTo(video.duration / 2, 1);
    seeker.dispose();
  });
});
