// Useful empty / error states — a title, one line of guidance, optional action.
export default function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className = '',
}) {
  return (
    <div
      className={`card flex flex-col items-center px-6 py-10 text-center ${className}`}
    >
      {Icon && (
        <span className="flex h-10 w-10 items-center justify-center rounded-card bg-sage text-forest">
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
      )}
      <p className="mt-3 text-sm font-semibold text-charcoal">{title}</p>
      {hint && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-charcoal/60">
          {hint}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
