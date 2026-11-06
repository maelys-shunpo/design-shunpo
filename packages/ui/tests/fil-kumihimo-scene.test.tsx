import { StrictMode } from "react";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  type ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import type { QualityTier } from "../src/lib/quality-tier.ts";
import { advanceKumihimo, KumihimoScene, readColours } from "../src/scene/fil-kumihimo-scene.tsx";
import { createKumihimo, defaultColours, weave } from "../src/scene/fil-kumihimo-shaders.ts";
import { canvasIn, canvasPixels } from "./support/canvas-pixels.ts";

const SIZE = 48;
/* The motion audit's blank threshold (ADR-0026): luminance spread under 2 is an empty canvas. */
const BLANK_SPREAD = 2;

/* Draws one frame of the material, failing on any compile or link error instead of logging it. */
function drawOnce(material: ShaderMaterial): Uint8Array {
  const renderer = new WebGLRenderer();
  renderer.setSize(SIZE, SIZE);
  renderer.debug.onShaderError = (gl, ...[, vertexShader, fragmentShader]) => {
    const logs = [gl.getShaderInfoLog(fragmentShader), gl.getShaderInfoLog(vertexShader)];
    throw new Error(
      logs.filter((log) => log !== null && log !== "").join("\n") || "The shader did not link.",
    );
  };
  const scene = new Scene().add(new Mesh(new PlaneGeometry(2, 2), material));
  renderer.render(scene, new OrthographicCamera());
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  const gl = renderer.getContext();
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  renderer.dispose();
  /* Release the context now: Chrome keeps 16 at most, and a later scene would lose its own. */
  renderer.forceContextLoss();
  return pixels;
}

function luminanceSpread(pixels: ArrayLike<number>): number {
  const luminance = Array.from({ length: pixels.length / 4 }, (_, index) => {
    const offset = index * 4;
    return (
      0.2126 * (pixels[offset] ?? 0) +
      0.7152 * (pixels[offset + 1] ?? 0) +
      0.0722 * (pixels[offset + 2] ?? 0)
    );
  });
  const mean = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
  return Math.sqrt(
    luminance.reduce((sum, value) => sum + (value - mean) ** 2, 0) / luminance.length,
  );
}

function difference(first: ArrayLike<number>, second: ArrayLike<number>): number {
  let total = 0;
  for (let index = 0; index < first.length; index += 1) {
    total += Math.abs((first[index] ?? 0) - (second[index] ?? 0));
  }
  return total / first.length;
}

describe("kumihimo shader", () => {
  it.each<QualityTier>(["light", "full"])(
    "compiles and draws threads, not a blank frame, on the %s tier",
    (tier) => {
      const kumihimo = createKumihimo(new Vector2(), tier, 16 / 10);
      kumihimo.uniforms.uResolution.value.set(SIZE, SIZE);
      weave(kumihimo);

      expect(luminanceSpread(drawOnce(kumihimo.material))).toBeGreaterThan(BLANK_SPREAD);
    },
  );

  it("braids the tangle into another picture as the progress runs", () => {
    const kumihimo = createKumihimo(new Vector2(), "light", 16 / 10);
    kumihimo.uniforms.uResolution.value.set(SIZE, SIZE);
    weave(kumihimo);
    const tangled = drawOnce(kumihimo.material);

    kumihimo.uniforms.uProgress.value = 1;
    weave(kumihimo);

    expect(difference(tangled, drawOnce(kumihimo.material))).toBeGreaterThan(4);
  });
});

describe("kumihimo motion", () => {
  it("plucks the threads while the pointer sweeps and lets them settle once it rests", () => {
    const kumihimo = createKumihimo(new Vector2(), "light", 1);
    const previous = new Vector2();
    kumihimo.uniforms.uPointer.value.set(0.4, 0);

    advanceKumihimo(kumihimo, previous, { delta: 0.016, progress: 0.3 });
    const plucked = kumihimo.uniforms.uPull.value;
    for (let frame = 0; frame < 120; frame += 1) {
      advanceKumihimo(kumihimo, previous, { delta: 0.016, progress: 0.3 });
    }

    expect(plucked).toBeGreaterThan(0.5);
    expect(kumihimo.uniforms.uPull.value).toBeLessThan(0.05);
    expect(kumihimo.uniforms.uProgress.value).toBe(0.3);
  });

  it("takes its ground and threads from the tokens on its host", () => {
    const host = document.createElement("div");
    host.style.setProperty("--background", "rgb(255, 0, 0)");
    host.style.setProperty("--brand-tenku", "rgb(0, 128, 0)");
    host.style.setProperty("--brand-fushimi", "rgb(0, 0, 255)");
    document.body.append(host);
    const colours = defaultColours();

    readColours(host, colours);
    host.remove();

    expect(colours.ground.toArray()).toEqual([1, 0, 0]);
    expect(colours.red.toArray()).toEqual([0, 0, 1]);
    /* Read in sRGB, kept in linear light: mid green is about a fifth of full green. */
    expect(colours.inks[0]?.y).toBeCloseTo(0.216, 2);
  });
});

describe("kumihimo scene under StrictMode", () => {
  it("keeps writing its progress after the double mount of development", async () => {
    const progress = { value: 0 };
    const ready = vi.fn<() => void>();
    const screen = await render(
      <StrictMode>
        <div style={{ width: 240, height: 150, position: "relative" }}>
          <KumihimoScene tier="light" onReady={ready} progress={progress} posterAspect={1.6} />
        </div>
      </StrictMode>,
    );
    await expect.poll(() => ready.mock.calls.length, { timeout: 15_000 }).toBe(1);
    const canvas = canvasIn(screen.container);
    const tangled = await canvasPixels(canvas);

    progress.value = 1;

    await expect
      .poll(async () => difference(tangled, await canvasPixels(canvas)), { timeout: 15_000 })
      .toBeGreaterThan(4);
  });
});
