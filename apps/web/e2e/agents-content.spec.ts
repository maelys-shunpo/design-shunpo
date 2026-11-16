import { expect, type Locator, test } from "@playwright/test";

/* The title and the drifting columns of #avis, measured in the page: how far the title's centre sits from the section's
   centre (it is centred), whether the title stands above the columns (stacked, not beside them), and whether it still
   comes first in the DOM. Throws if the section has not rendered them. */
async function driftGeometry(section: Locator) {
  const geometry = await section.evaluate((element) => {
    const heading = element.querySelector("h2");
    const columns = element.querySelector("[data-slot=testimonial-drift]");
    if (heading === null || columns === null) {
      return null;
    }
    const headingBox = heading.getBoundingClientRect();
    const columnsBox = columns.getBoundingClientRect();
    const sectionBox = element.getBoundingClientRect();
    return {
      centreOffset: Math.abs(
        (headingBox.left + headingBox.right) / 2 - (sectionBox.left + sectionBox.right) / 2,
      ),
      titleAbove: headingBox.bottom <= columnsBox.top + 8,
      headingPrecedes: Boolean(
        heading.compareDocumentPosition(columns) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    };
  });
  if (geometry === null) {
    throw new Error("No testimonials drift rendered in #avis");
  }
  return geometry;
}

test("agents page leads from growth friction to time saved", async ({ page }) => {
  await page.goto("/agents");

  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Votre entreprise grandit et vos outils ne suivent plus ?",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Vos outils devraient vous faire gagner du temps. Pas vous en faire perdre.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Exemple · une facture fournisseur")).toHaveCount(0);
});

test("the testimonials stand centred under their title", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/agents");

  const section = page.locator("#avis");
  const drift = section.locator("[data-slot=testimonial-drift]");
  await drift.scrollIntoViewIfNeeded();
  await expect(drift).toBeVisible();

  /* The title's entrance rises it into place; poll until it has settled above the columns. */
  await expect.poll(async () => (await driftGeometry(section)).titleAbove).toBe(true);

  const settled = await driftGeometry(section);
  /* The title is centred over the section, not pushed to one side. */
  expect(settled.centreOffset).toBeLessThan(50);
  /* The title still reads before the cards for a screen reader. */
  expect(settled.headingPrecedes).toBe(true);
});
