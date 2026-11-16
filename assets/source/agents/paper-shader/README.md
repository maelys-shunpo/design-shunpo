# Paper shader masters

The three grey reliefs (`froisse.png`, `plie.png`, `fibres.png`) were rendered once from the open paper.design paper
texture shader (`@paper-design/shaders` 0.0.82, Apache-2.0), white paper over black shade, in a headless browser. No
runtime dependency ships: the page only loads the webp tiles in `packages/ui/src/styles/`.

The grain tile (`agents-grain.webp`) has no master: it is 256 px of seeded mid-grey noise (the sum of three uniforms per
pixel, mean centred on 128), written losslessly by the recipe below.

Re-render a master (throwaway script, run from `/tmp`, not from the repo; `REPO` is the path of your checkout):

```js
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(`${process.env.REPO}/apps/web/package.json`);
const { chromium } = require("@playwright/test");
/* Renders the paper.design paper texture as a grey relief: white paper, black shade, so 255 is flat paper. */
const jobs = {
  froisse: {
    width: 2880,
    height: 1800,
    rotation: 17,
    params: {
      fiber: 0.4,
      fiberSize: 0.5,
      roughness: 0.35,
      roughnessSize: 0.25,
      crumples: 1,
      crumpleCount: 15,
      angle: 60,
      seed: 49,
      scale: 1,
    },
  },
  plie: {
    width: 2880,
    height: 1800,
    rotation: 28,
    params: {
      fiber: 0.5,
      fiberSize: 0.5,
      roughness: 0.15,
      roughnessSize: 0.25,
      folds: 0.45,
      foldSizeX: 0.55,
      foldSizeY: 0.65,
      foldOffsetX: 0.3,
      foldOffsetY: 0.2,
      angle: 236,
      seed: 613,
      scale: 1,
    },
  },
  fibres: {
    width: 1320,
    height: 1320,
    rotation: 0,
    params: {
      fiber: 0.75,
      fiberSize: 0.35,
      roughness: 0.3,
      roughnessSize: 0.3,
      wrinkles: 0.35,
      wrinkleSize: 0.45,
      crumples: 0.35,
      crumpleCount: 9,
      angle: 300,
      seed: 21,
      scale: 2,
    },
  },
};
const browser = await chromium.launch();
for (const [name, job] of Object.entries(jobs)) {
  const page = await browser.newPage({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<body style="margin:0"><div id="host" style="width:${job.width}px;height:${job.height}px"></div></body>`,
  );
  const data = await page.evaluate(
    async ({ job }) => {
      const s = await import("https://esm.sh/@paper-design/shaders@0.0.82");
      const noise = s.getShaderNoiseTexture();
      if (!noise.complete || noise.naturalWidth === 0)
        await new Promise((r) => noise.addEventListener("load", r, { once: true }));
      const p = job.params;
      new s.ShaderMount(
        document.getElementById("host"),
        s.paperTextureFragmentShader,
        {
          u_isImage: false,
          u_imageAspectRatio: 1,
          u_colorBack: s.getShaderColorFromString("#ffffff"),
          u_colorPaper: s.getShaderColorFromString("#ffffff"),
          u_colorShadow: s.getShaderColorFromString("#000000"),
          u_blending: 1,
          u_distortion: 0,
          u_clip: false,
          u_angle: p.angle,
          u_seed: p.seed,
          u_roughness: p.roughness ?? 0,
          u_roughnessSize: p.roughnessSize ?? 0.5,
          u_roughnessRows: 0,
          u_fiber: p.fiber ?? 0,
          u_fiberSize: p.fiberSize ?? 0.5,
          u_folds: p.folds ?? 0,
          u_foldSizeX: p.foldSizeX ?? 1,
          u_foldSizeY: p.foldSizeY ?? 1,
          u_foldOffsetX: p.foldOffsetX ?? 0,
          u_foldOffsetY: p.foldOffsetY ?? 0,
          u_wrinkles: p.wrinkles ?? 0,
          u_wrinkleSize: p.wrinkleSize ?? 0.65,
          u_crumples: p.crumples ?? 0,
          u_crumpleCount: p.crumpleCount ?? 6,
          u_drops: 0,
          u_noiseTexture: noise,
          u_fit: s.ShaderFitOptions.cover,
          u_scale: p.scale,
          u_rotation: job.rotation,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0,
        },
        { preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: false },
        0,
        0,
        1,
        job.width * job.height * 4,
      );
      await new Promise((r) => setTimeout(r, 1500));
      return document.querySelector("#host canvas").toDataURL("image/png");
    },
    { job },
  );
  writeFileSync(`/tmp/texture-lab/render/${name}.png`, Buffer.from(data.split(",")[1], "base64"));
  await page.close();
}
await browser.close();
```

Turn a master into a calibrated tile (same idea as the washi: high-pass to the folds, seamless blend, scaled to a
standard deviation of about 3 grey levels at display width, offset so hard light keeps each ground's mean within half a
grey level):

```js
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const sharp = createRequire(
  `${process.env.REPO}/node_modules/.pnpm/sharp@0.35.5_@types+node@26.6.5/node_modules/`,
)("sharp");
/* input output width display targetStd quality seamless(0/1) grounds(hex,hex) */
const [input, output, widthArg, displayArg, stdArg, qualityArg, seamlessArg, groundsArg] =
  process.argv.slice(2);
const width = Number(widthArg),
  display = Number(displayArg),
  target = Number(stdArg),
  quality = Number(qualityArg),
  seamless = seamlessArg === "1";
