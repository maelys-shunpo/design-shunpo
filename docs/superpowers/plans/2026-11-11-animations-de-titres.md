# Animations de titres — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à chaque rôle de titre de la direction « Agents » son entrée : les lignes sous le masque (titres de section), la mise au point (« Notre méthode »), le rouleau (appel final et chiffres clés), le lancer (titres d'une ligne).

**Architecture:** Les entrées sont des constructeurs GSAP purs dans `packages/ui/src/agents/headline-entrances.ts` (et `headline-throw.ts` pour le lancer). `Headline` gagne une prop `entrance`; quand elle est posée, il rend à côté du titre un `HeadlineEntrance` client, qui charge `HeadlineMotion` dans `AfterIdle` et joue l'entrée par `enterUnseen`. `InkWord` réutilise l'entrée par lignes et y ajoute la mise au point. Le chiffre de `CaseCard` devient un `RollingFigure` avec son propre module différé.

**Tech Stack:** React 19, Next.js 16, GSAP 3.15 (SplitText, CustomEase), Tailwind v4 (`theme.css`), Vitest browser + Storybook tests.

**Spec:** `docs/superpowers/specs/2026-11-11-animations-de-titres-design.md`

## Global Constraints

- Valeurs du spec, recopiées telles quelles :
  - lignes : `yPercent: 115`, `rotate: 4`, pivot `0% 100%`, 0,9 s, `ease.emphasized`, `stagger: 0.09`, masques `overflow: visible` à 0,95 s ;
  - mise au point : lettres à 0,75 s, de `opacity: 0`, `blur(14px)`, `scale: 1.08`, 0,8 s, emphasized, `stagger: 0.045` ; crochets à 1,3 s, de `x: ∓0.35em` et `opacity: 0`, 0,55 s, courbe fluide ;
  - lettres (appel final) : masque par lettre, `yPercent: 110 → 0`, 0,7 s, emphasized, `stagger: 0.018`, découpage `words,chars` ;
  - rouleau : `10 + chiffre` crans, premier chiffre 1,1 s puis +0,25 s par chiffre, `power3.out` ; autres signes `yPercent: 30`, 0,6 s, emphasized, `stagger: 0.08`, à partir de 0,1 s ;
  - lancer : étoile à 0,42 em, rotation 0,9° par px, courbe `M0,0 C0.22,0.38 0.42,1 1,1`, mots de `opacity: 0`, `y: 0.22em`, `rotate: -8` (pivot `0% 100%`) en 0,55 s emphasized, rétrécit à 22 % sur les 3,2 dernières tailles, durée de trajet `0.00024 s/px` bornée [0,6 ; 1,4], puis timeline à `timeScale(0.4)`.
