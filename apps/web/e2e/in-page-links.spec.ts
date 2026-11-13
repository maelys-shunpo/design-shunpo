import { expect, test } from "@playwright/test";

import { routes } from "./support/routes.ts";

/* An in-page link whose target has gone scrolls nowhere: the page still reads whole and the call quietly does
   nothing. Every `#` link therefore has to find its element on the page it stands on. */
function danglingAnchors(): string[] {
  return [...document.querySelectorAll("a[href^='#']")]
    .map((link) => link.getAttribute("href") ?? "")
    .filter(
      (href) => href.length > 1 && document.querySelector(`[id="${href.slice(1)}"]`) === null,
    );
}

for (const route of routes) {
  test(`${route} links only to anchors it holds`, async ({ page }) => {
    await page.goto(route);

    expect(await page.evaluate(danglingAnchors)).toEqual([]);
  });
}
