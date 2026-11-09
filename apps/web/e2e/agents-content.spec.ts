import { expect, test } from "@playwright/test";

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
