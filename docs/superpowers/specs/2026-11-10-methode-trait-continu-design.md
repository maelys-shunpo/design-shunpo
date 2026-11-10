# Méthode : le trait continu

Date : 10 novembre 2026. Page : `/agents`, section Méthode (`MethodWheel` dans `packages/ui/src/agents`, composé par `apps/web/src/features/agents/method-section.tsx`).

## Intention

Maëlys veut que la section Méthode défile comme une page : le contenu glisse, avec un léger fondu quand il quitte l'écran ou y arrive. Le coup de pinceau à gauche est une bonne idée et le premier arc, celui qui descend jusqu'à Immersion, fonctionne. Après Immersion, la continuité ne se lit pas : les gouttes glissent le long de l'arc et le contenu descend alors qu'on fait défiler vers le bas. On ne comprend pas ce qui se passe et ce n'est pas fluide.

Quatre pistes ont été prototypées avec le vrai pinceau sumi du site (compagnon de brainstorming, `.context/.superpowers/brainstorm/57001-1794296731/content/methode-quatre-pistes.html`). Maëlys a retenu la piste A, « le trait continu ». Le prototype A sert de référence de mouvement.

## Ce qu'on construit

Un seul trait de pinceau qui ne s'interrompt jamais du début à la fin de la section. La page suit la pointe du pinceau : quand on fait défiler, le trait, ses gouttes et le contenu montent ensemble, et la pointe reste à hauteur de lecture. Chaque étape pose sa goutte quand le trait l'atteint. On lit la méthode comme une seule calligraphie.

Déroulé, de tablette à desktop avec mouvement autorisé :

1. **La question.** « Chaque projet commence par une Immersion » reste seule sur le papier, puis monte et s'efface. Inchangé.
2. **L'entrée par l'arc.** Le trait descend l'arc de la roue depuis le haut de l'écran jusqu'au point de repos de la goutte, à côté du texte. On garde le chemin et le rythme d'aujourd'hui, la partie que Maëlys aime. L'entrée suit en revanche les mêmes règles que la suite. La goutte d'Immersion n'accompagne plus la pointe le long de l'arc : elle se pose sur place quand le trait atteint le point de repos, et c'est là qu'Immersion est nommée. Le texte et le kanji d'Immersion entrent par le bas en fondu, sans descendre depuis le haut comme aujourd'hui (`--wheel-shift` pendant l'entrée).
3. **Le trait continue.** Après la goutte d'Immersion, le même trait prolonge l'arc sans rupture vers le bas, en une ligne souple presque verticale qui ondule légèrement. Les gouttes de Construction et d'Évolution sont posées sur cette ligne, à un pas d'étape l'une de l'autre.
4. **La page suit la pointe.** Le scroll fait avancer la pointe d'un pas par étape, et tout le calque d'encre (trait et gouttes) monte du même pas, si bien que la pointe reste au point de repos. Le trait déjà peint et les gouttes passées montent et sortent par le haut de l'écran.
5. **Le texte glisse comme une page.** Le texte de l'étape courante monte avec l'encre et s'efface en montant. Celui de l'étape suivante arrive par le bas en fondu et se pose à côté de sa goutte quand celle-ci arrive au point de repos. Texte et encre se déplacent dans le même sens et à la même vitesse. Le kanji suit avec une parallaxe plus lente : 0,6 fois le déplacement dans le prototype.
6. **Une pause par étape.** Sur chaque goutte, le mouvement ralentit et s'arrête le temps de lire, puis repart en douceur. On garde la courbe actuelle de `wheelCourse` : tenue à chaque bout et accélération douce.
7. **Une seule charge d'encre.** C'est un seul `paintBrushStroke` de l'entrée jusqu'au-delà d'Évolution : appui à la pose, corps mouillé, puis les poils se séparent et l'encre s'épuise vers Évolution. Pas de recharge aux gouttes.
8. **La goutte se pose.** Chaque goutte apparaît quand la pointe atteint son point, puis reste sur l'encre et monte avec elle jusqu'à sortir par le haut. La goutte courante garde son style actif (deux fois plus grande). Les gouttes passées restent visibles à taille normale, comme dans le prototype A. Aujourd'hui elles disparaissent (`group-data-passed:opacity-0` dans `wheel-marker.tsx`) : ce style change.

