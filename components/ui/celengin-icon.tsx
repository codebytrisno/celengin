export function CelenginIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Piggy body */}
      <rect x="4.5" y="8.5" width="17" height="12" rx="4" fill="currentColor" />
      {/* Snout */}
      <ellipse cx="8" cy="14" rx="2.8" ry="2.8" fill="currentColor" opacity="0.8" />
      {/* Ears */}
      <path d="M7.5 9L9 4l3 3" fill="currentColor" />
      <path d="M18.5 9L17 4l-3 3" fill="currentColor" />
      {/* Eye */}
      <circle cx="13" cy="12" r="1.3" fill="white" />
      {/* Coin slot */}
      <rect x="16" y="6" width="3.5" height="2.5" rx="1" fill="currentColor" opacity="0.7" />
      {/* Coin */}
      <circle cx="17.75" cy="5" r="1.8" fill="#FBBF24" />
      <text x="17.75" y="5.8" textAnchor="middle" fontSize="2" fontWeight="bold" fill="white">$</text>
      {/* Tail */}
      <path d="M21.5 16c2 0 2-3 0-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Sparkle */}
      <circle cx="3" cy="5.5" r="0.6" fill="#FBBF24" />
      <circle cx="24" cy="21.5" r="0.5" fill="#FBBF24" />
    </svg>
  )
}
