const STATUS_STYLES = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
}

// Small pill showing whether a bed is available or occupied.
export default function BedStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {status}
    </span>
  )
}
