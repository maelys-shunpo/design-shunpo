# Méthode : le trait continu, plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** remplacer la roue qui tourne de la section Méthode (`/agents`) par un seul trait de pinceau qui descend l'arc jusqu'à Immersion puis continue vers le bas, la page suivant la pointe.

**Architecture :** une fonction pure `wheelTrail` calcule la ligne centrale du trait (l'arc actuel, puis une ligne qui ondule vers le bas), la place de chaque goutte et leur distance le long du trait. Le peintre du cours (`methodWheelCourse`) peint ce trait une fois par taille de scène, le révèle jusqu'à la pointe, et fait monter le calque d'encre, les gouttes et les textes de `travel × pitch`. `wheelCourse` (entrée, `travel`, étape active) et le film ne changent pas.

**Tech Stack :** React 19, TypeScript strict, SVG, GSAP via `ScrollScene`, Tailwind v4 (`theme.css`), Vitest en navigateur (`vitest-browser-react`), Storybook.

**Spec :** `docs/superpowers/specs/2026-11-10-methode-trait-continu-design.md`

## Global Constraints

- L'arbre de travail contient d'autres changements non commités de la branche : ne jamais utiliser `git commit -a` ni `git add .`, ajouter seulement les fichiers de la tâche. Attention, `DESIGN.md`, `packages/ui/AGENTS.md`, `theme.css` et plusieurs fichiers de la roue ont déjà des modifications en cours : les relire avant de les modifier, et les commiter avec les changements déjà présents seulement si Maëlys l'accepte.
- Les apps ne stylent pas. Tout se passe dans `packages/ui`, tokens et utilitaires seulement dans `packages/ui/src/styles/theme.css`.
- Tests d'abord, dans `packages/ui/tests/`, jamais à côté des sources. Les seuils de couverture sont imposés.
- Style imposé par le lint : retours anticipés, pas de ternaires imbriqués, exports nommés, fichiers en kebab-case, noms explicites sans abréviation. `knip` refuse le code mort : supprimer ce qui ne sert plus (`STEP_DEGREES`, le calcul `hidden`, la rotation).
- Le trait est rastérisé une seule fois par taille de scène (`paintBrushStroke` puis `inkImage`). Par image, on ne change que des transformations, des variables CSS et le `stroke-dashoffset`.
- `wheelCourse`, `LANDING`, `INTRO` et le contrat `onCourse({ travel, active })` du film restent identiques.
- Mobile et `prefers-reduced-motion` : rendu inchangé, sans trait.
- Pas d'ADR (choix de design). `DESIGN.md` et `packages/ui/AGENTS.md` sont mis à jour.
- Commandes : `pnpm --filter @repo/ui exec vitest run <chemin>` pour un fichier de test, `pnpm check`, `pnpm test:e2e`, `pnpm --filter @repo/web lighthouse`.

## Review Focus

- **Redimensionnement de la fenêtre en pleine section.** Le trait est repeint, le pas recalculé, et la pointe reste au point de repos sans saut. Test ajouté à la tâche 2.
- **Retour en arrière (scroll vers le haut).** Une goutte que la pointe n'atteint plus disparaît, et le texte redescend par le même chemin. Test ajouté à la tâche 2.
- **Polices chargées en retard.** `--wheel-copy-block` grandit, donc le pas aussi. Le pas suit `evenCopies`, jamais une mesure figée au premier rendu. Test ajouté à la tâche 3.
- **Écran court (hauteur 700 px ou moins).** Le pas reste supérieur à la hauteur du plus grand texte, si bien que deux textes ne se chevauchent jamais, même si l'étape suivante démarre hors écran. Test ajouté à la tâche 1.
- **Saut direct par ancre (`#methode`) ou par la barre de navigation au milieu de la section.** L'état peint correspond à la position, sans goutte manquante ni trait non révélé. Couvert par le test de position arbitraire de la tâche 2.

---

## Fichiers

| Fichier                                                                                                                                         | Rôle                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Créer `packages/ui/src/lib/wheel-trail.ts`                                                                                                      | Ligne centrale du trait, gouttes, distances. Pur, sans DOM                                    |
| Créer `packages/ui/tests/wheel-trail.test.ts`                                                                                                   | Tests de `wheelTrail` et `tipDistance`                                                        |
| Modifier `packages/ui/src/agents/method-wheel-course.ts`                                                                                        | Peindre le trait, le révéler, translater l'encre, poser les gouttes, faire glisser les textes |
| Modifier `packages/ui/src/agents/wheel-marker.tsx`                                                                                              | Goutte invisible tant que non posée (`data-landed`), passées visibles                         |
| Modifier `packages/ui/src/styles/theme.css` (`agents-wheel-slide`, `agents-wheel-kanji`)                                                        | Parallaxe du kanji                                                                            |
| Modifier `packages/ui/tests/agents-method-wheel.test.tsx`                                                                                       | Sens du glissement, gouttes, encre                                                            |
| Modifier `packages/ui/stories/agents-wheel-marker.stories.tsx`, `agents-method-wheel.stories.tsx`                                               | États `data-landed`, descriptions                                                             |
| Modifier `DESIGN.md` (section 3 « Method, the home page's wheel », ligne « Inside the method »), `packages/ui/AGENTS.md` (entrée `MethodWheel`) | Décrire le trait continu                                                                      |

---

### Tâche 1 : la ligne du trait (`wheelTrail`)

**Fichiers :**

- Créer : `packages/ui/src/lib/wheel-trail.ts`
- Test : `packages/ui/tests/wheel-trail.test.ts`

**Interfaces :**

- Consomme : `WheelGeometry`, `wheelPoint`, `entryAngle`, `arcPoints` de `packages/ui/src/lib/wheel-geometry.ts`, et `Point` de `brush-path.ts`.
- Produit :

```ts
export interface WheelTrail {
  /* La ligne centrale du pinceau : l'arc depuis l'entrée jusqu'au point de repos, puis la ligne qui descend
     au-delà de la dernière goutte. */
  points: Point[];
  /* Une goutte par étape : la première au point de repos, les suivantes un pas plus bas chacune. */
  drops: { x: number; y: number }[];
  /* Distance le long de `points`, en px, jusqu'à chaque goutte. */
  marks: number[];
  /* Longueur totale de `points`, en px. */
  length: number;
}
export function stepPitch(copyBlock: number, stageHeight: number): number;
export function wheelTrail(
  geometry: WheelGeometry,
  frame: { phases: number; pitch: number },
): WheelTrail;
export function tipDistance(trail: WheelTrail, entry: number, travel: number): number;
```

Valeurs fixées :

- `SWAY_PX = 22`. Entre deux gouttes, la ligne s'écarte vers la gauche, du côté opposé au texte : `x = repos.x − SWAY_PX · sin²(π · d / pitch)`, où `d` est la distance verticale sous le point de repos. Les gouttes tombent donc exactement à `repos.x`, et la pente est nulle au raccord avec l'arc, dont la tangente est verticale au point de repos.
- `TAIL_SHARE = 0.35`. La ligne continue `0.35 × pitch` sous la dernière goutte : c'est là que le pinceau s'assèche.
- `PITCH_GAP_PX = 96`. `stepPitch = max(copyBlock + PITCH_GAP_PX, stageHeight × 0.5)`.
- Échantillonnage de la ligne : tous les 8 px.
- `tipDistance` : pendant l'entrée (`entry < 1`), la distance vaut `marks[0] × entry`. Ensuite, elle interpole entre `marks[floor(travel)]` et `marks[floor(travel) + 1]` selon la partie fractionnaire de `travel`. Elle est bornée à `marks.at(-1)`.

- [ ] **Étape 1 : écrire les tests qui échouent** dans `packages/ui/tests/wheel-trail.test.ts`, avec `FRAME = wheelGeometry({ height: 900, dotX: 420 })` et `PITCH = 456` :
  - `"starts where the arc enters the screen and reaches the rest point along the wheel"` : `points[0]` est proche de `wheelPoint(FRAME, entryAngle(FRAME))`, `drops[0]` est proche de `wheelPoint(FRAME, 0)`, et `points` contient le point de repos.
  - `"sets each next drop one pitch below the last, on the rest point's vertical"` : pour 3 étapes, `drops[i].x` est proche de `420` et `drops[i].y` de `454.5 + i × 456`.
  - `"goes on past the last drop by a third of a pitch"` : `points.at(-1)[1]` est proche de `454.5 + 2 × 456 + 0.35 × 456`.
  - `"joins the arc without a kink"` : les directions des segments juste avant et juste après le point de repos diffèrent de moins de 2°.
  - `"sways away from the copy between two drops, by 22 px at most"` : tout point sous le repos a `x ≤ 420 + 0.01`, et le minimum de `x` entre deux gouttes est proche de `420 − 22` (à 1 px près).
  - `"measures each drop along the stroke, in order"` : `marks` est strictement croissant, `marks[0]` est proche de la longueur de l'arc (`radius × |entryAngle| × π / 180`, à 2 % près), et `length > marks.at(-1)`.
  - `"brings the tip down the arc, then one drop per step"` : `tipDistance(trail, 0, 0) = 0`, `tipDistance(trail, 0.5, 0)` est proche de `marks[0] / 2`, `tipDistance(trail, 1, 1)` est proche de `marks[1]`, `tipDistance(trail, 1, 1.5)` est strictement entre `marks[1]` et `marks[2]`, et `tipDistance(trail, 1, 2) = marks[2]`.
  - `"keeps two copies apart on a short screen"` : `stepPitch(380, 600)` vaut `476`, `stepPitch(200, 1000)` vaut `500`.

- [ ] **Étape 2 : lancer les tests et vérifier qu'ils échouent**
      Run : `pnpm --filter @repo/ui exec vitest run tests/wheel-trail.test.ts`
      Attendu : échec, module `wheel-trail.ts` introuvable.

- [ ] **Étape 3 : implémenter `wheel-trail.ts`** avec les signatures et valeurs ci-dessus. L'arc vient de `arcPoints(geometry, entryAngle(geometry), 0)`. Les distances sont cumulées segment par segment sur `points`.

- [ ] **Étape 4 : lancer les tests et vérifier qu'ils passent**
      Run : `pnpm --filter @repo/ui exec vitest run tests/wheel-trail.test.ts`
      Attendu : PASS.

- [ ] **Étape 5 : commit**
      `git add packages/ui/src/lib/wheel-trail.ts packages/ui/tests/wheel-trail.test.ts && git commit -m "feat(agents): the method's stroke runs on down past the wheel's arc"`
      `knip` peut signaler l'export inutilisé jusqu'à la tâche 2 : lancer `pnpm check` seulement après la tâche 2.

---

### Tâche 2 : l'encre suit la pointe, les gouttes se posent

**Fichiers :**

- Modifier : `packages/ui/src/agents/method-wheel-course.ts` (`paintInk`, `measure`, `Measures`, le peintre retourné par `methodWheelCourse`, `settleWheel`)
- Modifier : `packages/ui/src/agents/wheel-marker.tsx`
- Modifier : `packages/ui/stories/agents-wheel-marker.stories.tsx`
- Test : `packages/ui/tests/agents-method-wheel.test.tsx`

**Interfaces :**

- Consomme : `wheelTrail`, `tipDistance`, `stepPitch` (tâche 1). `wheelCourse` est inchangé.
- Produit :
  - `Measures` gagne `trail: WheelTrail`, `pitch: number` et `reveal: { before: number; total: number }`, la longueur ajoutée par `stroke.centre` avant la ligne et la longueur totale de `stroke.centre`. Mesurer sur le `<path data-wheel-brush>` avec `getTotalLength()`, après y avoir mis `stroke.centre`. `hidden` disparaît.
  - Sur `[data-slot=wheel-ink]` : `translate: 0 <−travel × pitch>px`. La propriété `rotate` et le `transform-origin` disparaissent.
  - Sur chaque `[data-wheel-dot]` : `translate` à `drop.x`, `drop.y − travel × pitch`, plus l'attribut `data-landed` quand `tipDistance ≥ marks[i] − DROP_REACH_PX` (`DROP_REACH_PX = 8`). `data-active` et `data-passed` restent.
  - Le pas vaut `stepPitch(tallestCopy, stageHeight)`, où `tallestCopy` est la valeur que pose `evenCopies`. `evenCopies` renvoie maintenant ce nombre.

Comportement :

- `paintInk` peint un seul `paintBrushStroke({ points: trail.points, width: BRUSH_WIDTH, seed: BRUSH_SEED })`. L'image couvre la boîte de `trail.points` plus `BRUSH_WIDTH × 2` de marge, au lieu de la taille de la scène. Elle est décalée comme aujourd'hui (`x`, `y` négatifs si besoin).
- Révélation : `stroke-dashoffset = 1 − (reveal.before + tipDistance(trail, entry, travel)) / reveal.total`, chemin à `pathLength = 1`. Rien n'est visible tant que `entry = 0`.
- `WheelMarkerDot` : la goutte est à `scale-0` par défaut, `group-data-landed:scale-100`, et `group-data-active:scale-200`, qui l'emporte. `group-data-passed:opacity-0` est supprimé, la transition de 200 ms est gardée. Mettre à jour le commentaire du composant et la description de la story. Dans la story, les deux gouttes portent `data-landed`, et le `play` vérifie `data-landed` sur les deux.
- `settleWheel` retire aussi `translate` de `[data-slot=wheel-ink]`.

- [ ] **Étape 1 : écrire les tests qui échouent** dans `agents-method-wheel.test.tsx`. Ils réutilisent `holdAt`. Ajouter l'utilitaire `inkShift(container)`, qui lit le nombre de `style.translate` sur `[data-slot=wheel-ink]` (0 si vide), et `dotsOf(container)`, qui liste les `[data-wheel-dot]`.
  - `"lands no drop before the stroke reaches it"` : à `holdAt(0)`, aucun point n'a `data-landed`. À `holdAt(0.6)`, les points 0 et 1 ont `data-landed` et le point 2 non. À `holdAt(1)`, les trois l'ont.
  - `"keeps the passed drops on the ink, moving up with it"` : à `holdAt(1)`, le point 0 a `data-passed`, son `getBoundingClientRect().height > 0`, `getComputedStyle(drop).opacity` vaut `"1"` sur l'enfant goutte, et le `translate` vertical du point 0 est inférieur à celui du point 2.
  - `"lifts the ink by a step's pitch per phase, the tip held at the rest point"` : à `holdAt(0.2)`, `inkShift = 0`. À `holdAt(0.6)`, `inkShift < 0`. À `holdAt(1)`, `inkShift` est proche de `2 × (inkShift à 0.6)` (à 5 % près), et le `translate` vertical du point 2 à `holdAt(1)` est proche de celui du point 0 à `holdAt(0.4)` (à 2 px près).
  - `"paints the state of wherever the scroll lands, forwards or back"` : `holdAt(1)` puis `holdAt(0.4)`, puis `holdAt(0.4)` sur un nouveau rendu. Mêmes `data-landed` sur les trois points, même `inkShift` (à 1 px près) et même `stroke-dashoffset` du `[data-wheel-brush]` (à 0,001 près).
  - `"repaints the stroke for a new stage size and keeps the tip on the rest point"` : à `holdAt(0.6)`, lire le `href` de l'encre et la position du point actif, puis `page.viewport(1280, 800)` et `holdAt(0.6)`. Le `href` a changé, et le centre du point actif reste à moins de 2 px de son repos (`translate` vertical + `inkShift` proche du `y` de repos mesuré).

- [ ] **Étape 2 : lancer les tests et vérifier qu'ils échouent**
      Run : `pnpm --filter @repo/ui exec vitest run tests/agents-method-wheel.test.tsx`
      Attendu : les cinq nouveaux tests échouent (aucun `data-landed`, `translate` vide sur l'encre).

- [ ] **Étape 3 : implémenter** les changements de `method-wheel-course.ts` et `wheel-marker.tsx` décrits ci-dessus. Remplacer la boucle des points sur `wheelPoint(turn − index × STEP_DEGREES)` par les gouttes de `trail`. Garder `STEP_DEGREES` et le calcul de `turn` seulement pour `paintSlides`, que la tâche 3 réécrit et qui les supprime alors.

- [ ] **Étape 4 : lancer les tests de la roue et vérifier qu'ils passent**
      Run : `pnpm --filter @repo/ui exec vitest run tests/agents-method-wheel.test.tsx tests/agents-method-wheel-course.test.ts tests/wheel-geometry.test.ts tests/wheel-trail.test.ts`
      Attendu : PASS, y compris l'ancien test « moves each phase with its dot… », que la tâche 3 réécrit.

- [ ] **Étape 5 : commit**
      `git add packages/ui/src/agents/method-wheel-course.ts packages/ui/src/agents/wheel-marker.tsx packages/ui/stories/agents-wheel-marker.stories.tsx packages/ui/tests/agents-method-wheel.test.tsx && git commit -m "feat(agents): the ink rises with the scroll and each drop lands as the stroke reaches it"`

---

### Tâche 3 : les textes glissent comme une page

**Fichiers :**

- Modifier : `packages/ui/src/agents/method-wheel-course.ts` (`paintSlides`, `Slides`, `PRESENCE_SHARE`)
- Modifier : `packages/ui/src/styles/theme.css` (`agents-wheel-slide`, `agents-wheel-kanji`)
- Modifier : `packages/ui/stories/agents-method-wheel.stories.tsx` (description), `packages/ui/AGENTS.md` (entrée `MethodWheel`), `DESIGN.md` (section 3, ligne « Inside the method »)
- Test : `packages/ui/tests/agents-method-wheel.test.tsx`

**Interfaces :**

- Consomme : `Measures.pitch` (tâche 2), `wheelCourse(...).entry` et `.travel`.
- Produit : `Slides` devient `{ steps; pitch: number; travel: number; entry: number }`, sans `geometry` ni `turn`. Supprimer `STEP_DEGREES` et le calcul de `turn`, gardés jusque-là par la tâche 2.

Valeurs fixées :

- Étape `i` après l'entrée : `d = i − travel`, `--wheel-shift = d × pitch` en px (positif = plus bas, donc le texte monte quand `travel` augmente), et `--wheel-presence = 1 − smoothstep(min(1, |d| / PRESENCE_SHARE))`, avec `PRESENCE_SHARE = 0.85` au lieu de 0.55.
- Pendant l'entrée (`landed = clamp((entry − 0.8) / 0.2)`, comme aujourd'hui) : Immersion a `--wheel-shift = (1 − landed) × ENTRY_RISE_PX` (`ENTRY_RISE_PX = 96`) et `--wheel-presence = landed`. Les autres étapes ont une présence de 0.
- Kanji : `agents-wheel-slide` passe à `translateY(calc(var(--wheel-shift, 0px) * var(--wheel-parallax, 1)))`, et `agents-wheel-kanji` déclare `--wheel-parallax: 0.6`.

- [ ] **Étape 1 : réécrire le test de sens et ajouter les nouveaux** dans `agents-method-wheel.test.tsx` :
  - Remplacer `"moves each phase with its dot: the one before gone down, …"` par `"moves the phases up with the ink: the one before gone up, the current in place, the next below"`. À `holdAt(0.6)` avec Construction courante : `current.shift` est proche de 0 et `current.presence` de 1. `before.shift < 0` et `before.presence` vaut 0. `next.shift > 0` et `next.presence` vaut 0.
  - `"brings Immersion's copy up from below as its drop lands"` : trouver par balayage (`holdAt` de 0,10 à 0,20 par pas de 0,01) le premier point où la présence d'Immersion dépasse 0. Son `--wheel-shift` y est positif et au plus 96. Au premier point où la présence vaut 1, le décalage vaut 0.
  - `"crosses two copies mid-way, so there is always something to read"` : balayer `holdAt` entre 0,4 et 0,6 par pas de 0,02. À chaque position, la somme des présences d'Immersion et de Construction est d'au moins 0,6.
  - `"moves the kanji at six tenths of its copy's pace"` : à `holdAt(0.6)`, pour l'étape d'avant, la composante `f` de `new DOMMatrix(getComputedStyle(kanji).transform)` est proche de `0.6 × before.shift` (à 1 px près). Le décalage statique du kanji passe par la propriété `translate`, pas par `transform`.
  - `"keeps the pitch on the tallest copy once late fonts land"` : rendre, puis à `holdAt(0.6)`, gonfler le texte de la dernière étape (`textContent` répété 6 fois) et déclencher `document.fonts.ready` via le chemin existant (`evenOnceFontsLoad`), ou un redimensionnement de la fenêtre à la même taille. Le `--wheel-shift` de l'étape suivante dépasse alors `--wheel-copy-block + 96`.

- [ ] **Étape 2 : lancer les tests et vérifier qu'ils échouent**
      Run : `pnpm --filter @repo/ui exec vitest run tests/agents-method-wheel.test.tsx`
      Attendu : échec sur le sens (`before.shift` est positif aujourd'hui), l'entrée d'Immersion, le croisement et le kanji.

- [ ] **Étape 3 : implémenter** `paintSlides` et le CSS avec les valeurs ci-dessus.

- [ ] **Étape 4 : lancer les tests et vérifier qu'ils passent**
      Run : `pnpm --filter @repo/ui exec vitest run tests/agents-method-wheel.test.tsx`
      Attendu : PASS, y compris les tests existants de film, d'entrée d'Immersion, de mouvement réduit et de mobile.

- [ ] **Étape 5 : mettre à jour la documentation.**
  - `DESIGN.md` section 3 : remplacer les phrases sur la roue qui tourne (« The scroll then moves the ink dots along the arc… », « The whole wheel turns with the scroll… », « Each phase's copy and kanji ride with their own dot… goes down… comes down from above ») par le trait continu. L'arc mène jusqu'à Immersion, puis la même ligne descend en ondulant. La page monte avec la pointe, les gouttes se posent quand le trait les atteint et restent visibles. Les textes montent et se croisent en fondu, le kanji suit à 0,6, et l'encre unique s'assèche vers Évolution.
  - `DESIGN.md`, ligne « Inside the method » : « the object rests on each drop ».
  - `AGENTS.md`, entrée `MethodWheel` : remplacer « dots walk the `phases` … riding with their dot down the arc » par « one sumi stroke down an arc then on down the page, the ink and the phases rising with the scroll, each drop landing as the stroke reaches it ».
  - Description de la story `agents-method-wheel.stories.tsx` : même formulation.

- [ ] **Étape 6 : `pnpm check`**
      Attendu : vert (format, lint, types, tests et couverture, `knip`, porte des ADR).

- [ ] **Étape 7 : commit**
      `git add packages/ui/src/agents/method-wheel-course.ts packages/ui/src/styles/theme.css packages/ui/stories/agents-method-wheel.stories.tsx packages/ui/AGENTS.md DESIGN.md packages/ui/tests/agents-method-wheel.test.tsx && git commit -m "feat(agents): the method's phases slide up like a page and cross in a fade"`

---

### Tâche 4 : vérification de bout en bout

**Fichiers :** aucun nouveau. Corrections éventuelles dans les fichiers des tâches 2 et 3.

- [ ] **Étape 1 :** `pnpm test:e2e`. Attendu : vert, audit du mouvement compris (pas de canvas vide ou figé, pas d'erreur WebGL, pas de canvas en mouvement réduit).
- [ ] **Étape 2 :** `pnpm --filter @repo/web lighthouse`. Attendu : performance ≥ 0,95 et les autres catégories = 1, sur mobile et desktop, pour `/agents`.
- [ ] **Étape 3 :** skill `motion-review` sur `/agents`, section Méthode, à 1440 × 900 et à 1280 × 800. Chaque critère de la grille doit être à 4 ou plus. Vérifier en particulier les anti-objectifs de la spec : aucun contenu à contre-sens, aucune jointure visible entre l'arc et la ligne, aucune goutte qui glisse, aucun écran vide à mi-transition.
- [ ] **Étape 4 :** agent `design-reviewer` sur `/agents`. Corriger les points prioritaires, relancer l'étape 3 si le mouvement change.
- [ ] **Étape 5 : commit des corrections**
      Pour chaque correction, `git add` des seuls fichiers touchés, puis `git commit -m "fix(agents): …"` avec un message qui la décrit.
