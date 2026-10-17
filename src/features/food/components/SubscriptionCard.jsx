import formatRupees from '../../../utils/formatRupees'

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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{foodPlan.name}</h3>
          <p className="mt-1 font-semibold text-indigo-600">
            {formatRupees(foodPlan.pricePerMonth)}
            <span className="font-normal text-slate-500"> /month</span>
          </p>
        </div>

        {isActive && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Subscribed
          </span>
        )}
      </div>

      {foodPlan.includes?.length > 0 && (
        <p className="mt-2 text-sm text-slate-600">
          Includes: {foodPlan.includes.join(', ')}
        </p>
      )}

      {isActive ? (
        <button
          type="button"
          onClick={onUnsubscribe}
          disabled={isSaving}
          className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {isSaving ? 'Cancelling...' : 'Cancel plan'}
        </button>
      ) : hasActiveSubscription ? (
        <p className="mt-4 text-sm text-slate-500">
          Cancel your current plan to switch to this one.
        </p>
      ) : (
        <button
          type="button"
          onClick={onSubscribe}
          disabled={isSaving}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSaving ? 'Subscribing...' : 'Subscribe'}
        </button>
      )}
    </div>
  )
}
