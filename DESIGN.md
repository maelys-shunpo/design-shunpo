# Design direction

> **Second series (November 2026).** Maëlys rejected the first series (Instant, Mécanique, Le fil) and asked for two proposals built from scratch, outside the SHUNPO charter: no brand colour, face, logo or Japanese reference. `/agents` and `/origami` are that series; the first series stays below for comparison.

Values live in `packages/ui/src/styles/theme.css`; this file holds the direction only.

## Point of view

SHUNPO (瞬歩) means a step taken in an instant. The brand promises time given back: scattered tools and repeated tasks become one connected system, and the hours it frees return to the people. Every page tells that one story, complexity, then connection, then time, with the same facts. Three art directions compete for it, one page each, built on one design system and four brand colours (Fuji Night, Shiro, Blue Tenku, Fushimi Glow). Nothing else from earlier brand books is imposed.

| Direction | Route        | World                                                   | Signature                                                       |
| --------- | ------------ | ------------------------------------------------------- | --------------------------------------------------------------- |
| Instant   | `/instant`   | A contemporary Japanese print: paper, ink, one red seal | Ink particles that hold a shape, then jump in an instant        |
| Mécanique | `/mecanique` | Night horology, an engineer’s drawing                   | A watch movement built in 3D: exploded, assembled, then running |
| Le fil    | `/fil`       | Kumihimo braiding, colour fields, a red thread          | Tangled threads combed, then braided into one cord (shader)     |

## Shared rules

- One accent per screen: Fushimi marks the action or the signature, never running text.
- Fushimi never carries small text on Fuji Night (2.9:1); Tenku text on Fuji uses its light shade.
- No invented figure, testimonial or result. References are the five the brief publishes.
- No decorative gradient, glowing orb, generic particle sphere or bento grid.
- Every scene has a complete first frame: the poster, the reduced-motion page and the phone fallback.

## Decisions