- Courbe fluide : `M0,0 C0.45,0.05 0.2,1 1,1` (= `cubic-bezier(0.45, 0.05, 0.2, 1)`).
- Déclenchement : une fois, à `rootMargin: "0px 0px -33% 0px"`, par `enterUnseen` (`packages/ui/src/motion/enter-unseen.ts`). Seule exception : « Notre méthode » rejoue tout si elle est déjà à l'écran.
- `prefers-reduced-motion: reduce` : rien ne s'anime, rien n'est découpé. Les téléphones animent comme le desktop.
- GSAP n'est jamais importé par un module du premier chargement : uniquement dans des modules `*-motion.tsx` chargés par `lazy` dans `AfterIdle`. Découpage après `document.fonts.ready`.
- Tout tween de lettre ou de morceau passe `force3D: false`.
- Texte accessible inchangé ; découpes et étoile `aria-hidden`.
- Règles du repo : named exports, kebab-case, pas de `className` dans `apps/*`, 250 lignes max par fichier, 60 par fonction, 3 paramètres max, tests dans `packages/ui/tests/`, chaque composant a sa story, `packages/ui/AGENTS.md` et `DESIGN.md` à jour.
- Ne pas modifier `case-ring.tsx`, `case-ring-course.ts` ni les fichiers `hero-*` : une autre session y travaille.
- **Commits.** L'arbre de travail contient le travail non commité d'autres sessions, y compris dans `theme.css`, `DESIGN.md` et `packages/ui/AGENTS.md`. Pas de `git add -A` ni de `commit -a`. Pour un fichier partagé, ne commiter que ses propres hunks : index séparé (`GIT_INDEX_FILE` partant de `HEAD`, version `HEAD` du fichier plus ses seules modifications, `git commit-tree` puis `git update-ref`, puis `git reset -q -- <fichiers>` dans l'index réel), comme pour `f61e5a4`. Messages en conventional commits, sujet en minuscule.

## Review Focus

- **Titre déjà à l'écran au chargement** (section ou appel final) : il reste peint, jamais découpé ni caché. Testé en Task 1 et Task 3.
- **Lancer posé sur un titre qui casse sur deux lignes** (petit écran) : il retombe sur l'entrée par lignes au lieu d'un trajet faux. Testé en Task 4.
- **Chiffre clé sans chiffre** (unité seule, ou chaîne vide de `EMPTY_FIGURE`) : rien ne casse, rien ne roule. Testé en Task 3.
- **Polices qui chargent après l'idle** : le découpage attend `document.fonts.ready`, les lignes ne sont pas découpées sur la police de secours. Couvert par la structure de `HeadlineMotion` (Task 1, step 3) ; vérifié au design-reviewer (Task 5).
- **Démontage pendant l'animation** (navigation) : la timeline est tuée et le découpage annulé, le titre redevient du texte simple. Testé en Task 1.

---

### Task 1: Les lignes sous le masque, et la prop `entrance` de `Headline`

**Files:**

- Create: `packages/ui/src/motion/custom-eases.ts`
- Modify: `packages/ui/src/motion/tokens.ts` (ajouter `ease.fluid`)
- Create: `packages/ui/src/agents/headline-entrances.ts`
- Create: `packages/ui/src/agents/headline-entrance.tsx`
- Create: `packages/ui/src/agents/headline-motion.tsx`
- Modify: `packages/ui/src/agents/headline.tsx`
- Modify: `apps/web/src/features/agents/{cases-section,composer-section,testimonials-copy,problem-section,references-band,questions-section,tools-copy}.tsx` (ajouter `entrance="lines"` au `Headline` de niveau 2)
- Test: `packages/ui/tests/agents-headline-entrance.test.tsx`
- Modify: `packages/ui/stories/` (story du `Headline` agents, ajouter `Entrance: lines`)
- Modify: `packages/ui/AGENTS.md` (entrée `Headline`), `DESIGN.md` (paragraphe « Titres : une entrée par rôle »)

**Interfaces:**

- Produces:
  - `registerCustomEases(): void` (idempotent ; enregistre `"fluid"` et `"throw"` avec CustomEase) dans `motion/custom-eases.ts` ; `ease.fluid = "fluid"` dans `tokens.ts`.
  - `interface Entrance { build: () => gsap.core.Timeline; revert: () => void }` dans `headline-entrances.ts`.
  - `linesEntrance(headline: HTMLElement): Entrance` — découpe `lines` avec `mask: "lines"`, `reduceWhiteSpace: false`, marque chaque ligne `data-entrance-line`.
  - `type HeadlineEntranceKind = "lines" | "letters" | "throw"`.
  - `Headline` prop `entrance?: HeadlineEntranceKind`. Quand elle est posée, `Headline` rend un fragment : le titre, puis `<HeadlineEntrance kind={entrance} />`.
  - `HeadlineEntrance({ kind })` (`"use client"`) rend `<span hidden data-slot="headline-entrance" ref={…} />` et `<AfterIdle><LazyHeadlineMotion anchor={…} kind={kind} /></AfterIdle>`.
  - `HeadlineMotion({ anchor, kind }): null` : le titre est `anchor.previousElementSibling` ; le choix du constructeur passe par une table `kind → (headline) => Entrance`, que Tasks 3 et 4 complètent.

- [ ] **Step 1: Write the failing test** `packages/ui/tests/agents-headline-entrance.test.tsx`, sur le modèle de `agents-ink-word.test.tsx` (`holdIdleCallbacks`, `allowMotion`/`preferReducedMotion`, `DESKTOP` des viewports, un `Headline level={2} entrance="lines"` sous 160vh d'espace) :
  - `it("leaves the headline as painted until idle")` : avant `releaseIdleCallbacks()`, `[data-entrance-line]` compte 0 et le titre a son nom accessible complet.
  - `it("raises its lines from behind their edge once well inside the window")` : après idle, au pied de la fenêtre, les lignes sont découpées et la première a un `transform` dont `m42 > 0` et un angle non nul ; après `scrollIntoView({ block: "center" })`, `expect.poll` jusqu'à `m42 === 0` et rotation 0 pour toutes les lignes, et le masque (`parentElement`) a `overflow: visible`.
  - `it("leaves a headline already in view as painted")` : rendu sans espace au-dessus, après idle et `pause(SETTLE_MS * 2)`, `[data-entrance-line]` compte 0.
  - `it("animates nothing under reduced motion")` : `[data-entrance-line]` compte 0.
  - `it("gives the headline back as plain text when unmounted mid-entrance")` : démontage pendant l'entrée, aucune exception, plus aucun `[data-entrance-line]` dans le document.
  - `it("keeps the hidden anchor out of the layout")` : `[data-slot=headline-entrance]` a `display: none`.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-headline-entrance.test.tsx`
Expected: FAIL (la prop `entrance` n'existe pas).

- [ ] **Step 3: Implement** `custom-eases.ts`, `ease.fluid`, `linesEntrance`, `HeadlineEntrance`, `HeadlineMotion` et la prop de `Headline`. `HeadlineMotion` suit `InkWordMotion` : ne rien faire sous `prefers-reduced-motion` ; `await document.fonts.ready` ; si `inWindow(headline)`, ne pas découper ; sinon construire l'entrée et `enterUnseen(headline, entrance.build, { rootMargin: "0px 0px -33% 0px" })` ; nettoyage = `stop?.()`, `timeline.kill()`, `revert()`. Le `build` de `linesEntrance` est une timeline : `fromTo` des lignes avec les valeurs de Global Constraints, puis `.set(masks, { overflow: "visible" }, 0.95)`. `headline.tsx` reste sans hooks : seul `headline-entrance.tsx` est client.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-headline-entrance.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Story, inventory, pages, docs.** Ajouter la story `Entrance` (play : nom accessible complet, ancre cachée présente). Dans `packages/ui/AGENTS.md`, à `Headline`, ajouter `entrance` (**none**, lines, letters, throw), avec une phrase par rôle. Poser `entrance="lines"` sur les sept titres de section listés. Dans `DESIGN.md`, ajouter le paragraphe « Titres : une entrée par rôle » : le tableau rôle → animation du spec et les règles communes.

- [ ] **Step 6: Verify**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-headline-entrance.test.tsx` puis `pnpm --filter @repo/ui exec vitest run --project storybook`, puis `pnpm lint` et `pnpm --filter @repo/ui typecheck` et `pnpm --filter @repo/web typecheck`.
Expected: tests et stories verts ; lint et types propres sur les fichiers de la tâche (des erreurs dans des fichiers d'autres sessions sont à signaler, pas à corriger).

- [ ] **Step 7: Commit** les fichiers de la tâche, avec seulement leurs hunks dans `DESIGN.md` et `packages/ui/AGENTS.md`.

```bash
git commit -m "feat(agents): section titles rise line by line from behind their edge"
```

---

### Task 2: La mise au point d'« Immersion »

**Files:**

- Modify: `packages/ui/src/agents/ink-word-motion.tsx`, `packages/ui/src/agents/ink-word.tsx`
- Modify: `packages/ui/src/styles/theme.css` (supprimer `agents-ink-word-text` et ses règles `[data-writing]` ; garder `agents-ink-word` et `agents-ink-bracket`)
- Test: `packages/ui/tests/agents-ink-word.test.tsx`
- Modify: `packages/ui/stories/agents-ink-word.stories.tsx`, `packages/ui/AGENTS.md` (entrée `InkWord`), `DESIGN.md` (phrase de la question dans « Method »)

**Interfaces:**

- Consumes: `linesEntrance(headline)` et `registerCustomEases()`, `ease.fluid` (Task 1).
- Produces: rien de nouveau ; `InkWord` garde ses props (`children`, `className`) et son `data-slot="ink-word"`. Les lettres du mot portent `data-focus-letter`.

- [ ] **Step 1: Rewrite the failing tests** dans `agents-ink-word.test.tsx`. Supprimer `sweepOf` et les assertions sur `--ink-sweep` et `clipPath`, garder `bracketReach` et le premier test (peint, crochets `aria-hidden`).
  - `it("raises its headline's lines, then brings the word into focus letter by letter and closes the brackets on it, once well inside the window")` : avant le centre, lignes découpées et 9 `[data-focus-letter]` à `opacity` 0 ; après `scrollIntoView({ block: "center" })`, `expect.poll` jusqu'à ce que toutes les lettres soient à `opacity` 1 avec `filter` `none`, et que les deux crochets soient à `opacity` 1 avec une translation nulle. Le texte du titre contient toujours `"méthode :"`.
  - `it("replays the whole headline already in view")` : sans espace au-dessus, après idle, `expect.poll` voit des lignes découpées et au moins une lettre à `opacity` < 1, puis tout posé.
  - `it("brings nothing into focus under reduced motion")` : aucune lettre découpée, crochets à `opacity` 1.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-ink-word.test.tsx`
Expected: FAIL sur les nouveaux tests (`[data-focus-letter]` absent).

- [ ] **Step 3: Implement** dans `ink-word-motion.tsx` : `linesEntrance` sur le titre, puis on retrouve le mot (le découpage reconstruit les nœuds) ; ensuite SplitText `chars` sur `.agents-ink-word-text` (garder la classe ou la renommer, sans style), lettres `data-focus-letter`, et ajout à la timeline à 0,75 s et 1,3 s avec les valeurs de Global Constraints. Les lettres et les crochets partent cachés dès la construction, pour que la place soit réservée. Garder l'exception : si le titre est à l'écran, `build().play()` tout de suite au lieu d'`enterUnseen`. Retirer de `ink-word.tsx` tout ce qui touche à l'encre (commentaire compris).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-ink-word.test.tsx`
Expected: PASS.

- [ ] **Step 5: Story and docs.** Mettre à jour la description de la story et l'entrée `InkWord` de `packages/ui/AGENTS.md` (« mise au point » à la place de l'encre). Dans `DESIGN.md`, réécrire la phrase d'`InkWord` de la section Method avec la séquence du spec. Retirer de `DESIGN.md` les mots « ink writes » qui décrivent cette question.

- [ ] **Step 6: Verify**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-ink-word.test.tsx tests/agents-headline-entrance.test.tsx` puis `pnpm --filter @repo/ui exec vitest run --project storybook`, puis lint et types comme en Task 1.
Expected: verts.

- [ ] **Step 7: Commit**, avec seulement ses hunks dans `theme.css`, `DESIGN.md` et `packages/ui/AGENTS.md`. Il inclut aussi la modification non commitée d'hier de `ink-word*` et de son test, désormais remplacée.

```bash
git commit -m "feat(agents): immersion comes into focus letter by letter and its brackets close on it"
```

---

### Task 3: Le rouleau (appel final et chiffres clés)

**Files:**

- Modify: `packages/ui/src/agents/headline-entrances.ts` (ajouter `lettersEntrance`) et la table de `headline-motion.tsx`
- Create: `packages/ui/src/agents/rolling-figure.tsx`, `packages/ui/src/agents/rolling-figure-motion.tsx`, `packages/ui/src/agents/figure-wheels.ts`
- Modify: `packages/ui/src/agents/case-card.tsx` (le chiffre et l'unité passent par `RollingFigure`)
- Modify: `apps/web/src/features/agents/closing-copy.tsx` (`entrance="letters"`)
- Test: `packages/ui/tests/agents-rolling-figure.test.tsx`, plus un cas `letters` dans `agents-headline-entrance.test.tsx`
- Create: `packages/ui/stories/agents-rolling-figure.stories.tsx`
- Modify: `packages/ui/AGENTS.md` (`RollingFigure`, et `CaseCard`), `DESIGN.md` (appel final et chiffres)

**Interfaces:**

- Consumes: `Entrance`, la table de `HeadlineMotion` (Task 1).
- Produces:
  - `lettersEntrance(headline: HTMLElement): Entrance` (découpage `words,chars`, `mask: "chars"`, lettres `data-entrance-letter`).
  - `RollingFigure({ figure, unit }: { figure: string; unit: string })` rend le même rendu qu'aujourd'hui dans `CaseCard` (figure en `text-3xl`, espace fine ` `, unité en `text-xl`) dans `<span data-slot="rolling-figure">`, avec une copie `sr-only` « {figure} {unit} » et la face visible `aria-hidden`.
  - `buildWheels(face: HTMLElement): { timeline: gsap.core.Timeline; revert: () => void }` dans `figure-wheels.ts` : chaque chiffre devient une fenêtre `data-figure-wheel` de 1 em de haut et de la largeur du chiffre final, contenant une colonne de `10 + chiffre + 1` chiffres ; les autres signes deviennent `data-figure-glyph`.

- [ ] **Step 1: Write the failing tests.**
  - Dans `agents-headline-entrance.test.tsx` : `it("raises the call letter by letter from behind each letter's edge")` : `entrance="letters"`, lettres découpées puis toutes à `yPercent` 0 au centre ; un mot n'est jamais coupé, donc le `textContent` de chaque ligne finit par un mot entier.
  - `agents-rolling-figure.test.tsx` :
    - `it("reads its figure out whole")` : nom accessible « +1,4 M », face `aria-hidden`.
    - `it("rolls each digit to its value, left to right, once in view")` : 2 `[data-figure-wheel]` ; après le centre, `expect.poll` jusqu'à ce que la colonne de chaque roue soit au dernier cran ; à mi-parcours, la première roue est plus avancée (en part de son trajet) que la seconde.
    - `it("rolls again each time its card comes to the front of the wall")` : un parent `[data-slot=case-card]` avec `style="--ring-voice: 0"` ; après la première fin, passer `--ring-voice` à `1`, et la colonne repart du cran 0 puis revient au dernier cran.
    - `it("shows a figure with no digit as it is")` : `figure=""` et `unit="M"`, aucune roue et aucune exception.
    - `it("rolls nothing under reduced motion")` : aucune roue.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-rolling-figure.test.tsx tests/agents-headline-entrance.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement** `lettersEntrance` et son entrée dans la table, `buildWheels`, `RollingFigure` et son module différé. Déclenchement dans `rolling-figure-motion.tsx` : `enterUnseen` comme les titres. De plus, un `MutationObserver` sur l'attribut `style` du `[data-slot=case-card]` le plus proche : si `--ring-voice` passe sous 0,5, la timeline repasse à 0 en pause ; s'il atteint 1, elle rejoue depuis 0. Sans `--ring-voice`, seul `enterUnseen` compte. `CaseCard` remplace son bloc chiffre par `<RollingFigure figure={figure} unit={unit} />` dans le même `data-case-voice`. Ne pas toucher `case-ring*`.

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-rolling-figure.test.tsx tests/agents-headline-entrance.test.tsx`
Expected: PASS.

- [ ] **Step 5: Page, stories, docs.** Poser `entrance="letters"` dans `closing-copy.tsx`. Créer la story `RollingFigure` (play : nom accessible). Vérifier que les stories de `CaseCard` et `CaseRing` passent toujours. Mettre à jour `packages/ui/AGENTS.md` et `DESIGN.md`.

- [ ] **Step 6: Verify** comme en Task 2, avec en plus `tests/agents-rolling-figure.test.tsx`.

- [ ] **Step 7: Commit**, avec seulement ses hunks dans les fichiers partagés.

```bash
git commit -m "feat(agents): the closing call rises letter by letter and key figures roll to their value"
```

---

### Task 4: Le lancer

**Files:**

- Create: `packages/ui/src/agents/headline-throw.ts`
- Modify: la table de `headline-motion.tsx`
- Test: cas `throw` dans `packages/ui/tests/agents-headline-entrance.test.tsx` (ou `agents-headline-throw.test.tsx` si le premier dépasse 250 lignes)
- Modify: la story du `Headline` agents (`Entrance: throw`, titre « Agents IA sur mesure »), `packages/ui/AGENTS.md`, `DESIGN.md`

**Interfaces:**

- Consumes: `Entrance`, `linesEntrance`, `registerCustomEases()` (courbe `"throw"`), `STAR` et `SHURIKEN_BOX` de `brand/shuriken-paths.ts`.
- Produces: `throwEntrance(headline: HTMLElement): Entrance` ; l'étoile est un `svg` `data-throw-star` `aria-hidden`, retiré par `revert`.

- [ ] **Step 1: Write the failing tests**
  - `it("throws the star across a one-line title, each word standing as it passes, and the star becomes the full stop")` : titre « Agents IA sur mesure. » ; pendant l'entrée, `[data-throw-star]` existe et sa position x croît ; à la fin, l'étoile est retirée ou à `opacity` 0, tous les mots sont à `opacity` 1 et rotation 0, et le point final est visible.
  - `it("shrinks the star to a dot and lets it go on a title without a full stop")` : sans point, l'étoile finit à `opacity` 0.
  - `it("falls back to the rising lines on a title that breaks over two lines")` : titre long dans un conteneur étroit, aucun `[data-throw-star]`, et `[data-entrance-line]` présents.
  - `it("takes about 1.6 s on « Agents IA sur mesure » at the size of a page title")` : `timeline.duration() / timeline.timeScale()` entre 1,2 et 2,2. Exposer la timeline au test par `data-entrance-duration` sur l'ancre, ou mesurer le temps jusqu'à la fin.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-headline-entrance.test.tsx`
Expected: FAIL sur les cas `throw`.

- [ ] **Step 3: Implement `throwEntrance`** en portant `playThrow` du prototype (`.superpowers/brainstorm/66593-1794315986/content/titres-v4-fluide.html`) réduit au cas d'une seule ligne : trajet droit le long de la ligne, descente sur le point final s'il existe, vitesse de rotation et rétrécissement du spec. Mots découpés en `words`, déclenchés au passage du centre de chaque mot (inverse de la courbe). Si le découpage en `lines` donne plus d'une ligne, annuler et rendre `linesEntrance(headline)`. Timeline à `timeScale(0.4)`.

- [ ] **Step 4: Run them to verify they pass**

Run: `pnpm --filter @repo/ui exec vitest run tests/agents-headline-entrance.test.tsx`
Expected: PASS.

- [ ] **Step 5: Story and docs.** Story `Entrance: throw`. Dans `packages/ui/AGENTS.md`, préciser que le lancer est réservé aux titres d'une ligne et retombe sur les lignes sinon. Dans `DESIGN.md`, indiquer que l'étoile vole ici sans son galet : c'est la seule exception à la règle du symbole.

- [ ] **Step 6: Verify** comme en Task 2.

- [ ] **Step 7: Commit**

```bash
git commit -m "feat(agents): one-line titles open with a thrown shuriken that becomes their full stop"
```

---

### Task 5: Vérification complète

**Files:** aucun nouveau. Corrections éventuelles dans les fichiers des tâches 1 à 4.

- [ ] **Step 1:** `pnpm check`. Expected: vert, sauf les échecs déjà connus hors de ce chantier (ADR 0030 et 0031 en attente, story `WheelStep`, `case-ring-course.ts` d'une autre session). Les lister tels quels.
- [ ] **Step 2:** `pnpm test:e2e` (audit WCAG et design dans le navigateur). Expected: vert sur `/agents`, sinon noter l'échec et sa cause.
- [ ] **Step 3:** `pnpm --filter @repo/web lighthouse`, mobile puis desktop. Expected: performance ≥ 0,95, le reste = 1 sur `/agents`.
- [ ] **Step 4:** skill `motion-review` sur `/agents` : titres de section, « Notre méthode » ouverte depuis le haut et directement sur `#methode`, appel final et mur des cas (chiffres), à 1440 × 900 et 390 × 844, et en mouvement réduit. Expected: chaque critère ≥ 4.
- [ ] **Step 5:** agent `design-reviewer` sur les mêmes états. Corriger ce qu'il remonte, chaque correction avec son test d'abord.
- [ ] **Step 6:** Commit des corrections éventuelles, même méthode.
