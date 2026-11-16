# La coupe sur la section FAQ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jouer le geste exact de la coupe (shuriken + fente + chute + reveal du closing) sur la vraie section FAQ au lieu d'un papier WebGL, précédé d'un vrai temps de lecture, le tout en DOM/CSS.

**Architecture:** La FAQ et le closing deviennent une seule scène épinglée (`ScrollScene`). On réutilise **tel quel** `coupe-geometry.ts` (toutes les courbes du geste) ; on ajoute un temps mort de lecture en tête via un remap de progress, et on re-cible la pose du WebGL (`coupe-pose.ts` / three.js) vers des transforms CSS appliquées à deux copies clippées de la FAQ, un shuriken SVG et une hairline. Le closing attend derrière, révélé quand les moitiés tombent. Les fichiers WebGL de la coupe sont retirés.

**Tech Stack:** React 19 (client leaves), GSAP + ScrollTrigger (déjà via `ScrollScene`, lazy sous `AfterIdle`), CSS 3D transforms + `clip-path`, Vitest + Storybook (play + a11y), SVG (`brand/shuriken-paths.ts`).

**Spec:** `docs/superpowers/specs/2026-11-15-shuriken-traverse-faq-design.md`

## Global Constraints

- Tokens seulement dans `packages/ui/src/styles/theme.css` ; lint : pas d'arbitraire **en classes**, pas de marges (sauf `*-auto`), pas de single-side padding, pas de `space-*`, z-index/durées/bordures sur l'échelle. Les valeurs de transform/clip variables sont posées **en inline par JS/GSAP** (hors portée du lint sur les classes).
- `apps/*` : jamais de `className` ni `style` ; composer `@repo/ui` seulement.
- GSAP/Lenis jamais au first paint : tout code moteur vit dans un module rendu lazy sous `AfterIdle` (comme `ScrollScene`). Pas d'import `gsap` statique dans un composant du first load.
- `minWidth: "md"` : sous md et en `prefers-reduced-motion: reduce`, pas de geste — la FAQ puis le closing se lisent en entier (plate statique `still`).
- Le geste ne doit **pas** dériver : les fonctions de `coupe-geometry.ts` restent inchangées, le temps de lecture est un remap **avant** le geste.
- Chaque composant `@repo/ui` : `cva` + `cn()` + `data-slot` + export nommé + un composant par fichier + une story (play + a11y) ; logique pure testée dans `tests/` ; imports `@repo/ui/<folder>/<file>`.
- DoD : `pnpm check` et `pnpm test:e2e` verts (audit motion inclus), Lighthouse mobile+desktop OK sur chaque route, `motion-review` ≥ 4 sur chaque critère, agent `design-reviewer`. Pas d'ADR (on retire WebGL, aucune techno nouvelle). Routes inchangées.

## Review Focus

- **Closing atteignable au clavier/lecteur d'écran avant le reveal** : le closing (bouton, le seul rouge) est dans le DOM derrière la FAQ opaque dès `progress` 0 ; sans `inert` il est tabbable et lu alors qu'il est invisible. Test dans la tâche de la scène combinée (Task 6).
- **FAQ encore dans l'arbre a11y après la coupe** : une fois les moitiés tombées, les copies clippées ne doivent plus être lues (double FAQ + closing). Test dans Task 6.
- **Focus pendant le swap live → copies figées** : ouvrir une question puis déclencher le geste ne doit pas piéger le focus ni le perdre hors écran. Test dans Task 6.
- **FAQ plus haute qu'un écran sur md+** : épinglée pendant la lecture, une FAQ trop haute déborde et ne se lit pas d'un coup ; la scène doit contenir le débordement (clip) et rester lisible, le builder cale la taille. Test (overflow clippé, pas de scroll interne) dans Task 6.
- **Ancre `#questions` + cii-cookie** : `page-nav.tsx` et `cii-cookie.tsx` pointent `#questions` ; après déplacement de la FAQ, le lien doit atterrir sur la FAQ lisible (`progress` 0), pas au milieu du geste. Test dans Task 7.

---

### Task 1: Temps de lecture — remap de progress (pur)

**Files:**

- Modify: `packages/ui/src/motion/coupe-geometry.ts`
- Test: `packages/ui/tests/coupe-geometry.test.ts`

**Interfaces:**

