import { Search } from 'lucide-react'

// Search box with an icon. Used on the public branch list and dashboard tables.
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
  className = '',
}) {
  const input = (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-charcoal/40"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="field pl-9"
      />
    </div>
  )

  if (!label) return input

  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {input}
    </label>
  )
}
