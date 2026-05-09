export const color = {
  // Felt surfaces (backgrounds, dark-to-light)
  feltBase:    '#071812', // root bg, AppShell, landscape-blocker
  feltDeep:    '#042317', // PlayScreen inner surface
  feltSurface: '#0b1e16', // Drawer / bottom-sheet bg
  feltPanel:   '#08291d', // HandPreviewOverlay panel
  feltRaised:  '#1a3428', // dark guess button bg
  feltCard:    '#183428', // player row bg in PlayerEditor

  // Gold / brass accent system
  gold:    '#f5d99b', // primary interactive, active tile, gold button bg
  goldDim: '#d8c79f', // muted nav labels, icon resting state
  goldRing: '#c9a84c', // ring border on gold-bg surfaces

  // Ink (dark text that sits on gold or light backgrounds)
  ink: '#142019',

  // Cream (primary text on dark backgrounds)
  cream: '#fff7e6',

  // Card face
  cardFace: '#fbf2d9', // playing card front background
  cardText: '#111827', // black suit / rank text

  // Red suit / danger
  red:     '#b72e35', // danger button, red suits
  redDeep: '#9b1c22', // red guess button (slightly darker)

  // Feedback: correct
  correctBg:     '#123a2a',
  correctText:   '#dff8e8',
  correctBorder: '#7fd8a3',

  // Feedback: wrong
  wrongBg:          '#481923',
  wrongText:        '#ffe5e8',
  wrongBorder:      '#f0a0a8',
  wrongSummaryBg:   '#ffe1a8', // warm-amber badge on wrong outcome toast
  wrongSummaryText: '#34210a', // dark brown text on wrong-summary badge

  // History timeline
  historyRed: '#ff7a7a',
} as const;

export type ColorToken = keyof typeof color;

export const shadow = {
  card:        '0 18px 40px rgba(0,0,0,0.32)',
  glow:        '0 0 32px rgba(245,217,155,0.28)',
  glowSm:      '0 0 18px rgba(245,217,155,0.20)',
  panel:       '0 8px 32px rgba(0,0,0,0.42)',
  sheet:       '0 -8px 40px rgba(0,0,0,0.52)',
  danger:      '0 2px 18px rgba(183,46,53,0.32)',
  dealCorrect: '0 12px 40px rgba(47,160,99,0.18)',
  dealWrong:   '0 12px 40px rgba(163,38,54,0.20)',
} as const;

export type ShadowToken = keyof typeof shadow;
