import { page } from "vitest/browser";

const GRID = { width: 64, height: 36 };

export function canvasIn(container: HTMLElement): HTMLCanvasElement {
  const canvas = container.querySelector("canvas");
  if (canvas === null) {
    throw new Error("The scene drew no canvas.");
  }
  return canvas;
}

/* What the page shows of a canvas, on a small grid. A screenshot, because a WebGL canvas drawn without
   preserveDrawingBuffer reads back empty once its frame is presented. */
export async function canvasPixels(canvas: HTMLCanvasElement): Promise<Uint8ClampedArray> {
  const base64 = await page.screenshot({ element: canvas, save: false });
  const bytes = Uint8Array.from(atob(base64), (character) => character.codePointAt(0) ?? 0);
  const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
  const probe = new OffscreenCanvas(GRID.width, GRID.height);
  const context = probe.getContext("2d");
  context?.drawImage(bitmap, 0, 0, GRID.width, GRID.height);
  bitmap.close();
  return context?.getImageData(0, 0, GRID.width, GRID.height).data ?? new Uint8ClampedArray();
}

export function countPixels(
  pixels: Uint8ClampedArray,
  matches: (red: number, green: number, blue: number) => boolean,
): number {
  let count = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    if (matches(pixels[index] ?? 0, pixels[index + 1] ?? 0, pixels[index + 2] ?? 0)) {
      count += 1;
    }
  }
  return count;
}
