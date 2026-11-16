# Animations de titres : une entrée par rôle

Date : 11 novembre 2026. Direction « Agents » (`packages/ui/src/agents`), page `/agents` d'abord.

## Intention

Maëlys veut une animation d'entrée commune aux titres du site, qui rappelle l'univers SHUNPO et reste fluide et naturelle. Après plusieurs essais maison (coupe en biais, lame, fil rouge) jugés « pas fous », la direction s'est fixée sur les effets que propose Framer, adaptés à la typo et aux couleurs du site. Chaque rôle de titre reçoit une seule animation, pour qu'aucune ne se dilue :

| Rôle                                                           | Animation                                            | Où, aujourd'hui                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Titre de section                                               | **Les lignes sous le masque**                        | Tous les `Headline` de niveau 2 des sections de `/agents`                                                                  |
| « Notre méthode : chaque projet commence par une [Immersion] » | **Les lignes sous le masque, puis la mise au point** | `method-question.tsx` (remplace l'encre actuelle d'`InkWord`)                                                              |
| Appel final et chiffres clés                                   | **Le rouleau**                                       | `closing-copy.tsx` (appel final) et le chiffre de chaque `CaseCard`                                                        |
| Titre d'une seule ligne qui ouvre une page                     | **Le lancer**                                        | Aucun titre de `/agents` pour l'instant : le composant est livré et documenté, il sera posé sur les titres de page à venir |

Les prototypes validés servent de référence de mouvement (compagnon de brainstorming, non versionné) :

- lignes sous le masque : `.superpowers/brainstorm/8189-1794388446/content/titres-v14-framer.html`, piste 2 ;
- mise au point : `.superpowers/brainstorm/8189-1794388446/content/titres-v15-immersion.html`, piste 1 ;
- rouleau : `.superpowers/brainstorm/8189-1794388446/content/titres-v17-moments-forts.html`, piste 2 ;
- lancer : `.superpowers/brainstorm/66593-1794315986/content/titres-v4-fluide.html`, trajet sur une ligne (`playThrow`).

Les valeurs ci-dessous reprennent ces prototypes. Elles font foi si les fichiers disparaissent.

## Les quatre animations

Toutes utilisent la typo des titres (Newsreader 500) et les courbes du projet. La courbe « emphasized » est `cubic-bezier(0.16, 1, 0.3, 1)` (`ease.emphasized` = `expo.out`, déjà dans `motion/tokens.ts`). La courbe « fluide » est `cubic-bezier(0.45, 0.05, 0.2, 1)` : elle démarre et se pose en douceur, sans temps mort. Elle devient un token de mouvement (`theme.css` et `motion/tokens.ts`).

### 1. Les lignes sous le masque (titres de section)

Le titre est découpé en lignes, chacune dans un masque à sa hauteur. Chaque ligne part sous son bord (`yPercent: 115`), penchée de 4° avec le pivot en bas à gauche, et monte en se redressant (`yPercent: 0`, `rotate: 0`). Durée 0,9 s par ligne, courbe emphasized, 0,09 s entre deux lignes. Un titre de trois lignes est posé en 1,1 s environ.

C'est l'entrée par lignes qui existe déjà dans `instant/reveal-motion.tsx` et `ink-word-motion.tsx`, avec en plus la rotation.

### 2. La mise au point (« Notre méthode »)

1. Les deux lignes de la phrase entrent comme un titre de section (animation 1).
2. À 0,75 s, une fois « commence par une » posé, les lettres d'« Immersion » sortent du flou l'une après l'autre : de `opacity: 0`, `blur(14px)`, `scale: 1.08` vers `opacity: 1`, `blur(0)`, `scale: 1`. Durée 0,8 s par lettre, courbe emphasized, 0,045 s entre deux lettres. La place du mot est réservée dès le départ : la phrase ne bouge pas.
3. À 1,3 s, les deux crochets rouges se referment sur le mot depuis l'extérieur : le crochet ouvrant part de `x: -0.35em`, le fermant de `x: +0.35em`, tous deux de `opacity: 0`. Durée 0,55 s, courbe fluide.
4. Une fois les lignes posées (0,95 s), les masques laissent déborder le contenu (`overflow: visible`), pour que les crochets ne soient jamais coupés.

Durée totale : 1,9 s. Les crochets gardent leur dessin actuel (`agents-ink-bracket`, 3 px, Fushimi, calés sur les lettres). Le balayage d'encre (`--ink-sweep`, `data-writing`) et le tracé des crochets de haut en bas disparaissent.

### 3. Le rouleau (appel final et chiffres clés)

**L'appel final** (« Commençons par une tâche qui vous prend du temps ») : le titre est découpé en mots puis en lettres, chaque lettre dans un masque. Chaque lettre monte de derrière son bord (`yPercent: 110` vers `0`). Durée 0,7 s, courbe emphasized, 0,018 s entre deux lettres. Les mots ne se coupent pas en fin de ligne.

