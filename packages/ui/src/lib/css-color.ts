export type Rgb = [red: number, green: number, blue: number];

function toRgb(color: string): Rgb {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (context === null) {
    return [0, 0, 0];
  }
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

/* The colour a custom property resolves to on this host, in 0–255 sRGB: scenes read theme tokens with it,
   so a direction or a scheme island recolours the canvas like the page. */
export function resolveColor(host: Element, property: `--${string}`): Rgb {
  const probe = document.createElement("span");
  probe.style.color = `var(${property})`;
  host.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return toRgb(color);
}
