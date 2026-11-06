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

Direction « Agents ». A product site for an agency that builds AI agents, at the level of intercom.com. The proof is interfaces at work, laid on photographed surfaces (plaster, linen, travertine, black paper) like objects on a table. The headline speaks low (grey words) and lands on what matters (a black word, a serif word). Warm paper #F6F5F1, ink #0E0E0C, one signal orange #FF4F1A for markers (small text goes through `--accent-ink`), a cobalt for states. Geist light with tight tracking, Instrument Serif italic for one word, Geist Mono for labels behind a colour square. A lower-case « shunpo » wordmark beside a signal square.

### Colour (chosen on 6 November 2026)

The eight colours of the SHUNPO charter, each with one role. Values live in `theme.css` (`--color-agents-*` and the `agents` block).

| Colour        | Hex     | Role                                                                                                  |
| ------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| Kome          | #F3F0E9 | Page ground                                                                                           |
| Shiro         | #E5DFD3 | Muted sections, hairlines, neutral chips                                                              |
| Fuji Night    | #1E2629 | Text, title ink, primary buttons, dark sections; thinned to half on Kome for grey title words         |
| Ink Shadow    | #474747 | Secondary text                                                                                        |
| Hikari Frost  | #BDC8CC | Secondary text and rings on Fuji Night                                                                |
| Fushimi Glow  | #B94532 | The one signal per screen: markers, the wordmark square, tab progress, small red text (4.6:1 on Kome) |
| Blue Tenku    | #2B718C | Information, links, focus, « done » and « in progress » statuses (#1F637D for small text)             |
| Kurenai Blush | #B05F60 | What waits on a person (#8E4547 for small text, a blush tint behind it)                               |

Interfaces stay pure white: they are product material laid on the page, not page colour. Text on Fushimi and Tenku is Kome, never Fuji Night (2.9:1).

### Typography (chosen on 6 November 2026)

Newsreader Medium for every title, Instrument Sans for text and interfaces, Geist Mono for labels and data. Chosen over Instrument Serif + Instrument Sans, Bricolage + Instrument Sans, Geist + Geist Mono and Piazzolla + Geist, after tests on the live page and in large asymmetric compositions (`.context/typo/`): a press serif that reads as a serious partner, set very large with grey and ink words; a neutral sans that keeps the interfaces crisp. No italic in any title: emphasis is ink against grey, never a slanted word.

| Step   | Use                                                              | Size (390 px → 1,600 px) | Line height | Tracking |
| ------ | ---------------------------------------------------------------- | ------------------------ | ----------- | -------- |
| 8xl    | Poster, manifesto line                                           | 68 → 216 px              | 0.90        | −0.040em |
| 7xl    | Hero                                                             | 56 → 176 px              | 0.92        | −0.035em |
| 6xl    | Section opener                                                   | 48 → 136 px              | 0.95        | −0.030em |
| 5xl    | Section title                                                    | 40 → 88 px               | 1.00        | −0.025em |
| 4xl    | Sub-section, card title                                          | 32 → 56 px               | 1.05        | −0.020em |
| 3xl    | Step title, lead heading                                         | 26 → 36 px               | 1.15        | −0.015em |
| Text   | Instrument Sans 400, 16 to 20 px, 1.55                           |                          |             |          |
| Labels | Geist Mono 400, 12 px, capitals, +0.08em, behind a colour square |                          |             |          |

- Do: dense, credible mockups (names, times, statuses, confidence, cited sources); a person at the sensitive moment; one orange per screen.
- Don't: orbs, decorative gradients, generic icon cards, invented result figures (the mockups' amounts are illustrative and fictitious).
- References: intercom.com (interfaces on photographs, tabs with progress, wall of tools), horizonx.so (curved 3D wall, floating pill nav), refero.design (editorial serif).

### Transitions

| Boundary                  | Treatment                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Hero to references        | Clean cut; the band scrolls continuously                                                                |
| References to agents      | Clean cut; the panel changes by a fade of live pieces                                                   |
| Agents to tools           | Muted ground, clean cut                                                                                 |
| Tools to method           | Cut, then a scene held three screens from md: steps light in turn, boards fade and slide (`ease.inOut`) |
| Method to references      | Cut; the curved wall turns with the scroll (direct scrub)                                               |
| Composer, FAQ, final call | Clean cuts; the final call is a dark island                                                             |

### Storyboard

1. **Hero console, « Agent factures »** (live, a ten-second loop held four seconds): invoices arrive, the document is framed while read, fields are extracted with confidence, Odoo is called, a person approves above 2,000 €, a #compta toast confirms.
2. **Three agents in auto-advancing tabs** (nine seconds each): support (Shopify, carrier, Gmail, cited sources), sales (enriched HubSpot record, typed follow-up, Calendly), steering (Sheets, Airtable, QuickBooks, Monday summary).
3. **Method held on scroll.** Everything else lives in micro-motion: marquees, activity feed, curved wall, composer. The pointer pauses live interfaces and tabs.

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
