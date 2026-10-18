import Button from "../../../components/ui/Button";
import formatRupees from "../../../utils/formatRupees";

// One food plan on the owner's food management screen.
export default function FoodPlanCard({ foodPlan, isSaving, onEdit, onDelete }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">
            {foodPlan.name}
          </h3>
          <p className="mt-0.5 text-xs text-charcoal/55">
            {foodPlan.hostelName ?? "Branch assigned"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-base font-semibold tabular-nums text-forest">
        {formatRupees(foodPlan.pricePerMonth)}
        <span className="ml-1 text-xs font-normal text-charcoal/55">
          /month
        </span>
      </p>

      {foodPlan.includes?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {foodPlan.includes.map((item) => (
            <li
              key={item}
              className="rounded-card border border-line bg-ivory px-2 py-0.5 text-xs text-charcoal/70"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

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
  );
}
