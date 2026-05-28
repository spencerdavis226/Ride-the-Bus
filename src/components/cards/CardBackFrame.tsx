type CardBackFrameProps = {
  accent: string;
  light: boolean;
};

export function CardBackFrame({ accent, light }: CardBackFrameProps) {
  const inner = light ? 'rgba(20, 32, 25, 0.45)' : accent;
  const corner = light ? 'rgba(20, 32, 25, 0.65)' : accent;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="84"
        height="124"
        rx="5"
        fill="none"
        stroke={inner}
        strokeWidth="0.55"
        vectorEffect="non-scaling-stroke"
        opacity="0.65"
      />
      {[
        { x: 10.5, y: 10.5, sx: 1, sy: 1 },
        { x: 89.5, y: 10.5, sx: -1, sy: 1 },
        { x: 10.5, y: 129.5, sx: 1, sy: -1 },
        { x: 89.5, y: 129.5, sx: -1, sy: -1 },
      ].map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.sx} ${c.sy})`}>
          <path
            d="M0 0 L9 0 L9 1.8 L1.8 1.8 L1.8 9 L0 9 Z"
            fill="none"
            stroke={corner}
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
            opacity="0.75"
          />
        </g>
      ))}
    </svg>
  );
}
