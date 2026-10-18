import StatusBadge from '../../../components/ui/StatusBadge'

// The bed vocabulary the app actually writes. Anything else falls back to the
// shared StatusBadge map.
const STATUS_TONES = {
  available: 'success',
  occupied: 'neutral',
  maintenance: 'danger',
}

// Small status tag showing whether a bed is available or occupied.
export default function BedStatusBadge({ status }) {
  const key = String(status ?? '').toLowerCase()

  return <StatusBadge status={status} tone={STATUS_TONES[key]} />
}
