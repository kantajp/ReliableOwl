// App logo: "Reliable Owl" mark. An owl reduced to its most recognizable
// features — a bold V brow over two big round eyes and a small beak — so it
// stays readable even at favicon sizes (16px). Drawn to sit on the brand
// gradient tile: `color` paints the brow, eyes and beak, `pupilColor` the pupils.
export function Logo({
  size = 24,
  color = '#fff',
  pupilColor = '#3b4bc4',
}: {
  size?: number;
  color?: string;
  pupilColor?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {/* V brow (also reads as the ear tufts) */}
      <path
        d="M4.5 8.5L16 13.2L27.5 8.5"
        fill="none"
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* big round eyes */}
      <circle cx="10.6" cy="18" r="5.6" fill={color} />
      <circle cx="21.4" cy="18" r="5.6" fill={color} />
      {/* pupils, glancing slightly to the right */}
      <circle cx="11.4" cy="18.2" r="2.5" fill={pupilColor} />
      <circle cx="22.2" cy="18.2" r="2.5" fill={pupilColor} />
      {/* beak */}
      <path d="M14.6 24.2H17.4L16 26.4Z" fill={color} />
    </svg>
  );
}
