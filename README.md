# SHUNPO · propositions de landing pages

Trois directions artistiques animées pour SHUNPO, agence IA, automatisation et logiciels sur mesure à Lyon. Une promesse, « SHUNPO vous libère du temps », trois façons de la faire ressentir.

| Route        | Direction | Signature                                                                 |
| ------------ | --------- | ------------------------------------------------------------------------- |
| `/`          | Index     | Les trois propositions côte à côte                                        |
| `/instant`   | Instant   | Estampe japonaise, particules d’encre qui sautent d’une forme à l’autre   |
| `/mecanique` | Mécanique | Horlogerie de nuit, calibre 3D éclaté puis assemblé                       |
| `/fil`       | Le fil    | Tressage kumihimo, fils emmêlés puis tressés, fil rouge à travers la page |

## Démarrer

Node.js 24 et pnpm 12 (`npm install -g pnpm@12`).

```bash
pnpm install
pnpm dev          # site sur :3000, Storybook sur :6006
pnpm check        # format, lint, types, tests, code mort, ADR
pnpm test:e2e     # build + audit design et motion dans le navigateur
```

Dans Conductor, utilisez les actions `dev`, `check` et `e2e` : chaque workspace a ses ports.

## Où regarder

- [`DESIGN.md`](DESIGN.md) : les trois directions, les décisions, les storyboards.
- [`PRODUCT.md`](PRODUCT.md) et [`.agents/product-marketing.md`](.agents/product-marketing.md) : surfaces, public, voix.
- [`AGENTS.md`](AGENTS.md) : commandes, structure, règles.
- [`packages/ui/AGENTS.md`](packages/ui/AGENTS.md) : l’inventaire du design system.
- [`docs/adr`](docs/adr/README.md) : décisions techniques.
