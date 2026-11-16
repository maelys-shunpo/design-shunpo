# La coupe se joue sur la section FAQ

Date : 2026-11-15 · Statut : validé (Maëlys, 2026-11-16)

## Intention et pourquoi

Maëlys aime le geste validé (`cta-coupe-traverse-v4`, 12 nov. 2026) : le shuriken SHUNPO
traverse la page à vitesse constante et fend la section pour découvrir le closing sur Fuji
Night. Elle veut **exactement la même animation**, mais ce qui se fait fendre et tomber n'est
plus un papier vierge, c'est **la section FAQ elle-même**. Le shuriken traverse la FAQ, la
fend le long de la coupe, les deux moitiés (portant les vraies questions) basculent et tombent,
le closing monte dessous. Pile le même geste, joué sur la FAQ.

Aujourd'hui la coupe se joue sur un papier Kome **généré** (`coupe-sheet.ts`), dans la scène
épinglée du closing, **après** que la FAQ a défilé hors champ. L'animation ne touche jamais les
vraies questions.

Décision prise avec Maëlys : **Option 2**, on fend la **vraie FAQ** en DOM/CSS, sans capture
d'image. L'Option 1 (rasteriser la FAQ en texture pour les plans WebGL) est écartée : elle
imposait un outil de capture (ADR), un rendu figé et fragile (polices, relief `plie`).

## Objectifs

- Le geste validé est **reproduit à l'identique** sur la FAQ : course du shuriken à vitesse
  constante, Shunpo Shift (3 ghosts), hairline qui tient un battement, glissement puis chute
  des deux moitiés qui basculent, tremblement à l'impact, closing qui monte, titre puis bouton
  (le seul rouge) en dernier.
- Ce sont les **vraies cartes de questions** qui se fendent et tombent (pas un papier vierge).
- Piloté au scroll, comme la coupe actuelle.

## Levier qui rend ça propre

Toute la cadence du geste vit déjà dans des **fonctions pures** (`coupe-geometry.ts` :
`throwPosition`, `ghostRaw`, `slitOpacity`, `slideAt`, `partAt`, `shake`, `coupeHold`, les
`*_REVEAL`). On **garde ces fonctions telles quelles** et on **re-cible la pose** : au lieu de
poser des objets three.js (`coupe-pose.ts`), on pose des éléments DOM (transforms CSS). Même
timing, même courbes, même geste ; seul le support du rendu change (DOM au lieu de WebGL).

## Non-objectifs / anti-objectifs (ce qui en ferait un échec)

- Pas de rendu différent du geste validé : mêmes courbes, mêmes beats (réutilisés depuis
  `coupe-geometry.ts`). Toute dérive de timing est un échec.
- Pas de capture DOM → image, pas de nouvelle dépendance pour rasteriser (c'était l'Option 1,
  écartée).