const grounds = groundsArg
  .split(",")
  .map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
const { data: a, info } = await sharp(input)
  .resize({ width, kernel: "lanczos3" })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
const w = info.width,
  h = info.height;
/* Remove the shader's global light ramp: subtract the best-fitting plane. */
let sx = 0,
  sy = 0,
  sv = 0,
  sxx = 0,
  syy = 0,
  sxv = 0,
  syv = 0,
  n = w * h;
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const v = a[y * w + x];
    sx += x;
    sy += y;
    sv += v;
    sxx += x * x;
    syy += y * y;
    sxv += x * v;
    syv += y * v;
  }
const mx = sx / n,
  my = sy / n,
  mv = sv / n;
const bx = (sxv / n - mx * mv) / (sxx / n - mx * mx),
  by = (syv / n - my * mv) / (syy / n - my * my);
const relief = new Float32Array(n);
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++)
    relief[y * w + x] = a[y * w + x] - (mv + bx * (x - mx) + by * (y - my));
let tile = relief;
if (seamless) {
  tile = new Float32Array(n);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const shifted = relief[((y + (h >> 1)) % h) * w + ((x + (w >> 1)) % w)];
      const edge = Math.max(Math.abs((2 * x) / (w - 1) - 1), Math.abs((2 * y) / (h - 1) - 1));
      const k = Math.min(1, Math.max(0, (edge - 0.55) / 0.4));
      const t = k * k * (3 - 2 * k);
      tile[y * w + x] =
        ((1 - t) * relief[y * w + x] + t * shifted) / Math.sqrt((1 - t) ** 2 + t ** 2);
    }
}
let sum = 0;
for (const v of tile) sum += v;
const mean = sum / n;
const hardLight = (s, c) => (s <= 0.5 ? 2 * s * c : 1 - 2 * (1 - s) * (1 - c));
function shifts(values, delta) {
  const out = [];
  for (const rgb of grounds)
    for (const channel of rgb) {
      const c = channel / 255;
      let t = 0;
      for (const v of values) t += hardLight(Math.min(1, Math.max(0, (v + delta) / 255)), c);
      out.push((t / values.length - c) * 255);
    }
  return out;
}
function bestDelta(values) {
  let low = -40,
    high = 40;
  for (let i = 0; i < 40; i++) {
    const m1 = low + (high - low) / 3,
      m2 = high - (high - low) / 3;
    const f = (d) => Math.max(...shifts(values, d).map(Math.abs));
    if (f(m1) < f(m2)) high = m2;
    else low = m1;
  }
  return (low + high) / 2;
}
async function encode(scale, offset) {
  const raw = Buffer.alloc(n);
  for (let i = 0; i < n; i++)
    raw[i] = Math.max(0, Math.min(255, Math.round((tile[i] - mean) * scale + 128 + offset)));
  const webp = await sharp(raw, { raw: { width: w, height: h, channels: 1 } })
    .webp({ quality, effort: 6 })
    .toBuffer();
  const decoded = await sharp(webp).greyscale().raw().toBuffer();
  const shown = await sharp(webp)
    .greyscale()
    .resize({ width: display, kernel: "lanczos3" })
    .raw()
    .toBuffer();
  let s = 0,
    q = 0;
  for (const v of shown) {
    s += v;
    q += v * v;
  }
  return { webp, decoded, std: Math.sqrt(q / shown.length - (s / shown.length) ** 2) };
}
let sq = 0;
for (const v of tile) sq += (v - mean) ** 2;
let scale = target / Math.sqrt(sq / n),
  offset = 0,
  result;
for (let round = 0; round < 5; round++) {
  result = await encode(scale, offset);
  scale *= target / result.std;
  offset += bestDelta(Float32Array.from(result.decoded));
}
result = await encode(scale, offset);
const final = shifts(Float32Array.from(result.decoded), 0);
writeFileSync(output, result.webp);
console.log(
  output.split("/").pop(),
  `${w}x${h}`,
  "std@" + display,
  result.std.toFixed(2),
  (result.webp.length / 1024).toFixed(1) + " KB",
  "mean shift",
  final.map((x) => x.toFixed(2)).join(" "),
);
```

Final settings (12 November 2026, after the design review): froisse 2400 px q75 and plie 2880 px q80, both unseamed
and laid once over their section (`background-size: cover`), so they never repeat on wide screens and the plie's folds,
turned 28°, never run along a line of text; fibres 990 px q78 seamless on #FAF9F6; grain 256 px lossless.

The grain tile (run from `/tmp`, `node grain-tile.mjs 256 agents-grain.webp 1213`):

```js
import { createRequire } from "node:module";
const sharp = createRequire(
  `${process.env.REPO}/node_modules/.pnpm/sharp@0.35.5_@types+node@26.6.5/node_modules/`,
)("sharp");
/* size output seed: seeded mid-grey noise, the sum of three uniforms on [0, 85] per pixel (mean 127.5, std 42.5). */
const [sizeArg, output, seedArg] = process.argv.slice(2);
const size = Number(sizeArg);
let state = Number(seedArg) >>> 0;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const raw = Buffer.alloc(size * size);
for (let i = 0; i < raw.length; i++) raw[i] = Math.round(85 * (random() + random() + random()));
await sharp(raw, { raw: { width: size, height: size, channels: 1 } })
  .webp({ lossless: true, effort: 6 })
  .toFile(output);
```