**Le chiffre clé** (« +1,4 » et son unité « M » dans `CaseCard`) : chaque chiffre est une fenêtre d'un chiffre de haut, derrière laquelle défile une colonne de chiffres. La colonne fait un tour complet (0 à 9), puis s'arrête sur la valeur, soit `10 + valeur` crans. Le premier chiffre roule en 1,1 s, chaque chiffre suivant 0,25 s de plus, si bien qu'ils s'arrêtent de gauche à droite. Courbe `power3.out`. Les autres signes (« + », « , », l'unité) montent de `yPercent: 30` et apparaissent en fondu. Durée 0,6 s, courbe emphasized, 0,08 s entre deux signes, à partir de 0,1 s. La largeur de chaque fenêtre est celle de son chiffre final : le chiffre ne bouge pas pendant le défilement.

### 4. Le lancer (titres d'une seule ligne)

Réservé aux titres qui tiennent sur une seule ligne à toutes les tailles d'écran où ils s'animent. Le shuriken (l'étoile seule, sans galet, en Fushimi, à 0,42 fois la taille du texte) part avant le premier mot et traverse la ligne en tournant. Sa rotation suit la distance parcourue (0,9° par pixel). Il part vite et ralentit jusqu'au bout, sur la courbe `cubic-bezier(0.22, 0.38, 0.42, 1)`. Chaque mot se dresse au passage de l'étoile : de `opacity: 0`, `y: 0.22em`, `rotate: -8°` (pivot en bas à gauche) vers sa place, en 0,55 s, courbe emphasized. Sur les trois dernières fois sa taille de trajet, l'étoile rétrécit jusqu'à 22 % de sa taille.

- Si le titre finit par un point, l'étoile descend sur la ligne de base et se pose sur le point, qui prend sa place.
- Sinon, elle se réduit en un point et s'efface.

Durée du trajet : 0,00024 s par pixel de trajet, bornée entre 0,6 et 1,4 s. L'ensemble est ensuite ralenti à ×0,4, le réglage choisi par Maëlys. Un titre comme « Agents IA sur mesure » dure environ 1,6 s.

## Règles communes

- **Une fois.** Chaque titre joue son entrée une fois, quand il arrive au tiers de la fenêtre (`rootMargin: 0px 0px -33% 0px`, comme `InkWord` aujourd'hui), et jamais au retour.
- **Contenu déjà vu.** Un titre déjà à l'écran quand le mouvement se charge reste tel qu'il a été peint, selon la règle d'`enterUnseen`. Exception gardée pour « Notre méthode » : décidée le 10 novembre, elle rejoue toute la séquence, lignes comprises, quand on ouvre la page sur la section.
- **Mouvement réduit et téléphones.** Sous `prefers-reduced-motion`, aucun titre ne s'anime : il est affiché complet, crochets compris. Sur téléphone, les animations jouent aussi, comme sur desktop (décision de Maëlys du 11 novembre).
- **Chargement.** GSAP et SplitText ne se chargent qu'après l'affichage de la page, dans un module différé rendu par `AfterIdle`, comme `InkWordMotion`. Le titre est peint complet au premier affichage, et le découpage attend `document.fonts.ready`, pour que les lignes cassent là où le visiteur les voit casser.
- **Lecteurs d'écran.** Le titre garde son texte accessible tel quel. Les découpes (lignes, lettres, colonnes de chiffres, étoile) sont masquées aux technologies d'assistance. Le chiffre clé s'annonce « +1,4 M », jamais la colonne de chiffres.
- **Pas de calque par lettre.** Les lettres et morceaux animés bougent en 2D, sans `translate3d` forcé (`force3D: false`). Le prototype a montré qu'un calque graphique par morceau de lettre saturait le navigateur sur un long titre.

## Ce qui change dans le code

- Le composant de titre de `packages/ui/src/agents` gagne une entrée par rôle, choisie par une prop et non par la page : les pages ne stylent rien et ne touchent pas à GSAP (règle 1 du projet).
- `InkWord` perd l'encre et prend la mise au point, avec un test d'abord : la mise au point s'écrit avant le code.
- `CaseCard` et l'appel final de `closing-copy.tsx` prennent le rouleau.
- Le lancer devient un composant livré avec sa story et ses tests, sans emploi sur `/agents` pour l'instant.
- `DESIGN.md` décrit le système (un rôle, une animation) et remplace la description de l'encre d'« Immersion ». `packages/ui/AGENTS.md` liste les nouveaux composants et props.
- Aucune nouvelle bibliothèque : GSAP, SplitText et CustomEase sont déjà dans le projet. Pas d'ADR, puisque c'est un choix de design.

## Non-objectifs et anti-objectifs

- Le hero de `/agents` garde son film et sa promesse qui brûle. Les titres des propositions de hero en cours de revue (`hero-*`) ne changent pas.
- Pas de changement de texte, de taille de titre ni de mise en page.
- Ce serait raté, même si techniquement ça marche, si un titre :
  - clignote ou se décale au chargement (aucun décalage de mise en page) ;
  - est coupé par son masque une fois posé, les crochets compris ;
  - se lit mal à mi-animation plus d'une fraction de seconde ;
  - montre une étoile ou un chiffre qui saute au lieu de glisser.
- Pas de coupe en biais ni de lame : ces pistes sont abandonnées.

## Laissé au constructeur

- Le nom et la forme de la prop d'entrée, et le découpage en modules.
- L'endroit du token de la courbe fluide et son nom.
- La façon d'animer le chiffre de `CaseCard` sur le mur courbe (`CaseRing`), où une seule carte parle à la fois : **mon choix** est que le chiffre roule chaque fois que sa carte arrive de face (`--ring-voice` à 1), une seule fois quand la carte entre à l'écran dans la liste des téléphones, et jamais en mouvement réduit, où le chiffre est affiché tel quel.
- Le seuil qui décide si un titre de page tient sur une ligne, pour le lancer.
