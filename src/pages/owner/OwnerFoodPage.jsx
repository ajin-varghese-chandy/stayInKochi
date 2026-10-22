import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UtensilsCrossed } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Spinner from '../../components/common/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import FoodPlanCard from '../../features/food/components/FoodPlanCard'
import FoodPlanForm from '../../features/food/components/FoodPlanForm'
import {
  fetchAllFoodData,
  removeFoodPlan,
  selectFoodError,
  selectFoodPlans,
  selectFoodSaving,
  selectFoodLoading,
} from '../../features/food/foodPlanSlice'
import { getAllFoodPayments, getAllSubscriptions } from '../../features/food/foodBookingService'
import { fetchHostels } from '../../features/hostels/hostelSlice'
import formatRupees from '../../utils/formatRupees'

const TABS = [
  { key: 'plans', label: 'Food plans' },
  { key: 'activity', label: 'Activity' },
]

// A plan is only active while its paid month is still running.
function isActiveSubscription(subscription) {
  if (subscription.status !== 'active') return false
  if (!subscription.endsOn) return true
  return subscription.endsOn >= new Date().toISOString().slice(0, 10)
}

// Owner screen for managing food plans.
export default function OwnerFoodPage() {
  const dispatch = useDispatch()
  const plans = useSelector(selectFoodPlans)
  const isLoading = useSelector(selectFoodLoading)
  const error = useSelector(selectFoodError)
  const isSaving = useSelector(selectFoodSaving)

  // Form state: adding vs editing a plan.
  const [addingPlan, setAddingPlan] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  // Activity tab
  const [activeTab, setActiveTab] = useState('plans') // 'plans' | 'activity'
  const [subscriptions, setSubscriptions] = useState([])
  const [foodPayments, setFoodPayments] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState(null)

  useEffect(() => {
    dispatch(fetchAllFoodData())
    dispatch(fetchHostels()) // forms need the hostel list for their dropdown
  }, [dispatch])

  // Loading is raised while switching into the tab (event handler), then the
  // effect below fetches and settles it.
  function handleTabChange(key) {
    if (key === activeTab) return
    setActiveTab(key)
    if (key === 'activity') {
      setActivityLoading(true)
      setActivityError(null)
    }
  }

  useEffect(() => {
    if (activeTab !== 'activity') return

    let cancelled = false
    Promise.all([
      getAllSubscriptions(),
      getAllFoodPayments(),
    ])
      .then(([subs, payments]) => {
        if (cancelled) return
        setSubscriptions(subs)
        setFoodPayments(
          payments.sort((a, b) =>
            String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
          ),
        )
        setActivityLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setActivityError(err.message)
        setActivityLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeTab])

  function handleDeletePlan(plan) {
    if (window.confirm(`Delete food plan "${plan.name}"?`)) {
      dispatch(removeFoodPlan(plan.id))
    }
  }

  const showPlanForm = addingPlan || editingPlan !== null

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Food"
        description="Monthly plans and current activity."
      />

      {/* Section tabs */}
      <div className="mt-6 border-b border-line">
        <div className="nav-scroll" role="tablist" aria-label="Food sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`tab ${activeTab === tab.key ? 'is-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {isLoading && <Spinner compact label="Loading food data…" />}
        {error && <Alert tone="error">Could not load food data: {error}</Alert>}

        {/* Food plans tab */}
        {activeTab === 'plans' && !isLoading && !error && (
          <section aria-labelledby="food-plans-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="food-plans-heading" className="text-base font-semibold text-charcoal">
                Food plans
              </h2>
              {!showPlanForm && (
                <Button size="sm" onClick={() => setAddingPlan(true)}>
                  Add food plan
                </Button>
              )}
            </div>

            <div className="mt-3 space-y-4">
              {showPlanForm && (
                <div className="card p-5">
                  <FoodPlanForm
                    foodPlan={editingPlan}
                    onDone={() => {
                      setAddingPlan(false)
                      setEditingPlan(null)
                    }}
                  />
                </div>
              )}

              {!showPlanForm && plans.length === 0 && (
                <EmptyState
                  icon={UtensilsCrossed}
                  title="No food plans yet"
                  hint="Add a monthly plan so tenants can subscribe from their account."
                />
              )}

              {plans.map((plan) => (
                <FoodPlanCard
                  key={plan.id}
                  foodPlan={plan}
                  isSaving={isSaving}
                  onEdit={() => {
                    setAddingPlan(false)
                    setEditingPlan(plan)
                  }}
                  onDelete={() => handleDeletePlan(plan)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="space-y-8">
            {activityLoading && <Spinner compact label="Loading activity…" />}
            {activityError && (
              <Alert tone="error">Could not load activity: {activityError}</Alert>
            )}

            {!activityLoading && !activityError && (
              <>
                <section aria-labelledby="subscriptions-heading">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2
                      id="subscriptions-heading"
                      className="text-base font-semibold text-charcoal"
                    >
                      Active plan subscriptions
                    </h2>
                    <span className="text-sm text-charcoal/55">
                      {subscriptions.filter(isActiveSubscription).length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {subscriptions.filter(isActiveSubscription).length === 0 && (
                      <p className="text-sm text-charcoal/60">
                        No active subscriptions.
                      </p>
                    )}
                    {subscriptions
                      .filter(isActiveSubscription)
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="card flex flex-wrap items-center justify-between gap-2 p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-charcoal">
                              {sub.tenantName}
                            </p>
                            <p className="mt-0.5 text-xs text-charcoal/55">
                              {sub.planName} · ₹
                              {sub.pricePerMonth?.toLocaleString('en-IN')}/month
                            </p>
                            {sub.amountPaid ? (
                              <p className="mt-0.5 text-xs text-charcoal/55">
                                Paid {formatRupees(sub.amountPaid)}
                                {sub.paidOn ? ` on ${sub.paidOn}` : ''}
                                {sub.paymentId ? ` · ${sub.paymentId}` : ''}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status="active" />
                            <span className="text-xs text-charcoal/55">
                              {sub.cancelAtPeriodEnd
                                ? `cancels ${sub.endsOn}`
                                : sub.endsOn
                                  ? `until ${sub.endsOn}`
                                  : `since ${sub.startedOn}`}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                <section aria-labelledby="food-payments-heading">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2
                      id="food-payments-heading"
                      className="text-base font-semibold text-charcoal"
                    >
                      Food payments
                    </h2>
                    <span className="text-sm text-charcoal/55">
                      {foodPayments.filter((p) => p.status === 'paid').length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {foodPayments.length === 0 && (
                      <p className="text-sm text-charcoal/60">
                        No food plan payments yet.
                      </p>
                    )}
                    {foodPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="card flex flex-wrap items-center justify-between gap-2 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-charcoal">
                            {payment.tenantName}
                          </p>
                          <p className="mt-0.5 text-xs text-charcoal/55">
                            {payment.planName} · {payment.month}
                            {payment.status === 'paid' && payment.paidOn
                              ? ` · paid ${payment.paidOn}`
                              : ''}
                            {payment.paymentId ? ` · ${payment.paymentId}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums text-charcoal">
                            {formatRupees(payment.amount)}
                          </span>
                          <StatusBadge status={payment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
