import { expect, test } from "@playwright/test";

/* One texture per role (DESIGN.md, « Une texture par rôle »): the composer crumples its Shiro, one large sheet unfolds
   behind the questions, the problem's night stirs a film grain under its content, and what clients sign (their words,
   their names) is printed on fibrous washi. The tools ground is plain, like every other, so each texture keeps its
   value. */
test("agents page dresses each ground in its own paper", async ({ page }) => {
  await page.goto("/agents");
  /* The section papers are held off the first paint until `PaperGate` opens them once the page is idle (`html[data-papers]`). */
  await page.waitForFunction(() => Object.hasOwn(document.documentElement.dataset, "papers"));

  const found = await page.evaluate(() => ({
    grounds: [...document.querySelectorAll("main [id]")]
      .map((element) => `${element.id}:${getComputedStyle(element).backgroundImage}`)
      .filter((ground) => ground.includes("agents-")),
    cases: [...document.querySelectorAll("#references")]
      .map((element) => getComputedStyle(element, "::before").backgroundImage)
      .join("|"),
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

  expect(grounds).toEqual(["essayer:froisse", "questions:plie"]);
  expect(found.night).toMatch(/agents-grain/u);
  expect(found.cases).toMatch(/agents-grain/u);
  expect(found.testimonials).toMatch(/agents-fibres/u);
  expect(found.tiles).toMatch(/agents-fibres/u);
});
