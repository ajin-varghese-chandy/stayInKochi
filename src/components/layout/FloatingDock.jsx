// Shared floating dock for console tab menus. Keeps the bar content-width,
// centred, lifted off the bottom edge, with a soft shadow beneath it.
export default function FloatingDock({ children, className = '' }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute inset-x-4 -bottom-1.5 h-4 rounded-full bg-forest-deep/35 blur-lg"
        />
        {children}
      </div>
    </div>
  )
}
