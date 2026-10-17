// One individual meal on the owner's food management screen.
export default function MealCard({ meal, isSaving, onEdit, onDelete }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{meal.name}</h3>
          <p className="text-sm text-slate-500">
            {meal.hostelName ?? 'Hostel assigned'}
          </p>
          <p className="mt-1 font-semibold text-indigo-600">
            ₹{meal.price}
            <span className="font-normal text-slate-500"> per meal</span>
          </p>
        </div>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isSaving}
            className="rounded-md border border-red-300 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