## Ce qu'on garde tel quel

- Le film de papier plié (`WheelFilmLayer`) piloté par `travel` et `active` : l'objet se repose sur chaque étape et se replie entre deux.
- Les livrables qui se cochent un par un pendant le premier tiers de l'étape.
- Le cadre à deux coins sur le texte courant (`aria-current`).
- Le kanji pâle derrière l'image.
- La fin : la dernière étape tient un quart d'écran, puis la section défile normalement.
- Mobile et mouvement réduit : la question, puis chaque étape complète avec son image, sans trait.

## Non-objectifs

- Pas de changement de texte, d'images, de film ni de mise en page mobile.
- Pas de nouvelle bibliothèque : GSAP reste le seul moteur, dans le `ScrollScene` existant.
- Pas de nouvelle direction visuelle : même pinceau, même encre, mêmes gouttes.

## Anti-objectifs (raté même si ça marche)

- Du contenu qui bouge à contre-sens du scroll.
- Un trait qui se casse, saute ou recommence. Une jointure visible entre l'arc et la partie verticale (cassure d'angle ou d'épaisseur).
- Des gouttes qui glissent le long du trait : elles sont posées sur l'encre et bougent avec elle.
- Un écran sans rien à lire au milieu d'une transition : quand un texte part, le suivant est déjà en train d'arriver.
- Un trait qui s'arrête de bouger pendant que le texte bouge, ou l'inverse.

## Contraintes

- Règles du dépôt (`AGENTS.md`) : les apps ne stylent pas, les tokens vivent dans `theme.css`, tests d'abord dans `packages/ui/tests`, code GSAP dans les modules paresseux de `packages/ui`.
- Le trait est rastérisé une fois par taille de scène, comme aujourd'hui (`inkImage`). Aucun filtre recalculé pendant le scroll : on révèle et on translate seulement.
- Définition de terminé : `pnpm check`, `pnpm test:e2e` (audit du mouvement compris), Lighthouse mobile et desktop, `motion-review` avec chaque critère à 4 ou plus, revue par l'agent `design-reviewer`, stories à jour.
- `DESIGN.md` (section 3 de la page Agents, « Method, the home page's wheel », et la ligne « Inside the method ») décrit le mouvement actuel de roue qui tourne : à réécrire pour le trait continu. Pas d'ADR, c'est un choix de design.

## Décidé par Maëlys

- La piste A, le trait continu, parmi quatre.
- On garde le chemin et le rythme de l'entrée par l'arc jusqu'à Immersion, mais la goutte s'y pose sur place et le texte entre par le bas, comme pour les étapes suivantes.
- Une seule charge d'encre qui s'assèche vers Évolution.
- On garde le film, les coches, le cadre, le kanji, la pause par étape, la version mobile et la version en mouvement réduit.

## Choix faits pendant la relecture (à vérifier par Maëlys)

- Les gouttes passées restent visibles et montent avec l'encre (point 8). C'est ce que montrait le prototype A choisi.
- La fenêtre de fondu du texte est plus large que dans le prototype (`1 - smooth(|d| / 0.55)` y laisse l'écran presque vide à mi-transition). Le texte qui part et celui qui arrive se croisent, pour respecter l'anti-objectif « jamais d'écran sans rien à lire ».

## Laissé au constructeur

- La courbe exacte du raccord entre l'arc et la ligne verticale. Seule exigence : tangente et épaisseur continues, sans jointure visible.
- L'amplitude et la période de l'ondulation, sobres (26 px sur 120 px dans le prototype).
- Le pas entre deux étapes en pixels. Il doit dépasser la hauteur du plus grand bloc de texte (`--wheel-copy-block`), pour que deux textes ne se chevauchent jamais.
- La mécanique : translater le calque SVG, ou décaler l'image et le chemin de révélation. Tant que rien n'est recalculé par image au-delà de transformations et du `dashoffset`.
- Les noms : garder « wheel » ou renommer les fichiers et attributs.
- Le réglage fin des durées de fondu, d'après le prototype.
