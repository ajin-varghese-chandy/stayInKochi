// Inline feedback strip. Tones: info (default) | success | warning | error.
export default function Alert({ tone = 'info', children, className = '' }) {
  return (
    <div className={`alert alert-${tone} ${className}`} role="status">
      {children}
    </div>
  )
}
