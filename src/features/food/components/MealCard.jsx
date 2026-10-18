import Button from '../../../components/ui/Button'

// One individual meal on the owner's food management screen.
export default function MealCard({ meal, isSaving, onEdit, onDelete }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">{meal.name}</h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {meal.hostelName ?? 'Branch assigned'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-base font-semibold tabular-nums text-forest">
        ₹{meal.price}
        <span className="ml-1 text-xs font-normal text-charcoal/55">
          per meal
        </span>
      </p>

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-3">
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={onDelete}
          disabled={isSaving}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
