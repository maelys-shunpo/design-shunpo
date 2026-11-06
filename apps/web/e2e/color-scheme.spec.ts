import { expect, type Page, test } from "@playwright/test";

import { routes } from "./support/routes.ts";

interface Island {
  expected: string | undefined;
  luminance: number;
}

function readIslands(elements: Element[]): Island[] {
  const MID = 0.5;
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function luminanceOf(color: string): number {
    if (context === null) {
      return MID;
    }
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  }
  return elements
    .filter((element): element is HTMLElement => element instanceof HTMLElement)
    .map((element) => ({
      expected: element.dataset["scheme"],
      luminance: luminanceOf(getComputedStyle(element).backgroundColor),
    }));
}

const MID_LUMINANCE = 0.5;

/* Every route, one after the other on the same tab. */
async function islandsOnEveryRoute(page: Page): Promise<Island[]> {
  const islands: Island[] = [];
  for (const route of routes) {
    // oxlint-disable-next-line no-await-in-loop -- one tab visits the routes in turn.
    await page.goto(route);
    // oxlint-disable-next-line no-await-in-loop -- read each route before leaving it.
    islands.push(...(await page.locator("[data-scheme]").evaluateAll(readIslands)));
  }
  return islands;
}

function schemeOf({ luminance }: Island): "dark" | "light" {
  return luminance < MID_LUMINANCE ? "dark" : "light";
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} page`, () => {
    test.use({ colorScheme });

    test("scheme islands keep their own scheme", async ({ page }) => {
      const islands = await islandsOnEveryRoute(page);

      expect(islands.length).toBeGreaterThan(0);
      expect(islands.map((island) => schemeOf(island))).toEqual(
        islands.map((island) => island.expected),
      );
    });
  });
}
