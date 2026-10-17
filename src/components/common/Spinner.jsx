// Simple loading indicator with an optional label.
export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <span className="size-6 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
