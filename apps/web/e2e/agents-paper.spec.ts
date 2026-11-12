import { expect, test } from "@playwright/test";

/* One texture per role (DESIGN.md, « Une texture par rôle »): the washi stays on the tools, the composer crumples its
   Shiro, one large sheet unfolds behind the questions, the problem's night stirs a film grain under its content, and
   what clients sign (their words, their names) is printed on fibrous washi. Every other ground is plain paper, so each
   texture keeps its value. */
test("agents page dresses each ground in its own paper", async ({ page }) => {
  await page.goto("/agents");

  const found = await page.evaluate(() => ({
    grounds: [...document.querySelectorAll("main [id]")]
      .map((element) => `${element.id}:${getComputedStyle(element).backgroundImage}`)
      .filter((ground) => ground.includes("agents-")),
    night: [...document.querySelectorAll("[data-question-night]")]
      .map((element) => getComputedStyle(element, "::before").backgroundImage)
      .join("|"),
    testimonials: [...document.querySelectorAll("[data-slot=testimonial]")]
      .map((element) => getComputedStyle(element, "::after").backgroundImage)
      .join("|"),
    tiles: [...document.querySelectorAll("[data-slot=reference-tile]")]
      .map((element) => getComputedStyle(element).backgroundImage)
      .join("|"),
  }));
  const grounds = found.grounds.map((ground) =>
    ground.replace(/:url\(.*agents-(?<name>[a-z]+)\..*$/u, ":$<name>"),
  );

  expect(grounds).toEqual(["outils:washi", "essayer:froisse", "questions:plie"]);
  expect(found.night).toMatch(/agents-grain/u);
  expect(found.testimonials).toMatch(/agents-fibres/u);
  expect(found.tiles).toMatch(/agents-fibres/u);
});
