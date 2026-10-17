// One hostel the tenant could switch into, with the pay button.
export default function SwitchOptionCard({
  hostel,
  feeRupees,
  disabled,
  isSaving,
  onSwitch,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="font-medium text-slate-900">{hostel.name}</p>
        <p className="text-sm text-slate-500">
          {hostel.location ?? 'Kochi'} · ₹
          {hostel.rentPerMonth?.toLocaleString('en-IN') ?? 0}/month
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSwitch(hostel)}
        disabled={disabled || isSaving}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSaving ? 'Processing...' : `Switch · ₹${feeRupees}`}
      </button>
    </div>
  )
}
