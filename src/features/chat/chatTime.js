// Chat timestamps are stored as ISO strings. These helpers show them in the
// viewer's local timezone and give the day dividers a stable YYYY-MM-DD key.
export function dayKey(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function dayLabel(key) {
  if (!key) return ''

  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (key === dayKey(today)) return 'Today'
  if (key === dayKey(yesterday)) return 'Yesterday'

  const date = new Date(`${key}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? key
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}
