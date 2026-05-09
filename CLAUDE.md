# Ride the Bus — Agent Instructions

This file is read automatically by Claude Code at the start of every session.
**All changes to this codebase must follow the design system described below and in [`DESIGN.md`](./DESIGN.md).**
Rogue or one-off styles that bypass the system will be rejected in review.

---

## Design system — non-negotiable rules

### 1. Colors and shadows: semantic tokens only

Never write raw hex values (`[#f5d99b]`, `text-[#142019]`, etc.) in any `.tsx` or `.ts` file.
Use the semantic Tailwind classes generated from `src/lib/tokens.ts`:

```
felt-base  felt-deep  felt-surface  felt-panel  felt-raised  felt-card
gold  gold-dim  gold-ring  ink  cream
card-face  card-text  red-suit  red-deep
correct-bg  correct-text  correct-border
wrong-bg  wrong-text  wrong-border  wrong-summary-bg  wrong-summary-text
history-red
```

Shadow utilities: `shadow-card  shadow-glow  shadow-glow-sm  shadow-panel  shadow-sheet  shadow-danger  shadow-deal-correct  shadow-deal-wrong`

**Exception:** `src/components/cards/CardBack.tsx` — the `backClasses` map is an intentional catalog of 30 card-theme colors and may keep raw hex.

To add a new color: add to `src/lib/tokens.ts` → add to `tailwind.config.ts` → use the class name.

### 2. Motion and animation: useMotion() only

Never inline spring configs (`{ type: 'spring', damping: 26, stiffness: 260 }`).
Never call `useReducedMotion()` directly in a component.
Always import from `src/lib/motion.ts`:

```ts
import { useMotion } from '../../lib/motion';
import { springs, sceneEntryVariants, dealOutcomeVariants } from '../../lib/motion';
```

- Scene entries → `sceneEntryVariants` + `springs.sceneEntry`
- Card highlight → `springs.cardHighlight`
- Overlay panels → `springs.overlay`
- Drawer sheets → `springs.drawer`
- Table carousel → `springs.carousel`
- Bus/guess picker → `springs.guessPicker`

`useMotion()` returns reduced-motion-safe variants. Use it; don't work around it.

### 3. Responsive design: inline Tailwind variants only

Never add new `@media` blocks to `src/styles/globals.css`.
Never use `!important` to override layout.

Use the two custom Tailwind screens already configured in `tailwind.config.ts`:

- `landscape-xs:` — landscape phone / small tablet `(orientation: landscape) and (max-height: 500px) and (max-width: 950px)`
- `desktop-xl:` — large desktop `(min-width: 1600px) and (min-height: 900px)`

Put responsive overrides directly on the element's `className`, e.g.:
```tsx
className="text-[0.82rem] landscape-xs:text-[0.68rem] desktop-xl:text-[0.9rem]"
```

### 4. Fluid sizing: clamp() not static breakpoints

Typography and spacing that scales with viewport must use `clamp()` via Tailwind arbitrary values:
```tsx
className="text-[clamp(3.1rem,14vw,7.5rem)]"
```
Do not add static `text-2xl` overrides for different breakpoints when `clamp()` covers the range.

### 5. Card fan layout: use CardFanLayout

Never reimplement `ResizeObserver` + card overlap math in a scene component.
Use `src/components/cards/CardFanLayout.tsx` for any fanned hand display.

### 6. Globals.css is for structural CSS only

`src/styles/globals.css` should only contain:
- `@tailwind` directives
- `:root` base styles (using `theme()` helpers, no raw hex)
- Named CSS utility classes (`.glass-panel`, `.felt-gradient`, `.safe-screen`, `.card-fluid`, `.tap-target`)
- The `.landscape-blocker` rule and its one media query (extreme portrait lock)
- `@media (prefers-reduced-motion)` for CSS animations only

Everything else belongs in component `className` strings.

---

## Key source files

| Purpose | File |
|---|---|
| Color + shadow tokens | `src/lib/tokens.ts` |
| Tailwind config (semantic classes, screens) | `tailwind.config.ts` |
| Motion presets + useMotion hook | `src/lib/motion.ts` |
| Card fan layout utility | `src/lib/cardFan.ts` |
| Reusable card fan component | `src/components/cards/CardFanLayout.tsx` |
| Shared play-phase layout primitives | `src/components/play/PlayLayout.tsx` |
| Global CSS (structural only) | `src/styles/globals.css` |

---

## Before making UI changes

1. Check `src/lib/tokens.ts` — does a token already exist for the color you need?
2. Check `src/lib/motion.ts` — does a spring preset already exist for the animation you need?
3. Check `src/components/play/PlayLayout.tsx` — does a layout primitive already exist (`PlayScreen`, `PlayFelt`, `PlayActionZone`, `PlayGuessPicker`, `PlayerTurnRail`, etc.)?
4. If adding a new token, spring, or layout primitive, add it to the system file first, then use it.

See [`DESIGN.md`](./DESIGN.md) for the full design language reference.