- La FAQ reste **lisible et navigable** (clavier, liens, lecteur d'écran) tant que le geste
  n'a pas commencé ; la copie servant au découpage est `aria-hidden` (pas de double lecture).
- Rien de nouveau sur le first load : GSAP/Lenis restent lazy sous `AfterIdle`.

## Contraintes

- Tokens seulement dans `theme.css` / `motion/tokens.ts` ; lint (pas d'arbitraire, pas de
  marges, tout sur l'échelle). Les valeurs de transform/clip variables sont posées **en inline
  par GSAP/JS** (hors portée du lint sur les classes), depuis `coupe-geometry.ts` et un nouveau
  module de géométrie DOM ; les classes statiques restent sur l'échelle.
- `minWidth: "md"` comme la coupe actuelle : sous `md` et en reduced-motion, la FAQ puis le
  closing se lisent directement, en plate statique, sans geste.
- Perf : plus de contexte WebGL pour cette scène (on passe en DOM/CSS). Lighthouse
  mobile/desktop, motion-review (95e ≤ 20 ms, LoAF, pas de scène gelée).
- DoD `AGENTS.md` : tests + stories (play + a11y), `pnpm check`, `pnpm test:e2e`, Lighthouse,
  `motion-review` (chaque critère ≥ 4) et l'agent `design-reviewer`. Choix de direction dans
  `DESIGN.md`, pas d'ADR (aucune techno nouvelle, on retire plutôt WebGL de cette scène).
- Routes inchangées : pas de nouvelle entrée dans `e2e/support/routes.ts`.

## Approches considérées

- **Option 2 (choisie) — fendre la vraie FAQ en DOM/CSS**, geste re-ciblé depuis
  `coupe-geometry.ts`. Robuste, accessible, sans capture.
- **Option 1 (écartée) — rasteriser la FAQ en texture pour les plans WebGL existants** : rendu
  WebGL identique au pixel, mais capture figée et fragile + dépendance/ADR.
- **Deux temps raccordés (écartée plus tôt)** : séquence le geste, raccord visible.

## Le comment décidé

La coupe et la FAQ deviennent **une seule scène épinglée**. La `QuestionsSection` quitte le
flux de `ConversionSections` et passe **dans la scène de la coupe**, au-dessus du closing, de
sorte que la coupe se joue sur elle.

Structure de la scène épinglée (du fond vers le dessus) :

1. Le **closing** (titre + bouton), caché derrière, découvert quand les moitiés tombent (comme
   aujourd'hui, mais derrière la FAQ au lieu du papier).
2. La **FAQ** en deux moitiés, fendues le long de la coupe, qui glissent puis basculent et
   tombent. Avant le geste, la FAQ est une seule couche lisible et interactive.
3. Le **shuriken, ses 3 ghosts et la hairline**, par-dessus.

Séquence, un seul `progress` piloté au scroll : la FAQ s'épingle et **tient immobile, lisible
et interactive, un vrai temps de pause** (temps mort de lecture en tête de timeline) → puis le
geste exact de la coupe se joue : le shuriken entre par un bord et traverse la FAQ à vitesse
constante (ghosts derrière) → la hairline tient un battement → la page donne : la FAQ se fend,
la moitié haute glisse puis les deux basculent et tombent (`slideAt`/`partAt`), tremblement à
l'impact (`shake`) → le closing monte, titre (`TITLE_REVEAL`) puis bouton (`BUTTON_REVEAL`).

Réutilisé tel quel : `coupe-geometry.ts` (toutes les courbes et beats), `ScrollScene` (pin +
hold + scrub), la longueur `coupeHold()`, le shuriken `STAR` de `brand/shuriken-paths.ts`.

## Décisions prises après la relecture builder

- **Temps de lecture, puis sticky-scroll (choisi par Maëlys).** La FAQ s'épingle et **tient
  immobile, lisible et interactive, un vrai temps de pause** (on lit, on peut ouvrir les
  questions). **Ensuite seulement** le sticky-scroll fait jouer le shuriken, avec le timing
  **exact** de la coupe actuelle. On ajoute donc un **temps mort de lecture en tête de la
  timeline épinglée** (nouveau token de longueur dans `motion/tokens.ts`), avant le jet ; les
  courbes du geste ne bougent pas (`coupeHold()` total = temps de lecture + hold du geste, le
  geste simplement décalé après la pause). Le geste reste « exactement la même animation ».
  Conséquence : la FAQ étant épinglée pendant la pause, sur md+ elle doit **tenir dans un
  écran** pour être lue d'un coup ; le builder cale ça et le valide en motion-review.
- **Interactivité et découpe = instantané pris au départ du geste.** Avant le geste, une seule
  FAQ vivante et interactive (`<details>`/`<summary>`). Au départ du jet, on fige l'état et les
  deux moitiés clippées sont construites depuis la mise en page à cet instant (ce qui est
  ouvert reste ouvert sur les moitiés qui tombent). Pas de re-mesure à chaque toggle pendant la
  chute. Le focus repasse proprement de la couche vivante aux copies `aria-hidden`.
- **Accessibilité des couches superposées.** Le closing (dont le bouton, le seul rouge) est
  `inert` tant qu'il est couvert, révélé à l'ordre de lecture quand les moitiés tombent. La
  FAQ sort de l'arbre d'accessibilité (`inert`) une fois coupée. En reduced-motion / < md, pas
  de geste : la FAQ puis le closing se lisent tous deux en entier.
- **Ancre de nav `#questions`.** L'`id="questions"` suit la FAQ et se pose au début du track de
  la scène (FAQ lisible, `progress` 0), pour que le lien « FAQ » du `PageNav` y atterrisse ;
  vérifier que le scrollspy détecte encore la section épinglée.
- **Place de la FAQ hors de `ConversionSections`.** `QuestionsSection` quitte
  `ConversionSections` (la `CiiSection` devient la dernière avant la couture) et entre dans la
  scène de la coupe ; on y reporte son `paper="plie"` et son rythme.

## Laissé au builder

- **Technique de découpe des moitiés** : deux copies de la FAQ avec `clip-path` (haut / bas le
  long de la coupe), l'une `aria-hidden` ; ou une technique équivalente. Avant le geste, ne
  montrer qu'une seule FAQ vivante.
- **Shuriken en SVG/DOM** (reco, tout en une couche, pas de WebGL) posé depuis `throwPosition`
  / `ghostRaw` ; ou réutiliser le canvas WebGL du star seul. Choix par la plus légère au budget
  perf.
- **Dos washi** des moitiés qui tombent (face arrière quand elles basculent) : la rendre en CSS
  (backface) ou l'accepter unie ; régler en motion-review pour coller au rendu actuel.
- La **boucle de pose** : un rAF lisant `progress.value` et appliquant les transforms (comme la
  scène WebGL le fait via `useFrame`), ou des quickSetters GSAP.
- `coupe-pose.ts` / `coupe-world.ts` / `coupe-scene.tsx` / `coupe-sheet.ts` / `coupe-stage.tsx`
  WebGL : retirés ou remplacés par l'équivalent DOM une fois la scène DOM en place.
- Timings fins, longueur du hold, reduced-motion / plate statique (déjà md-gated).
- Tests : géométrie pure déjà couverte (inchangée) ; story par état (play + a11y) ; motion-
  review sur la scène ; `DESIGN.md` + inventaire `packages/ui/AGENTS.md` à jour.
