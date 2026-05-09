# Ride the Bus — Design System Reference

The visual and interaction language for the game. All six scenes (Setup, Deal, Table, BusIntro, Bus, GameOver) share this foundation. **The Deal scene is the reference implementation** — when in doubt about how something should look or animate, look there first.

---

## Color system

All colors live in `src/lib/tokens.ts` and are exposed as semantic Tailwind classes.

### Felt surfaces (darkest → lightest)
| Class | Role |
|---|---|
| `felt-base` | Root background, AppShell, landscape blocker |
| `felt-deep` | Play-phase inner surface (PlayScreen) |
| `felt-surface` | Drawer / bottom-sheet background |
| `felt-panel` | HandPreviewOverlay panel |
| `felt-raised` | Dark guess button background |
| `felt-card` | Player row background in PlayerEditor |

### Gold accent
| Class | Role |
|---|---|
| `gold` | Primary interactive, active tile, gold button bg |
| `gold-dim` | Muted nav labels, icon resting state |
| `gold-ring` | Ring border on gold-bg surfaces |

### Text
| Class | Role |
|---|---|
| `ink` | Dark text on gold or light backgrounds |
| `cream` | Primary text on dark backgrounds |

### Card face
| Class | Role |
|---|---|
| `card-face` | Playing card front background |
| `card-text` | Black suit / rank text |

### Red / danger
| Class | Role |
|---|---|
| `red-suit` | Danger button, red card suits |
| `red-deep` | Red guess button (slightly darker) |

### Feedback states
| Class | Role |
|---|---|
| `correct-bg` / `correct-text` / `correct-border` | Correct outcome toast |
| `wrong-bg` / `wrong-text` / `wrong-border` | Wrong outcome toast shell |
| `wrong-summary-bg` / `wrong-summary-text` | Warm-amber badge inside wrong toast |

### Utility
| Class | Role |
|---|---|
| `history-red` | Red card color in history timeline |

---

## Shadow system

All shadows live in `src/lib/tokens.ts` as named utilities.

| Class | Role |
|---|---|
| `shadow-card` | Playing card elevation |
| `shadow-glow` | Gold glow (large, active tiles) |
| `shadow-glow-sm` | Gold glow (small, inline accents) |
| `shadow-panel` | Panel / overlay lift |
| `shadow-sheet` | Bottom-sheet upward shadow |
| `shadow-danger` | Red button glow |
| `shadow-deal-correct` | Correct outcome toast glow (green) |
| `shadow-deal-wrong` | Wrong outcome toast glow (red) |

---

## Motion system

Source: `src/lib/motion.ts`

### Spring presets

| Key | damping / stiffness | Use |
|---|---|---|
| `springs.sceneEntry` | 26 / 260 | All scene felt entries |
| `springs.guessPicker` | 24 / 290 | Guess picker, bus card stagger |
| `springs.cardHighlight` | 30 / 340 | Card lift in CardFanLayout |
| `springs.overlay` | 22 / 330 | HandPreviewOverlay, correct outcome |
| `springs.drawer` | 32 / 360 | Drawer sheet slide |
| `springs.carousel` | 30 / 260 | Table carousel card positions |

### Shared variants

**`sceneEntryVariants`** — used by every game scene:
```ts
hidden:  { y: 18, scale: 0.985, opacity: 0 }
visible: { y: 0,  scale: 1,     opacity: 1 }
exit:    { y: -14, scale: 0.985, opacity: 0 }
```

**`dealOutcomeVariants.correct`** — scale pop:
```ts
hidden:  { opacity: 0, scale: 0.88 }
visible: { opacity: 1, scale: 1 }
exit:    { opacity: 0, scale: 0.92 }
```

**`dealOutcomeVariants.wrong`** — micro-shake:
```ts
hidden:  { opacity: 0, x: 0 }
visible: { opacity: 1, x: [0, -6, 5, -4, 3, 0] }  // keyframe waggle
exit:    { opacity: 0 }
```

**`actionZoneVariants`** — fade in/out for action zone swaps:
```ts
hidden:  { opacity: 0, y: 8 }
visible: { opacity: 1, y: 0 }
exit:    { opacity: 0 }
```

