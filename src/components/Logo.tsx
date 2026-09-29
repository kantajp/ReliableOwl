// App logo: an "S" drawn as a flow that routes through three nodes — the
// initial of "System" rendered as connected nodes (this app's core idea).
export function Logo({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 8.5C18 5 10 6.5 10 11.5S22 17 22 22 12 27 8 23" />
      <circle cx="23" cy="8.5" r="2.5" fill={color} stroke="none" />
      <circle cx="16" cy="16" r="2.9" fill={color} stroke="none" />
      <circle cx="8" cy="23" r="2.5" fill={color} stroke="none" />
    </svg>
  );
}
