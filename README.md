# Ride the Bus

A static, mobile-first React version of the custom Ride the Bus card game. It is designed for GitHub Pages, iPhone Safari, and home-screen PWA play with no backend, auth, database, or server functions.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Vitest
- `vite-plugin-pwa`
- `localStorage` save/resume

## Local Development

Install Node.js 22 or newer, then run:

```bash
npm install
npm run generate:icons
npm run dev
```

Validation:

```bash
npm test
npm run build
```

## Game Rules

The game has three phases: Deal, The Table, and The Bus.

Deal and The Table share a calculated multi-deck shoe:

```ts
requiredCards = players.length * 4 + 11
phaseOneTwoDecks = Math.ceil(requiredCards / 52)
```

The Bus always starts with a fresh shuffled single 52-card deck. In single-deck mode, the bus stops if cards run out before the riders escape. In endless mode, only The Bus may refresh into another fresh single deck.

Drink values are stored as units so a future points or non-drinking mode can reuse the same engine.

## PWA

The app includes:

- Web app manifest
- Service worker/offline shell
- Apple home-screen meta tags
- Safe-area viewport handling
- SVG source icon at `public/icon.svg`
- PNG icon generation through `npm run generate:icons`

## Deployment

GitHub Actions deploys the Vite build to GitHub Pages on pushes to `main` or `master`.

The Vite base path defaults to `/Ride-the-Bus/`. If the repository name is different, the GitHub Actions build automatically uses `GITHUB_REPOSITORY` to set the deployed base path.
