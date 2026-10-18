import Button from "../../../components/ui/Button";
import StatusBadge from "../../../components/ui/StatusBadge";
import formatRupees from "../../../utils/formatRupees";

// A food plan a tenant can subscribe to (or cancel if already subscribed).
// If they're already on another plan, this one can't be subscribed to until
// the current plan is cancelled.
export default function SubscriptionCard({
  foodPlan,
  isActive,
  hasActiveSubscription,
  isSaving,
  onSubscribe,
  onUnsubscribe,
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">
            {foodPlan.name}
          </h3>
        </div>

        {isActive && <StatusBadge status="subscribed" />}
      </div>

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

      <p className="mt-3 text-base font-semibold tabular-nums text-forest">
        {formatRupees(foodPlan.pricePerMonth)}
        <span className="ml-1 text-xs font-normal text-charcoal/55">
          /month
        </span>
      </p>

      <div className="mt-4 border-t border-line pt-3">
        {isActive ? (
          <Button
            variant="danger"
            block
            onClick={onUnsubscribe}
            disabled={isSaving}
          >
            {isSaving ? "Cancelling..." : "Cancel plan"}
          </Button>
        ) : hasActiveSubscription ? (
          <p className="text-sm leading-relaxed text-charcoal/60">
            Cancel your current plan to switch to this one.
          </p>
        ) : (
          <Button block onClick={onSubscribe} disabled={isSaving}>
            {isSaving ? "Subscribing..." : "Subscribe"}
          </Button>
        )}
      </div>
    </div>
  );
}
