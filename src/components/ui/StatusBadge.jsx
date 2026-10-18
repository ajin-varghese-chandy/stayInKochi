// Consistent status vocabulary across owner, tenant, and public screens.
// Tones: success | warning | danger | neutral | accent.
const TONE_BY_STATUS = {
  // success
  paid: 'success',
  approved: 'success',
  active: 'success',
  resolved: 'success',
  available: 'success',
  booked: 'success',
  subscribed: 'success',
  completed: 'success',
  occupied: 'neutral',

  // warning (waiting on someone)
  pending: 'warning',
  open: 'warning',
  'in-progress': 'warning',
  in_progress: 'warning',
  processing: 'warning',
  unpaid: 'warning',
  requested: 'warning',
  unread: 'warning',

  // danger
  rejected: 'danger',
  cancelled: 'danger',
  canceled: 'danger',
  failed: 'danger',
  overdue: 'danger',
  'on-hold': 'danger',
  maintenance: 'danger',

  // neutral
  closed: 'neutral',
  resolved_later: 'neutral',
  inactive: 'neutral',
  ended: 'neutral',
  expired: 'neutral',
  read: 'neutral',
}

function prettify(status) {
  return String(status ?? '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Rectangular status tag. Accepts a raw status and maps it to a tone, or an
// explicit `tone` + `label` when the caller needs custom wording.
export default function StatusBadge({ status, tone, label }) {
  const key = String(status ?? '').toLowerCase()
  const resolvedTone = tone ?? TONE_BY_STATUS[key] ?? 'neutral'

  return (
    <span className={`badge badge-${resolvedTone}`}>
      {label ?? prettify(status)}
    </span>
  )
}
