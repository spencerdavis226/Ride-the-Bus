type CardBackMedallionProps = {
  accent: string;
  light: boolean;
  textColor?: string;
};

export function CardBackMedallion({ accent, light, textColor }: CardBackMedallionProps) {
  const ring = light ? (textColor ?? '#142019') : accent;
  const monogram = light ? (textColor ?? '#142019') : accent;
  const busBody = light ? 'rgba(20, 32, 25, 0.85)' : 'rgba(0, 0, 0, 0.35)';

  return (
    <svg
      className="pointer-events-none absolute inset-0 m-auto h-[46%] w-[46%] max-h-[5.5rem] max-w-[5.5rem]"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle cx="50" cy="50" r="38" fill="none" stroke={ring} strokeWidth="0.9" opacity="0.5" />
      <g transform="translate(50 48)">
        <rect x="-22" y="-10" width="44" height="16" rx="3" fill={busBody} stroke={monogram} strokeWidth="0.6" />
        <rect x="-18" y="-16" width="36" height="8" rx="2" fill={busBody} stroke={monogram} strokeWidth="0.5" />
        <circle cx="-12" cy="8" r="4" fill="none" stroke={monogram} strokeWidth="0.55" />
        <circle cx="12" cy="8" r="4" fill="none" stroke={monogram} strokeWidth="0.55" />
        <circle cx="-12" cy="8" r="1.5" fill={monogram} opacity="0.6" />
        <circle cx="12" cy="8" r="1.5" fill={monogram} opacity="0.6" />
      </g>
      <text
        x="50"
        y="74"
        textAnchor="middle"
        fill={monogram}
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.22em"
        opacity="0.75"
        fontFamily="system-ui, sans-serif"
      >
        RTB
      </text>
    </svg>
  );
}
