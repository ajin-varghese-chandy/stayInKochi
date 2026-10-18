// Loading indicator with an optional label. Calm, on-brand, no spinner sprites.
export default function Spinner({ label = 'Loading…', compact }) {
  return (
    <div
      className={`flex items-center gap-3 text-sm text-charcoal/60 ${
        compact ? 'py-4' : 'py-16'
      } justify-center`}
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-forest"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}