- Consomme : les constantes existantes `HOLD_SCREENS`, `coupeHold()` (inchangés).
- Produit :
  - `READING_SCREENS: number` (constante, temps mort de lecture, ~1 écran).
  - `sceneHold(): number` — total épinglé = `READING_SCREENS + HOLD_SCREENS`.
  - `readingFraction(): number` — `READING_SCREENS / sceneHold()`.
  - `gestureProgress(sceneProgress: number): number` — 0 sur `[0, readingFraction()]`, puis map linéaire de `[readingFraction(), 1]` vers `[0, 1]`, clampé.
  - Les fonctions existantes (`throwPosition`, `ghostRaw`, `slitOpacity`, `slideAt`, `partAt`, `shake`, `TITLE_REVEAL`, `BUTTON_REVEAL`, `coupeHold`) restent **inchangées** et continuent de prendre la progression du **geste**.

- [ ] **Step 1: Write the failing tests** dans `coupe-geometry.test.ts` :

```ts
describe("the reading dwell before the gesture", () => {
  it("holds the gesture at zero through the whole reading dwell", () => {
    expect(gestureProgress(0)).toBe(0);
    expect(gestureProgress(readingFraction() * 0.5)).toBe(0);
    expect(gestureProgress(readingFraction())).toBeCloseTo(0);
  });
  it("maps the rest of the scroll linearly onto the full gesture", () => {
    expect(gestureProgress(1)).toBeCloseTo(1);
    const mid = readingFraction() + (1 - readingFraction()) * 0.5;
    expect(gestureProgress(mid)).toBeCloseTo(0.5);
  });
  it("extends the held scene by the reading dwell without touching the gesture hold", () => {
    expect(sceneHold()).toBeCloseTo(READING_SCREENS + coupeHold());
    expect(coupeHold()).toBeGreaterThanOrEqual(2); // inchangé
  });
});
```

- [ ] **Step 2: Run to verify they fail** — `pnpm --filter @repo/ui exec vitest run tests/coupe-geometry.test.ts` → FAIL (exports manquants).
- [ ] **Step 3: Implémenter** `READING_SCREENS`, `sceneHold`, `readingFraction`, `gestureProgress` dans `coupe-geometry.ts` (réutiliser le `clamp01`/`segment` déjà présents). Choisir `READING_SCREENS` ≈ 1 ; valeur finale calée en motion-review.
- [ ] **Step 4: Run** le fichier → PASS (les tests existants restent verts).
- [ ] **Step 5: Commit** `feat(ui): add a reading dwell remap before the coupe gesture`.

---

### Task 2: Pose DOM de la coupe (pur)

**Files:**

- Create: `packages/ui/src/scene/coupe-dom-pose.ts`
- Test: `packages/ui/tests/coupe-dom-pose.test.ts`

**Interfaces:**

