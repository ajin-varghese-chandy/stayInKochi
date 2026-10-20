import { Link } from 'react-router-dom'

// The StayInKochi mark: a forest tile with a Kerala-style verandah arch.
export function BrandMark({ className = 'h-7 w-7' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="12" fill="#244C3A" />
      <path
        d="M16 48V32a16 16 0 0 1 32 0v16h-8V32a8 8 0 0 0-16 0v16z"
        fill="#F7F4EC"
      />
      <rect x="16" y="50" width="32" height="4" rx="1" fill="#B96548" />
    </svg>
  )
}

// Wordmark used in the public navbar, footers, and both portals.
// tone: 'dark' for light backgrounds, 'light' for forest/charcoal backgrounds.
export default function Brand({ to = '/', tone = 'dark', markSize = 'h-7 w-7' }) {
  const textClass =
    tone === 'light' ? 'text-ivory' : 'text-charcoal'

  return (
    <Link to={to} className="group inline-flex items-center gap-2.5">
      <BrandMark className={`${markSize} shrink-0`} />
      <span
        className={`display text-[1.15rem] leading-none ${textClass} transition-colors`}
      >
        StayInKochi
      </span>
    </Link>
  )
}
