// Standard heading block for operational screens (owner + tenant).
// Keeps page titles compact: no oversized headings inside dashboards.
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1
          className={`text-[1.4rem] font-semibold leading-tight tracking-tight text-charcoal sm:text-2xl ${
            eyebrow ? 'mt-1.5' : ''
          }`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-charcoal/70">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
