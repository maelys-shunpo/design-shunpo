import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { findDesignViolations } from "@repo/design-audit/analyze";
import { collectElements, collectTokenScales } from "@repo/design-audit/collect";

const UNKNOWN_URL = "/cette-page-n-existe-pas";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/* A paper grain is a picture: axe reports its contrast as incomplete, not a violation. Take every paper texture off so
   contrast is checked against the paper's own colour, as the routes' design audit does. */
const PAPERS = [".agents-washi", ".agents-froisse", ".agents-plie", ".agents-paper-fibres"];
const PLAIN_PAPER = `${PAPERS.join(", ")} { background-image: none !important; }`;

test("an unknown address shows the crumpled-sheet 404 with the way home", async ({ page }) => {
  const response = await page.goto(UNKNOWN_URL);
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Cette page n’existe pas." }),
  ).toBeVisible();
  await expect(
    page.getByText("Le lien est peut-être ancien, ou l’adresse contient une faute de frappe."),
  ).toBeVisible();
  const home = page.getByRole("link", { name: "Revenir à l’accueil" });
  await expect(home).toHaveAttribute("href", /\/$/u);
  await expect(page).toHaveTitle("Page introuvable · SHUNPO");
});

test("the sheet unfolds on arrival and the message stays readable", async ({ page }) => {
  await page.goto(UNKNOWN_URL);
  /* The message reads within the safety window whether or not the scene ever goes live. */
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 1500 });
  /* A first interaction lets a light-tier device load the scene (the stage waits for one). */
  await page.mouse.wheel(0, 1);
  /* Once the scene mounts, its canvas sits inside an aria-hidden layer (the game is decorative). */
  const hiddenCanvas = page.locator("[data-slot='paper-crumple'] [aria-hidden='true'] canvas");
  await expect(hiddenCanvas).toBeAttached({ timeout: 12_000 });
});

test.describe("the 404 holds the design system", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(`${colorScheme} scheme`, () => {
      test.use({ colorScheme, contextOptions: { reducedMotion: "reduce" } });

      test("meets WCAG 2.2 AA", async ({ page }) => {
        await page.goto(UNKNOWN_URL);
        await page.addStyleTag({ content: PLAIN_PAPER });
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations).toEqual([]);
      });

      test("never scrolls horizontally", async ({ page }) => {
        await page.goto(UNKNOWN_URL);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
      });

      test("uses only tokens, symmetric paddings, comfortable targets and no overlaps", async ({
        page,
      }) => {
        await page.goto(UNKNOWN_URL);
        const scales = await page.evaluate(collectTokenScales);
        const elements = await page.evaluate(collectElements);
        expect(findDesignViolations(scales, elements)).toEqual([]);
      });
    });
  }

  test("the keyboard reaches the way home", async ({ page }) => {
    await page.goto(UNKNOWN_URL);
    const home = page.getByRole("link", { name: "Revenir à l’accueil" });
    await expect(home).toBeVisible();
    /* The call is a native link in the normal tab order (Task 4 keeps the game's canvas aria-hidden, out of it). */
    await home.focus();
    await expect(home).toBeFocused();
  });
});