- **Route (signature-experience, before step 1).** The starter at `/` is replaced by an index of the three proposals; each direction gets its own route (`/instant`, `/mecanique`, `/fil`). Over three variants of `/` behind a switch: three routes can be shared, audited and measured one by one.
- **Directions as a document-level preset (step 2).** `Direction` sets `data-direction` and `theme.css` scopes colours, faces, corners and heading weight with `:root:has([data-direction])`. Over one theme per build or per-section wrappers: the page background, scrollbar, selection and every scheme island follow without a client script, and the three pages share every component.
- **Faces (step 2).** Instant: Shippori Mincho B1 and Zen Kaku Gothic New, self-hosted in their Latin subset (Google serves a hundred CJK slices; the rare kanji fall back to the system mincho). Mécanique: Archivo (width axis) with Geist and Geist Mono. Le fil: Bricolage Grotesque with Hanken Grotesk. Over a single family for all three: a direction is mostly its type.
- **Brand language over the `shunpo-da` skill.** Maëlys asked for free directions: only the four colours and the meaning of the name are kept.
- **Content (step 1).** One fact file (`apps/web/src/features/shunpo/content.ts`) holds symptoms, expertises, method, references and objections in SHUNPO’s voice; each page writes its own headlines around it. Over three copies: the facts must stay identical across proposals.
- **Primary action (step 1).** « Réserver un diagnostic » to `https://shunpo.fr/contact`, the live contact page. The export is static, so no form.
- **Direction scopes extend ADR-0020.** `data-direction` is one more attribute preset in `theme.css`, set by `Direction` instead of a tray. No new ADR: the pattern, values in the token file and attributes on the document, is the accepted one. `TokenTray`, its presets and `simple-icons` left with the starter.
- **Small red text (integration).** Fushimi reaches 3.99:1 on Shiro, under AA for body text. `Text tone="accent"` now reads `--accent-ink` (#9a3626 by day, 5.4:1); the brand red stays for fills, seals and large type.
- **Field scheme contrast (integration).** Muted text on Blue Tenku was 4.11:1; `--muted-foreground` of `scheme-field` is now #eeeae2.
- **Pause control (integration).** The stage's pause button became a round, opaque control on the page background with a hairline, the same in all three directions, instead of a Tenku square that fought the scenes.
- **The method's paper film (Agents, 9 November 2026).** Maëlys asked for figurative metaphors in the photographed washi origami style, morphing from phase to phase « comme le ferait un motion designer », with no background. Two Kling 2.5 morphs between three aligned keyframes, meeting on the shared middle keyframe (seam SSIM 0.969), cut out of their backdrop with their contact shadow, retimed so each frame changes the picture by as much, and scrubbed by the wheel's own travel on a 2D canvas: a scroll-driven film with alpha and no shader treatment needs no WebGL stage. No pointer response: the wheel is a reading scroll, and the paper answers the scroll only. The stills are the film's own rest frames, so the hand-off never pops.

## References

| Reference                                         | Principle taken                                          | Not taken                      |
| ------------------------------------------------- | -------------------------------------------------------- | ------------------------------ |
| Ukiyo-e and contemporary Japanese print (Instant) | Ma: the empty paper carries the composition              | Torii, sakura, tourist clichés |
| Watchmakers’ exploded views (Mécanique)           | A mechanism understood by its assembly                   | Luxury-watch glamour shots     |
| Kumihimo braiding (Le fil)                        | Many threads, one cord, a pattern born from the crossing | Craft-fair rusticity           |
| Studio sites Lusion, Locomotive, Obys             | One signature moment, calm everywhere else               | Their layouts and effects      |

## Page: instant

Direction « 瞬 Instant ». A contemporary print: Shiro paper, Fuji ink, one Fushimi seal per screen. Emptiness first, then the instant jump, since Shunpo means an instantaneous step. Shippori Mincho B1 for titles (500, 800 for numbers), Zen Kaku Gothic New for text, rare graphic kanji, sharp corners, folios 01 to 06, spreads and hairlines.

- Do: hold, then jump (shift curve, 240 to 300 ms); show time given back rather than technology; let the page breathe.
- Don't: gradients, shadows, pills, neon; red small text; generic fade-ups.
- References: prints and washi (flat ink, a seal that signs), techō diaries (a week read at a glance), hanko (one red accent), art books (margins, folios).

### Transitions

| Boundary                                 | Treatment                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hero, held three screens                 | Three jumps, each over 7 % of the hold; the caption changes at the instant of the jump      |
| Paper to night (« Ce que vous achetez ») | Held two screens from md: the ink stroke strikes the term, it fades, the right answer rises |
| Section entrances                        | Line masks (SplitText) or a sweep from the left, through `enterUnseen`                      |
| Conviction to final call                 | Rest on Kome paper, then a cut to night                                                     |

### Storyboard

1. **Signature, particles.** About 32,000 ink points (14,336 on phones) hold « Votre semaine » (a full diary), jump to « Vos outils » (six islands), to « Un système » (a joined loop), then to « Votre temps » (an almost empty week and a tilted red seal). One to three ghost layers trail each jump. Lead: the ink. Pointer: the ink parts. Ambient: it breathes, with a pause control.
2. **Kinetic corrections.** What clients think they buy is struck in ink, what they really buy rises. No pointer.
3. Everything else is calm: line reveals and a four-corner frame that jumps to the hovered expertise.

### Assets

Procedural shapes; posters captured from the first frame, one per orientation (`<picture>`); four still plates at 0, ⅓, ⅔ and 1 for reduced motion. 0 credits.

## Page: mecanique

Direction « Mécanique ». A watchmaker’s bench at night, an engineer’s drawing. Deep Fuji ground, Frost hairlines, a 12-column watermark grid, Tenku for light and marks, Fushimi kept for the jewel, the seconds hand and the call to action. Archivo widened for titles, Geist for text, Geist Mono capitals for dimensions and references.

- Do: number the sections (Relevé, Planche, Gamme, Archives, Notice); one red action per screen.
- Don't: neon, decorative gradients, invented figures.

### Transitions

| Boundary         | Treatment                                                        |
| ---------------- | ---------------------------------------------------------------- |
| Hero to findings | Clean cut                                                        |
| Surface changes  | Clean cuts between ground and raised surfaces                    |
| Method           | Enters in normal flow, then holds while its dimension lines draw |
| Final call       | The page’s only Blue Tenku field                                 |

### Storyboard

1. **Signature, 3D calibre**, held three screens: the exploded view floats (first frame and poster); parts assemble one by one (« Op. 01 Assembler »); the train turns and the escapement steps (« Op. 02 »); a skeleton dial comes down and the camera faces it (« Op. 03 Rendre l’heure »), the red seconds hand taking over from the jewel. Pointer: slight camera turn. On phones the hero first rises to frame the calibre.
2. **Method**, held two screens from tablets: three operations, dimension lines drawn.
3. Everything else rests, with hover effects only.

### Assets

Procedural calibre and three.js `RoomEnvironment` (MIT); poster captured from the first frame. 0 credits.

## Page: fil

Direction « Le fil ». The kumihimo braiding workshop: scattered threads become one solid braid, like a company’s tools once SHUNPO links them. Large Kome, Shiro and Tenku fields, Fuji for the close; Bricolage Grotesque heavy and condensed for titles, Hanken Grotesk for text, generous corners. A Fushimi red thread runs through the whole page.

- Do: one red accent per screen; the thread stays in the gutters, never over text; motion shows a textile gesture (tangle, comb, braid, pull).
- Don't: a decorative thread with no function, gradients, running text in capitals.
- References: the marudai stand (the fan of threads and the forming cord, not the wooden object), akai ito (the thread that links everything, not its romance), haberdashery tags (hung on one thread, not vintage), condensed Swiss posters (typographic mass, not coldness).

### Motion language

Things untangle, tighten and knot. `ease.emphasized` for entrances, `ease.inOut` for strokes, the `scrub` token for anything that follows the scroll. Tags straighten on hover; nothing bounces.

### Transitions

| Boundary           | Treatment                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| Hero to problem    | The cord becomes the SVG thread at the same x, over the section’s own Kome             |
| Between sections   | The thread crosses the bottom padding from gutter to gutter; colour fields cut cleanly |
| Expertises         | Sticky cards recede to 94 % under the next                                             |
| Method, references | The method rail draws; the references hang from the same thread                        |
| Final call         | The thread ends under « Tirons le premier fil. », underlining « fil »                  |

### Storyboard

1. **Signature, Kumihimo shader**, held three screens: 38 threads (22 thicker on phones) tangled; combed from 0.12 to 0.44 (chapter 02 at 0.30); braided from 0.56 to 0.88 into one cord with the red thread wound in (chapter 03 at 0.72); copy and veils fade from 0.86. Over and under crossings shaded, twisted fibres, grain. Pointer: plucks threads with the mouse’s speed. Ambient: threads breathe.
2. **The red thread**, slow, no pointer.
3. Headline and stroke reveals on entrance, through `enterUnseen`.

### Assets

Poster and two still plates captured from the scene, AVIF (96, 32 and 41 KB). 0 credits.

## Page: agents

Direction « Agents ». A product site for an agency that builds AI agents, at the level of intercom.com. The proof is interfaces at work, laid on photographed surfaces (plaster, linen, travertine, black paper) like objects on a table. The headline speaks low (grey words) and lands on what matters (a black word, a serif word). Warm paper #F6F5F1, ink #0E0E0C, one signal orange #FF4F1A for markers (small text goes through `--accent-ink`), a cobalt for states. Geist light with tight tracking, Instrument Serif italic for one word. The official SHUNPO wordmark (« shunpo » in lower case and its signal square, the first try, gave way to it).

### Components (chosen on 6 November 2026)

Measured on the references: Intercom 40 px buttons with 4 px corners, HorizonX and Linear 36 to 56 px pills, Refero 40 px with 12 px corners. « Agents » had five radii (8, 12, 16, 24 and pills) with no rule; now one per role.

| Role    | Radius | Used by                                                              |
| ------- | ------ | -------------------------------------------------------------------- |
| Control | 8 px   | Buttons, fields                                                      |
| Surface | 16 px  | Cards, interface windows, tool tiles, the floating nav, the composer |
| Stage   | 24 px  | Large photographed panels                                            |
| Pill    | full   | Chips, statuses, avatars                                             |

- **Buttons.** 32 px (inside an interface), 40 px (bar, inline) and 48 px (heroes, calls), Instrument Sans 500. Solid Fuji Night for the one action of a screen (Kome on a dark island), outline beside it, quiet as underlined text. Filled and outlined actions are cut on the bias at the top right, as on the home page (« La coupe »): 8 px, 10 px on the 48 px calls; the cut opens to 14 px (18 px) on hover and closes to 5 px (6 px) on press, 240 ms on the shift ease, still under reduced motion; the outline is a 1 px frame along the cut. A trailing arrow, stepping 2 px on hover, for actions that take the visitor somewhere. Hover: Fuji Night lifts a step (#323E43). Press, after the HorizonX motion library: the button dips to 98 % while a highlight spreads from the point pressed (180 ms in, 120 ms out), from the keyboard too, never under reduced motion. Focus: a soft 3 px Blue Tenku halo, after Attio, following the cut. Busy, then done: a spinner then a check in place of the label, the width unchanged, presses ignored meanwhile (the composer's « Voir le plan »). Disabled: 40 % opacity.
- **Field.** The height of the button beside it, on the page ground, a hairline that darkens on hover and focus.
- **Chips.** 32 px choices (a suggestion to pick, pressed when picked) and 24 px quiet references (a cited source, a tag), both pills.
- **Statuses.** 24 px pills, a 8 px dot and a tinted ground per meaning: done and in progress in Tenku, waiting on a person in Kurenai, new in Fushimi, neutral in Shiro.
- **Labels (9 November 2026).** No eyebrow by default: a title opens its section alone. A label stays only when it says what the title does not (« Agents IA sur mesure » above the hero promise, « Trois agents en service » beside the agents' title), in Instrument Sans 500, sentence case, muted ink, with no symbol, no capitals, no monospace and no number. The shuriken glyph in mono capitals read as the generic ✦ « AI » sparkle and went, with the labels that repeated their title or the bar (Références twice, Connectez vos outils, Avis clients, Essayer, Questions). Monospace stays inside the interfaces, as product material.
- **The shuriken.** Always in its pebble, never under 24 px (`Shuriken` has no bare glyph any more): a sign, never a bullet. One exception: the throw of a one-line page title, where the star flies alone and becomes the full stop. It stands for the agent (the hub of the tools, the agent's avatar and journal in the mockups), cuts the night away in the question scene, and waits in a busy button.
- **The frame (9 November 2026).** Two corners, never four: one at the top start, one at the bottom end, 14 px legs, 1.5 px Fushimi (`agents-frame`). It designates and never decorates: hidden at rest, it jumps into place, 240 ms on the shift ease, at once under reduced motion. On the bar's links (hover and focus, a step outside the word), on the current phase of the method (and the one under the pointer), on a client case (hover and focus, a step inside the poster, in the poster's own ink).
- **Numbers.** Only where order matters: the phases of the method. The four pains have no order and no number.
- **Interfaces keep their own corners**: they are product material, laid on the page.

### Title hierarchy (6 November 2026)

The grey title words were Fuji Night thinned on Kome (#848886): 2.71:1 on Shiro, under AA. They are now Ink Shadow on light grounds and Hikari Frost on dark ones. The large scale belongs to major openings only.

| Step       | Desktop | Used for                                             |
| ---------- | ------- | ---------------------------------------------------- |
| `display`  | ~136 px | The hero promise, the closing manifesto              |
| `title`    | ~81 px  | Chapter openers: agents, tools, method, references   |
| `heading`  | ~54 px  | Functional sections, all in Fuji Night: try-out, FAQ |
| `subtitle` | ~36 px  | Steps, tabs, cards                                   |

### Title entrances, one per role (11 November 2026, Maëlys's picks from the Framer-style prototypes)

Every title plays its entrance once, as it comes a third of the way into the window, after the page has painted; a title already in view when motion loads stays as painted (the one exception is « Notre méthode », which replays whole). Reduced motion keeps every title painted; phones animate like desktop. The fluid curve `cubic-bezier(0.45, 0.05, 0.2, 1)` starts and lands softly with no still moment.

| Role                                                           | Entrance                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section titles (`Headline entrance="lines"`)                   | Each line rises from behind its own mask, leaning 4°, and straightens as it lands: 0.9 s a line, 0.09 s apart, emphasized.                                                                                                                                                                                           |
| « Notre méthode : chaque projet commence par une [Immersion] » | The lines rise as above; at 0.75 s « Immersion » comes into focus letter by letter (blur 14 px, 0.045 s apart), and at 1.3 s its two Fushimi brackets close on it from outside, on the fluid curve. About 1.9 s.                                                                                                     |
| The closing call (`entrance="letters"`)                        | Every letter rises from behind its own mask, 0.018 s apart.                                                                                                                                                                                                                                                          |
| Key figures (`RollingFigure`)                                  | Each digit is a one-digit window whose column rolls a full turn and stops on its value, left to right (1.1 s, then +0.25 s a digit, power3.out); the other signs fade up. Rolls again each time its case card comes to the front of the curved wall.                                                                 |
| One-line page titles (`entrance="throw"`)                      | The shuriken star (no pebble: the throw's one exception to the symbol rule) crosses the line spinning, each word standing as it passes, and becomes the full stop — or shrinks to a dot when there is none. At the chosen ×0.4 pace, about 1.6 s. A title that breaks over two lines falls back to the rising lines. |

### Grid and spacing (chosen on 6 November 2026)

A hybrid of the product sites (Intercom, HorizonX: content around 1,200 px, 12 columns, 16 to 20 px gutters, 80 to 112 px sections) and the studios on Awwwards (Locomotive, Lusion, Basement, Darkroom: full-width fluid grids, fine margins, tight gutters, very large type and space). Measured on each site at 1,440 px; captures and figures in `.context/grid/`.

| Screen | Columns | Margin               | Gutter | Content                          |
| ------ | ------- | -------------------- | ------ | -------------------------------- |
| < 768  | 4       | 20 px                | 12 px  | fluid                            |
| 768+   | 8       | 32 px                | 20 px  | fluid                            |
| 1,024+ | 12      | 3.9 vw (56 at 1,440) | 24 px  | at most 1,600 px, centred beyond |

- **Four compositions, one grid.** Centred (a span centred on 8 or 10 columns), symmetric (6 + 6), asymmetric (label on 1–3, title from 4), full bleed or immersive (edge to edge through the margins). The content and its intent choose; no section template is imposed, and no H1 must fill 12 columns or offset its last line.
- **Vertical rhythm.** Continuous transitions 0–64 px, closely linked content 64–96 px, a regular section 128 px, a great breath 160–192 px. Each section pads half of its rhythm on each side, so two sections meet at the sum of their halves.
- **Inner grids.** Interfaces, product captures and demonstrations keep their own inner layout inside their area.
- **Stable, not rigid.** Titles, photographs and graphic pieces may run past their columns (`overflow="visible"`); running text, controls, CTAs and the main alignments stay on the columns.
- **Type on the grid.** The largest title steps need room: a centred title on 10 columns takes `display`, not `hero`.

Tested before adoption on a centred hero, a symmetric two-column section and an editorial section with a product interface, at 390, 834 and 1,440 px: no horizontal scroll, margins and gutters as specified, 1,600 px cap at 1,920.

### Colour (chosen on 6 November 2026)

The eight colours of the SHUNPO charter, each with one role. Values live in `theme.css` (`--color-agents-*` and the `agents` block).

| Colour        | Hex     | Role                                                                                                                       |
| ------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Kome          | #F3F0E9 | Page ground                                                                                                                |
| Shiro         | #E5DFD3 | Muted sections, hairlines, neutral chips                                                                                   |
| Fuji Night    | #1E2629 | Text, title ink, primary buttons, dark sections; thinned to half on Kome for grey title words                              |
| Ink Shadow    | #474747 | Secondary text                                                                                                             |
| Hikari Frost  | #BDC8CC | Secondary text and rings on Fuji Night                                                                                     |
| Fushimi Glow  | #B94532 | The main call, « Réserver un diagnostic », in the hero and the closing: the one red of the screen. The frame's two corners |
| Blue Tenku    | #2B718C | Information, links, focus, « done » and « in progress » statuses (#1F637D for small text)                                  |
| Kurenai Blush | #B05F60 | What waits on a person (#8E4547 for small text, a blush tint behind it)                                                    |

Interfaces stay pure white: they are product material laid on the page, not page colour. Text on Fushimi and Tenku is Kome, never Fuji Night (2.9:1).

### Typography (chosen on 6 November 2026)

Newsreader Medium for every title, Instrument Sans for text, labels and interfaces, Geist Mono for data inside the interfaces. Chosen over Instrument Serif + Instrument Sans, Bricolage + Instrument Sans, Geist + Geist Mono and Piazzolla + Geist, after tests on the live page and in large asymmetric compositions (`.context/typo/`): a press serif that reads as a serious partner, set very large with grey and ink words; a neutral sans that keeps the interfaces crisp. No italic in any title: emphasis is ink against grey, never a slanted word.

| Step   | Use                                                             | Size (390 px → 1,600 px) | Line height | Tracking |
| ------ | --------------------------------------------------------------- | ------------------------ | ----------- | -------- |
| 8xl    | Poster, manifesto line                                          | 68 → 216 px              | 0.90        | −0.040em |
| 7xl    | Hero                                                            | 56 → 176 px              | 0.92        | −0.035em |
| 6xl    | Section opener                                                  | 48 → 136 px              | 0.95        | −0.030em |
| 5xl    | Section title                                                   | 40 → 88 px               | 1.00        | −0.025em |
| 4xl    | Sub-section, card title                                         | 32 → 56 px               | 1.05        | −0.020em |
| 3xl    | Step title, lead heading                                        | 26 → 36 px               | 1.15        | −0.015em |
| Text   | Instrument Sans 400, 16 to 20 px, 1.55                          |                          |             |          |
| Labels | Instrument Sans 500, 14 px, sentence case, muted ink, no symbol |                          |             |          |

- Do: dense, credible mockups (names, times, statuses, confidence, cited sources); a person at the sensitive moment; one orange per screen.
- Don't: orbs, decorative gradients, generic icon cards, invented result figures (the mockups' amounts are illustrative and fictitious).
- References: intercom.com (interfaces on photographs, tabs with progress, wall of tools), horizonx.so (curved 3D wall, floating pill nav), refero.design (editorial serif).
- The references wall, rebuilt as three tinted cards on an arc (12 November 2026, Maëlys, after a senior critique and a Stripe reference: the Customers mosaic). What went: the curved wall, its drift, its pause control, the voice that let one print speak at a time, the paper sheets with a project line and a film strip. Why: the sheets were an identical template, the proof (the product) was the smallest thing on them, a 120 px void sat in the middle, and the clients' own results (Altaroc's assets, lemlist's revenue, Ops Clean's turnover) read as SHUNPO's. What stays: the cut on the bias (never rounded) and a folded corner (« Le pli »). The section's title is Maëlys's, « Ce qu'ont gagné nos clients »; its risk is noted here: above an amount that is the client's own activity, it reads as a gain SHUNPO brought, which the brand brief forbids (« ne jamais attribuer à SHUNPO les performances commerciales d'un client »), and « Ce qui tourne chez nos clients » or « Nos clients, en chiffres » would keep her intention without it.
  - Three cards, 3:4: TF1 in Kurenai Blush, Altaroc in Blue Tenku, lemlist in Shiro (chosen over Hikari Frost, #E5DFD3 against #BDC8CC: the lighter, warmer ground; the dark Ink Shadow it replaced was too heavy next to the other two). The delivered product is the ground, grey and soft in luminosity under the tint (a 3:4 crop of each master, not the 2:1 bands, which went to 352 px wide when stretched), the logo at the head, the key figure and what it measures at the foot. Vicat and Ops Clean are behind « Voir tous les projets » (`AgentsAction`, outline, towards shunpo.fr/cas-clients).
  - The fold, small at rest on all three (`--spacing-4`) and opening to `--spacing-10` under the pointer and on keyboard focus (700 ms on the emphasized ease): the back of the paper lit in a lighter tone of the tint with its shadow, the arrow stepping into the open corner 150 ms later. Under the pointer and on focus the figure rises out, blurring (280 ms), and the mission, one sentence built only from the project and its stake in `content.ts`, rises word by word out of a blur, 22 ms between two words, 20 px in the serif. On touch screens there is no hover: the figure stays.
  - Motion, once: the cards arrive on a curve (turned 18°, `perspective(62.5rem)`) and settle onto an arc in 1.3 s as the wall comes into view, the middle one a step (`--spacing-6`) higher, the sides 90 ms after it; the figures roll once with it; nothing moves again. Maëlys: no automatic chain (« pas très UX »), the visitor drives or nothing moves; a figure that rolls again each time its card is reached reads as a bug. Phones: a stacked list, the small fold on each card. Reduced motion: the arc painted at once, figures painted, fades only.
  - Known: the two cards at the sides of an arc would be deformed by a curve held at rest (their text in perspective), so the curve is only the entry, and the arc keeps a trace of it flat. The grounds are 480×640 crops of 1,200 px masters and are blurred; real photographs of the products in situation would replace them (Magnific, Maëlys's go for the credits).

### Transitions

| Boundary                   | Treatment                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Hero to problem            | Clean cut; the night arrives as a card around the question                               |
| Problem to references      | Clean cut; the title beside three drifting columns of client logos                       |
| References to agents       | Clean cut; the panel changes by a fade of live pieces                                    |
| Agents to tools            | Muted ground, clean cut; the copy centred over the hub                                   |
| Tools to method            | Cut; the question alone, then an ink stroke walks the three phases                       |
| Method to references       | Cut; three cards that arrive on a curve and settle on an arc as the wall comes into view |
| References to client words | Clean cut; the title beside signed quotes stepping down, no network badge                |
| Composer, FAQ, final call  | Clean cuts; the final call is a dark island                                              |

### Storyboard

1. **The question in the night** (`QuestionScene`, as on the home page), held three screens: Fuji Night arrives as a card around « Votre entreprise grandit et vos outils ne suivent plus ? » and grows to the screen in half a screen; the four pains arrive around it as plates, one every 0.14 screen; the SHUNPO shuriken cuts the night away, turning 135° as it grows until no night is left; the answer's lines rise out of their masks on the paper, « Pas vous en faire perdre. » landing in the same weight as the rest. The question and its plates fit the window clear of the floating nav. Reduced motion: the question and its plates on a night band, then the answer under the shuriken. One two-corner frame travels through the scene (9 November 2026, Shunpo Shift): it takes each plate as it arrives, in Kome on the night, jumping in 240 ms on the shift curve and leaving three ghosts that fade in 200 ms; it lets go while the shuriken cuts; then it lands on « Pas vous en faire perdre. » as large Fushimi brackets (3 px, 24 px arms) whose uprights run the full height of the phrase, 20 px off its words. Reduced motion: no frame.
2. **Three agents in auto-advancing tabs** (nine seconds each): support (Shopify, carrier, Gmail, cited sources), sales (enriched HubSpot record, typed follow-up, Calendly), steering (Sheets, Airtable, QuickBooks, Monday summary).
3. **Tools wired to one agent** (`ConnectionHub`), a beat every 2.7 seconds: the SHUNPO shuriken in a white disc at the centre, six tools of the morning on the near orbit and six more of the stack on the far one (only the near one on phones), dotted orbits and hairline threads. Each beat the disc ripples, a Fushimi pulse runs down one thread, the tool takes a Fushimi edge, and the line under the hub says what the agent did there (the morning's activity, Gmail to Notion). Held off screen and under the pointer or focus; still on its first line under reduced motion.
4. **Method, the home page's wheel** (`MethodWheel`), held three screens from tablets under the floating nav. « Notre méthode : chaque projet commence par une [Immersion] » stands alone on the paper for a quarter screen (`InkWord`: as it comes a third of the way into the window its two lines rise from behind their edge, leaning and straightening, then once « commence par une » has landed « Immersion » comes into focus letter by letter — out of a 14 px blur — and two Fushimi square brackets « [ » « ] », 3 px, close on it from outside on the fluid curve, about 1.9 s; opened on the section or reloaded there, the whole sequence plays at once, an exception to the rule that content in view stays as painted, because Maëlys wants the sentence always seen arriving and the word coming into focus; brackets rather than the two-corner frame because Maëlys asked for « [ ] » around the word itself), then rises 48 px and fades over 0.4 screen; a tenth of a screen into its exit a sumi brush stroke (the home page's brush, painted once per stage size) comes down a wide arc from the top start corner, and when the brush reaches the rest point beside the copy its drop lands there and Immersion is named, its copy coming up 96 px from below as it fades in. From there the same stroke runs on down the page, never lifting: one brush stroke, one load of ink, leaning 22 px away from the copy between two drops and straight down through each, pressed wet at the top and splitting dry toward Évolution. The page follows the brush: the scroll moves its tip a step per phase and the ink rises by as much, so the tip stays on the rest point beside the copy and the stroke lengthens exactly where one reads; each step holds a moment and eases on, without a jolt. Each drop lands as the stroke reaches it (it is not there before) and stays on the ink as it rises and leaves the top: 32 px, twice the width of the stroke so it reads as a mark on it, and the current one half as large again (48 px), always the last drop the brush has reached. The current phase, on the left of the drop: its label, its title, its text and its three deliverables, and the deliverables tick one by one (grey with an empty circle, then ink with a check) through the first third of its time on screen, while its object rests. On the right, folded washi paper stands on the page's own paper, no backdrop, its contact shadow kept: a handshake seen from the side, two paper forearms (the artisan's rolled shirt sleeve, the client's jacket sleeve) tied by a red thread, for Immersion, a low wall of paper bricks with the red brick just laid on top for Construction, a bonsai with one red leaf on a new shoot for Évolution. From tablets with motion one paper film carries them (`film`): the object rests while the dot rests (a fifth of each step at either end), and while the dot travels the paper refolds into the next, the clasped forearms coming down and folding flat into bricks that stack course by course, the red knot becoming the last brick, then the wall gathering into a sheaf whose base folds into the pot while the trunk rises and the crown opens, the red brick becoming the leaf. Each phase's copy slides like a page, in the scroll's own direction: up with the ink, one step's pitch a phase (at least the tallest copy plus 96 px, so two copies never overlap), fading as it leaves its rest while the next comes up from below and fades in; the two cross mid-way, so there is always something to read. Its kanji slides at six tenths of that pace, behind it. The whole section seems to scroll with the brush while the paper folds in place. As Immersion is named after the question, its entrance plays once: a sheet of washi comes down, unfolds and parts into the two forearms, which meet in the handshake while the red thread winds and ties. The paper starts folding once the dot has set off (a tenth of its way) and is done the moment the next phase is named, so the new object and its copy arrive together. While the wheel rests on a phase, its paper keeps a quiet idle loop of its own, in time and never with the scroll, starting 1.2 seconds after it lands so its copy comes in first: the red thread loosens and ties itself again around the handshake, the red brick is tapped flat into its place, a breeze passes through the bonsai's crown, each followed by a few seconds of stillness. A loop caught mid-way fades into the moving paper as the dots set off. A round pause control, opaque on the paper like a stage's, sits at the film's bottom end (WCAG 2.2.2), and the loops hold out of the window. The film is drawn in the wheel's own frame and mixes the two frames around the playhead, so it never steps. The kanji (見, 築, 進, Shippori Mincho falling back to the system mincho) rises pale on the paper behind the still's top start corner, kept off the copy. The last phase holds complete for a quarter screen, then the chapô and « Réserver une Immersion » follow, unheld. Phones and reduced motion scroll freely: the question, then each phase with its still above its copy, no stroke, no film, no kanji on phones.

### Washi paper (10 November 2026)

Maëlys wanted more texture on the grounds, « dans le style papier », a folded paper as found on Magnific. Of three families tried on the live page (an unfolded sheet, handled paper, washi), and a softer handled paper in place of the second, she chose the washi: a fine network of small creases, leaning gently one way, quiet from afar and rich up close, in the family of the method's origami. On this page only for now (« seulement sur ma section agent IA, on verra pour les autres après »), and the same day on the tools section alone (« enlève le fond texturé sur toutes les sections sauf la section des agents connectés »): `Section paper="washi"` on `#outils`. The photographed paper is reduced to the light and shade of its folds, its own colour and lighting removed, made seamless and laid over the ground in hard light, at the intensity of the test she saw, so the colours stay Kome and Shiro: the mean moves less than half a grey level, where the test darkened it by one and a half. One tile of 60rem, the scale of the test. What lies on the paper stays smooth: cards, windows, the bar, fields, pictures, and the dark islands. The client tiles were white at 60 %, which let the grain show through tiles that drift over it: they are now opaque in the same colour (#FAF9F6). Contrast holds on the darkest crease (Ink Shadow 5.6:1 on Shiro washi); small Tenku or Kurenai text never sits on Shiro washi. The WCAG audit checks text against the paper's own colour, since axe cannot read a picture.

### Une texture par rôle (12 November 2026)

Maëlys liked every texture of the lab (grain, crumple, fold, fibres) and asked for them « pour certaines sections, pas toutes » and « d'autres fonds pour aller dans des cartes que font les sites Framer »; she approved the distribution shown in the companion. One texture per role, the rest plain so each keeps its value. The three new reliefs are rendered once from the open paper.design paper shader (Apache-2.0, masters and scripts in `assets/source/agents/paper-shader`), reduced to grey like the washi and laid in hard light, every ground's mean kept within half a grey level; no runtime dependency, no WebGL.

- **The dark islands flicker with a film grain** (`Section paper="grain"`, `QuestionNight`): the night prolongs the hero film, so a film's grain is at home there. A lossless mid-grey noise tile in overlay under the content, one CSS pixel a grain, stepping through eight offsets at 10 fps; still under reduced motion. Decorative, it carries no information; it runs while the island is on screen, an exception to WCAG 2.2.2's five seconds that Maëlys chose to keep without a pause control (12 November 2026): reduced motion stills it. Applied to the problem's night; the cases section takes it through its own chantier.
- **The composer crumples its Shiro** (`paper="froisse"`): the other Shiro band, in echo of the tools' washi.
- **One large sheet unfolds behind the questions** (`paper="plie"`): soft diagonal folds on the page's Kome, the quietest of the four.
- **What clients sign is printed on fibrous washi**: the testimonial cards (`Testimonial`, on a sheet cut on the bias at its top right corner, like the actions) and the client tiles (`ReferenceTile material="paper"`), on their own paper-light. Rich up close, quiet from afar, like the Framer cards Maëlys pointed to.
- **Plain on purpose:** the references band's ground and the avis ground (their cards carry the texture instead), the method (its scene is held while the page scrolls on, and a ground would slide under it), the closing photo, the footer, every interface window.

### Assets

Eight Magnific images (Nano Banana Pro 2K, four prompts × two), five shipped as 1,920 px WebP; 600 credits of a 5,000 cap. Tool logos from simple-icons (CC0).

## Page: origami

Direction « Origami ». A night studio where paper truly folds. Night ground #0D0E12, ivory paper, one citron fold (the crane, the italic words, the action) and a cobalt box, white inside. Bodoni Moda for titles with one citron italic word each, Geist for text, Geist Mono capitals for marks. Sharp corners, much black: the 3D carries the page and the editorial lets it breathe.

- Do: one citron fold per screen; every motion is a paper gesture (fold, take off, land); the camera holds each piece while it folds.
- Don't: glossy or plastic paper, heavy post-processing, decorative gradients, invented figures.
- References: step-by-step folding diagrams (a form understood by its folds), studio photography of paper objects (raking light, back light), Didone editorial posters.

### Transitions

| Boundary                   | Treatment                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Chapters of the scene      | Copy scrolls in normal flow over the fixed scene; the camera moves from shot to shot between holds |
| End of the scene to method | Clean cut on the same night ground                                                                 |
| References                 | Muted surface, clean cut                                                                           |
| Questions to final call    | Back to night, large italic title                                                                  |

### Storyboard

1. **Signature, the studio** (seven windows of scroll): the sheet from above, a corner barely lifted (poster); folding into a plane (0.05 to 0.28); take-off (0.29 to 0.47); the crane (fold 0.42 to 0.54, camera hold 0.48 to 0.57); the masu box (0.58 to 0.70); the boat (0.73 to 0.85); a flock in a wide shot (0.84 to 1). Pointer: camera parallax. At rest: floating, slow turn, beating folds, a turning key light. Still plates under reduced motion.
2. Everything else is calm: hover only (a button corner that folds, a reference name that slides, a turning `+`).

### Assets

Procedural geometry (folding patterns in code), three.js `RoomEnvironment` (MIT), a poster captured from the first frame and six still plates. 0 credits.