- Consomme : `gestureProgress` (Task 1) et les fonctions de `coupe-geometry.ts` ; la géométrie de coupe (centre, direction) portée en fractions d'écran, miroir de `CUT_CENTER`/`CUT_DIRECTION` de `coupe-world.ts`.
- Produit `poseCoupeDom(sceneProgress: number): CoupeDomPose` avec :
  - `star: { visible: boolean; along: number; spinTurns: number }` (`along` 0→1 le long de la coupe).
  - `ghosts: { visible: boolean; along: number; spinTurns: number }[]` (longueur `GHOST_COUNT`).
  - `slit: { opacity: number; along: number }` (hairline de l'entrée jusqu'à la tête).
  - `halves: { side: 1 | -1; slide: number; part: number }[]` (haut puis bas).
  - `shake: { x: number; y: number }` (fraction de l'amplitude).
  - `revealed: boolean` (true quand `partAt` dépasse le seuil où le closing est à découvert — pour basculer `inert`).

Tout dérive des fonctions existantes appliquées à `g = gestureProgress(sceneProgress)`. Pas de three.js, pas de px absolus (fractions/ratios ; le composant convertit en CSS).

- [ ] **Step 1: Write the failing tests** `coupe-dom-pose.test.ts` : le star est caché avant l'entrée et après la sortie (`throwVisible`) ; `star.along` croît de 0 à 1 sur le jet ; chaque ghost est en retrait du star ; `slit.opacity` suit `slitOpacity` ; `halves[0].part` croît avec la progression tardive et vaut ~1 en fin de hold ; `shake` nul avant que la page donne, non nul juste après ; `revealed` passe de `false` à `true` une fois les moitiés écartées. (Assertions aux mêmes points `screens()` que `coupe-geometry.test.ts`, mais en passant par `poseCoupeDom` avec le sceneProgress remappé.)
- [ ] **Step 2: Run to verify fail** → FAIL.
- [ ] **Step 3: Implémenter** `poseCoupeDom` en composant les fonctions de `coupe-geometry.ts` ; définir le seuil de `revealed` à partir de `partAt`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(ui): add the DOM pose for the coupe, retargeted from the WebGL pose`.

---

### Task 3: Couche shuriken SVG (star + ghosts + hairline)

**Files:**

- Create: `packages/ui/src/agents/coupe-blade.tsx`
- Create: `packages/ui/stories/agents-coupe-blade.stories.tsx`
- Test (story): le `play` + accessibility check de la story.

**Interfaces:**

- Consomme : `poseCoupeDom` (Task 2), `STAR` de `brand/shuriken-paths.ts`, la géométrie de coupe (Task 2).
- Produit : `CoupeBlade` — composant client présentiel, `data-slot="coupe-blade"`, `aria-hidden` (décoratif). Props : `pose: CoupeDomPose` (contrôlé par le parent, posé chaque frame). Rend un SVG avec la star, `GHOST_COUNT` ghosts (opacités décroissantes, comme `buildStars`) et une hairline ; positions/rotations en transforms inline depuis `pose`. Couleur via le token Fushimi (`--color-fushimi`) et `--color-fuji-deep` pour la hairline (utilitaires existants seulement).

- [ ] **Step 1: Write the story** avec un contrôle de `sceneProgress` (quelques valeurs clés : lecture, jet à mi-course, après sortie) qui calcule `poseCoupeDom` et rend `CoupeBlade`. `play` : à mi-jet, le groupe star est visible et placé ; en lecture, non visible. Accessibility check actif.
- [ ] **Step 2: Run the story test** — `pnpm --filter @repo/ui exec vitest run stories/agents-coupe-blade.stories.tsx` → FAIL (composant manquant).
- [ ] **Step 3: Implémenter** `CoupeBlade` (SVG, `cva`/`cn`/`data-slot`, export nommé). Pas de WebGL. Détail visuel (taille, flou éventuel des ghosts) calé en motion-review.
- [ ] **Step 4: Run** → PASS (play + a11y).
- [ ] **Step 5: Commit** `feat(ui): add the SVG coupe blade (star, ghosts, hairline)`.

---

### Task 4: Les deux moitiés clippées de la FAQ

**Files:**

- Create: `packages/ui/src/agents/coupe-halves.tsx`
- Create: `packages/ui/stories/agents-coupe-halves.stories.tsx`

**Interfaces:**

- Consomme : `poseCoupeDom` (Task 2), la géométrie de coupe (ligne de découpe en %).
- Produit : `CoupeHalves` — composant client. Props : `children: ReactNode` (le contenu fendu, ici la FAQ figée), `pose: CoupeDomPose`. Rend **deux** copies de `children` empilées, chacune `clip-path` le long de la coupe (haut / bas), transformées (translate le long de la normale + glissement + rotation 3D en perspective) depuis `pose.halves`, avec une face arrière washi (pseudo-couche de ton washi) quand elles basculent. La copie du bas est `aria-hidden` (une seule des deux lue). `data-slot="coupe-halves"`.

- [ ] **Step 1: Write the story** : contenu de démo fendu à plusieurs `part` (fermé, mi-chute, ouvert). `play` : à `part` 0 le contenu est lisible et joint ; à `part` 1 les deux moitiés sont écartées (transforms non nuls). Accessibility check : une seule copie dans l'arbre (l'autre `aria-hidden`).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implémenter** `CoupeHalves` (clip-path statique en inline, transforms inline depuis `pose`). Perspective/backface réglés en motion-review pour coller au rendu WebGL actuel.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(ui): add the clipped FAQ halves for the DOM coupe`.

---

### Task 5: FAQ réutilisable (sort de la page, entre dans la scène)

**Files:**

- Create: `packages/ui/src/agents/faq-list.tsx` (liste présentielle de `FaqItem`, Server-Component-safe)
- Create: `packages/ui/stories/agents-faq-list.stories.tsx`
- Modify: `apps/web/src/features/agents/questions-section.tsx` (consomme `FaqList`)

**Interfaces:**

- Produit : `FaqList` — props `items: { id: string; question: string; answer: string }[]`, rend les `FaqItem` (mise en page actuelle de `QuestionsSection`, titre + colonne). Réutilisable par la scène combinée (Task 6) et par le rendu lisible/`still`.
- `questions-section.tsx` garde son rôle d'aujourd'hui tant que la scène combinée n'est pas branchée (Task 7 fera le déplacement final).

- [ ] **Step 1: Write the story** `FaqList` : rend N items, `play` ouvre un item (disclosure native marche), a11y check.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implémenter** `FaqList` en extrayant le balisage de `QuestionsSection` ; faire consommer `FaqList` par `QuestionsSection` (comportement inchangé).
- [ ] **Step 4: Run** la story + `pnpm --filter @repo/web exec vitest run` des specs touchant la FAQ → PASS.
- [ ] **Step 5: Commit** `refactor(ui): extract FaqList for reuse in the coupe scene`.

---

### Task 6: Scène combinée FAQ + closing (le cœur)

**Files:**

- Create: `packages/ui/src/agents/coupe-scene.tsx` (client ; la scène DOM complète)
- Rewrite: `packages/ui/src/agents/closing-coupe.tsx` (compose la scène)
- Create: `packages/ui/stories/agents-coupe-scene.stories.tsx`
- Modify: `packages/ui/tests/agents-closing-coupe.test.tsx`

**Interfaces:**

- Consomme : `ScrollScene` (`length={sceneHold()}`, `below="header"`, `minWidth="md"`, `scrub`), `poseCoupeDom` (Task 2), `CoupeBlade` (Task 3), `CoupeHalves` (Task 4), `FaqList` (Task 5).
- Produit : `ClosingCoupe` — props `faq: ReactNode` (la FAQ lisible), `children: ReactNode` (le closing). Structure de la scène épinglée, du fond vers le dessus :
  1. le **closing** (`children`), `inert` tant que `!pose.revealed` ;
  2. la **FAQ vivante** (`faq`) visible et interactive sur `[0, readingFraction()]` ; au départ du geste on la fige et on bascule vers `CoupeHalves` (instantané) ;
  3. `CoupeBlade` au-dessus.
     Une boucle rAF lit `progress.value`, calcule `poseCoupeDom`, pose `CoupeBlade`/`CoupeHalves` et bascule `inert`/`aria-hidden`. `still` (reduced-motion / <md) : `faq` puis `children`, lus en entier, sans geste.

- [ ] **Step 1: Write the failing tests** dans `agents-closing-coupe.test.tsx` + la story `play` :
  - **a11y closing caché** : au rendu (progress 0), le conteneur du closing porte `inert`/`aria-hidden` ; après simulation d'un progress révélé, il ne l'est plus.
  - **a11y FAQ après coupe** : une fois révélé, les copies `CoupeHalves` sont `aria-hidden`/`inert` (pas de double FAQ lue).
  - **still** : sous reduced motion, la FAQ et le closing sont tous deux dans le document, sans canvas ni copie figée.
  - **overflow** : le conteneur épinglé clippe le débordement (pas de scrollbar interne) quand la FAQ dépasse (story avec beaucoup d'items).
  - **focus** : ouvrir un item puis passer `revealed` ne laisse pas le focus dans une couche `inert` (le focus repart sur le closing révélé).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implémenter** `coupe-scene.tsx` + réécrire `closing-coupe.tsx`. rAF via un module lazy sous `AfterIdle` si besoin de GSAP ; sinon rAF nu lisant `progress.value`. Le détail visuel (perspective, timings fins) est calé en motion-review.
- [ ] **Step 4: Run** la story + le test → PASS.
- [ ] **Step 5: Commit** `feat(ui): play the coupe gesture on the real FAQ, after a reading dwell`.

---

### Task 7: Câblage de la page (déplacer la FAQ dans la scène)

**Files:**

- Modify: `apps/web/src/features/agents/closing-section.tsx` (passe la FAQ + le closing à `ClosingCoupe`)
- Modify: `apps/web/src/features/agents/conversion-sections.tsx` (retire `QuestionsSection`)
- Modify: `apps/web/src/features/agents/questions-section.tsx` (devient le fournisseur de la FAQ consommée par la scène, garde `id="questions"` au bon endroit) ou est absorbé par `closing-section.tsx`
- Modify: `apps/web/e2e/agents-content.spec.ts` (ordre des sections, ancre)

**Interfaces:**

- Consomme : `ClosingCoupe` (Task 6, props `faq`/`children`), `FaqList` (Task 5), `objections` (contenu).
- `#questions` reste une ancre atteignable posée sur la FAQ lisible (début du track de la scène) ; `page-nav.tsx` (lien « FAQ ») et `cii-cookie.tsx` (action `#questions`) continuent d'y atterrir.

- [ ] **Step 1: Write the failing test** (e2e `agents-content.spec.ts`) : l'ordre des sections est Problème → … → CII → (FAQ+closing) ; cliquer « FAQ » dans la nav amène sur la FAQ lisible ; la FAQ et le closing sont présents.
- [ ] **Step 2: Run** `pnpm --filter @repo/web build && pnpm --filter @repo/web test:e2e` ciblé → FAIL.
- [ ] **Step 3: Implémenter** le déplacement : `ConversionSections` perd `QuestionsSection` (CII devient la dernière avant la couture) ; `ClosingSection` compose `ClosingCoupe faq={<FaqList …/>}`>`<ClosingCopy/>`. Reporter `id="questions"` + `paper="plie"` au bon niveau.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(web): move the FAQ into the closing coupe scene`.

---

### Task 8: Retirer la coupe WebGL (dead code)

**Files:**

- Delete: `packages/ui/src/scene/coupe-scene.tsx`, `coupe-world.ts`, `coupe-sheet.ts`, `use-coupe-world.ts` ; `packages/ui/src/motion/coupe-pose.ts`, `coupe-stage.tsx`
- Delete: `packages/ui/tests/coupe-world.test.tsx`, `coupe-scene.test.tsx`
- Keep: `coupe-geometry.ts` (utilisé par la pose DOM) et `coupe-choreography.ts` (toujours utilisé : la nouvelle scène tween `progress` 0→1 via `ScrollScene`)
- Verify: `knip` (via `pnpm check`)

**Interfaces:** aucune nouvelle.

- [ ] **Step 1:** Supprimer les fichiers WebGL de la coupe et leurs tests.
- [ ] **Step 2: Run** `pnpm check` → résoudre tout import orphelin ; `knip` ne signale plus de fichier/export/dépendance inutilisé (une dépendance `three` n'est peut-être plus tirée par la coupe mais peut rester utilisée ailleurs — ne pas retirer une dépendance partagée sans vérifier).
- [ ] **Step 3: Run** la suite UI → PASS.
- [ ] **Step 4: Commit** `chore(ui): remove the WebGL coupe, replaced by the DOM coupe`.

---

### Task 9: Doc, inventaire, motion-review

**Files:**

- Modify: `DESIGN.md` (section « Coupe » : la coupe se joue sur la FAQ, en DOM, avec temps de lecture ; retrait du WebGL)
- Modify: `packages/ui/AGENTS.md` (inventaire : `ClosingCoupe` nouvelles props, `CoupeBlade`, `CoupeHalves`, `FaqList` ; retrait des entrées WebGL de la coupe)
- Verify: `motion-review`, `design-reviewer`, Lighthouse

- [ ] **Step 1:** Mettre à jour `DESIGN.md` (choix de direction, pas d'ADR) et l'inventaire `packages/ui/AGENTS.md`.
- [ ] **Step 2: Run** `pnpm check`, `pnpm test:e2e` (audit motion inclus : pas de scène gelée, pas de canvas sous reduced motion), `pnpm --filter @repo/web lighthouse` (mobile+desktop, chaque route).
- [ ] **Step 3:** Lancer `motion-review` sur la scène (chaque critère ≥ 4 : seam de lecture→jet, lisibilité, LoAF, chute) puis l'agent `design-reviewer` ; appliquer les réglages (timings fins, perspective, backface, `READING_SCREENS`) et re-capturer.
- [ ] **Step 4: Commit** `docs: record the DOM coupe on the FAQ in DESIGN.md and the inventory`.
