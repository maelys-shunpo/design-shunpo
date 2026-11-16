import { CanvasTexture, ClampToEdgeWrapping, SRGBColorSpace } from "three";

import { type Rgb, resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";

/* The sheet picture is drawn a little wider than it is tall, the proportion the closing frames it at by default; the
   world then lays it once over the frame (a cover crop), never tiling, whatever the window's aspect. */
const SHEET_ASPECT = 1.6;

/* Draws a sheet of paper over a canvas: the base colour, a dusting of lighter and darker flecks, then short fibres. A
   warmer, more fibrous base reads as the washi backing; the lighter one as the printed face. */
export function drawPaper(canvas: HTMLCanvasElement, base: Rgb, fibres: number): void {
  const { width, height } = canvas;
  const context = canvas.getContext("2d");
  if (context === null) {
    return;
  }
  const [red, green, blue] = base;
  context.fillStyle = `rgb(${String(red)}, ${String(green)}, ${String(blue)})`;
  context.fillRect(0, 0, width, height);
  const flecks = Math.round(((width + height) / 2) * 10);
  for (let fleck = 0; fleck < flecks; fleck += 1) {
    const light = Math.random() < 0.5;
    context.fillStyle = `rgba(${light ? "255,255,250" : "150,135,112"},${String(Math.random() * 0.05)})`;
    context.beginPath();
    context.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 18 + 4,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  for (let fibre = 0; fibre < fibres; fibre += 1) {
    let x = Math.random() * width;
    let y = Math.random() * height;
    let angle = Math.random() * Math.PI * 2;
    context.strokeStyle = `rgba(150,135,112,${String(0.06 + Math.random() * 0.12)})`;
    context.lineWidth = Math.random() * 0.9 + 0.3;
    context.beginPath();
    context.moveTo(x, y);
    for (let step = 0; step < 8; step += 1) {
      angle += (Math.random() - 0.5) * 0.6;
      x += Math.cos(angle) * 7;
      y += Math.sin(angle) * 7;
      context.lineTo(x, y);
    }
    context.stroke();
  }
}

/* A paper texture from a picture, laid once (clamped at its edges, not tiled): the renderer tone-maps nothing on it,
   so the sheet keeps the page's own Kome. The pose sets its repeat and offset to cover the frame. */
export function sheetTexture(picture: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(picture);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  return texture;
}

/* The warm Kome sheet the closing cuts: the page's own paper drawn once as a landscape picture, so the world lays it
   over the frame without a tiling seam. Resolves the page's `--color-kome` from a host in the document. */
export function createPaperSheet(host: HTMLElement, tier: QualityTier): HTMLCanvasElement {
  const kome = resolveColor(host, "--color-kome");
  const canvas = document.createElement("canvas");
  canvas.width = tier === "full" ? 832 : 416;
  canvas.height = Math.round(canvas.width / SHEET_ASPECT);
  drawPaper(canvas, kome, tier === "full" ? 520 : 240);
  return canvas;
}