### useMotion() hook

```ts
const { sceneEntry, dealOutcome, actionZone, springs, reduced } = useMotion();
```

When the user has OS reduced motion enabled, `reduced` is `true`, spring durations collapse to 0.01s, and variant y/scale values zero out. This is the only place `useReducedMotion()` should be called.

---

## Layout system

### Play-phase primitives (`src/components/play/PlayLayout.tsx`)

Every game scene (Deal, Table, BusIntro, Bus) is built from these:

| Component | Role |
|---|---|
| `<PlayScreen>` | Root flex column, dark felt background |
| `<PlayTopBar>` | Nav bar with home / rules / log icons |
| `<PlayerTurnRail>` | Horizontally scrolling player tiles |
| `<PlayFelt>` | The green felt area (flex-1, felt-gradient) |
| `<PlayActionZone>` | Bottom action strip (buttons) |
| `<PlayGuessPicker>` | Guess button grid (2/3/4 columns) |
| `<HandPreviewOverlay>` | Tapped-player card preview overlay |

### CSS utilities (globals.css)

| Class | Role |
|---|---|
| `.glass-panel` | Frosted-glass card (GameOver, overlays) |
| `.felt-gradient` | Shared radial green felt gradient bg |
| `.safe-screen` | Full-height with env() safe area insets |
| `.card-fluid` | Container-query context for fluid cards |
| `.tap-target` | Enforces 52px minimum touch target height |

### Responsive strategy

Two named Tailwind screens replace all media query blocks:

| Prefix | Condition | Use |
|---|---|---|
| `landscape-xs:` | Landscape phone / small tablet | Compact layout, horizontal pivots |
| `desktop-xl:` | Large desktop (1600×900+) | Wider type, larger touch targets |

In landscape-xs, the main content areas pivot from vertical stacks to horizontal grids:
- **Deal / Bus / BusIntro**: single column → 2-col grid (hero left, cards right)
- **Table**: → 3-col grid (hero | carousel | result)
- **Setup**: → grid-template-areas layout (players | info/actions)

---

## Typography

The typeface stack is iOS system (`-apple-system, SF Pro Display, Inter`). All font weights are either `font-black` (UI labels, numbers, player names) or `font-bold` / `font-semibold` (body copy, secondary text).

Fluid type uses `clamp()` — do not replace with static breakpoint overrides:
- Hero names: `text-[clamp(3.1rem,14vw,7.5rem)]`
- Scene row labels: `text-[clamp(2.6rem,12vw,6rem)]`
- Eyebrow labels: `text-[0.60rem]` with `uppercase tracking-[0.22em]`

---

## Card design

Playing cards are always rendered via `<PlayingCard>` (fixed sizes) or the `fluid` size (container-query scaling using `cqw` units). Never render card content manually.

Card back themes are managed in `<CardBack>` — the `backClasses` map is the one place raw color values are allowed (it's a deliberate theme catalog, not UI styling).

---

## Extending the design system

### Adding a new color token
1. Add to `color` object in `src/lib/tokens.ts` with a comment explaining its role
2. Add the Tailwind mapping to `tailwind.config.ts` under `theme.extend.colors`
3. Use the new class name in components — never the raw hex

### Adding a new shadow
1. Add to `shadow` object in `src/lib/tokens.ts`
2. Add to `theme.extend.boxShadow` in `tailwind.config.ts`
3. Use `shadow-{name}` in components

### Adding a new spring preset
1. Add to `springs` in `src/lib/motion.ts` with a comment on its intended use
2. Reference via `const { springs } = useMotion()`

### Adding a new scene
Follow the Deal scene pattern:
1. Use `<PlayScreen>`, `<PlayTopBar>`, `<PlayerTurnRail>`, `<PlayFelt>`, `<PlayActionZone>`
2. Wrap the felt content in `motion.div` with `variants={sceneEntry}` and `transition={springs.sceneEntry}`
3. Use `landscape-xs:grid landscape-xs:grid-cols-[...]` on the felt content div for landscape layout
4. Import colors from Tailwind semantic classes, not tokens.ts directly
