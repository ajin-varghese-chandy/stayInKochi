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
import MealCard from '../../features/food/components/MealCard'
import MealForm from '../../features/food/components/MealForm'
import {
  fetchAllFoodData,
  removeFoodPlan,
  removeMeal,
  selectFoodError,
  selectFoodPlans,
  selectFoodSaving,
  selectFoodLoading,
  selectMeals,
} from '../../features/food/foodPlanSlice'
import { getAllBookings, getAllSubscriptions } from '../../features/food/foodBookingService'
import { fetchHostels } from '../../features/hostels/hostelSlice'

const TABS = [
  { key: 'plans', label: 'Food plans' },
  { key: 'meals', label: 'Individual meals' },
  { key: 'activity', label: 'Activity' },
]

// Owner screen for managing food plans and individual meals.
export default function OwnerFoodPage() {
  const dispatch = useDispatch()
  const plans = useSelector(selectFoodPlans)
  const meals = useSelector(selectMeals)
  const isLoading = useSelector(selectFoodLoading)
  const error = useSelector(selectFoodError)
  const isSaving = useSelector(selectFoodSaving)

  // Form states: adding vs editing, for plans and meals separately.
  const [addingPlan, setAddingPlan] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [addingMeal, setAddingMeal] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)

  // Activity tab
  const [activeTab, setActiveTab] = useState('plans') // 'plans' | 'meals' | 'activity'
  const [subscriptions, setSubscriptions] = useState([])
  const [bookings, setBookings] = useState([])
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
    Promise.all([getAllSubscriptions(), getAllBookings()])
      .then(([subs, bks]) => {
        if (cancelled) return
        setSubscriptions(subs)
        setBookings(bks)
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

  function handleDeleteMeal(meal) {
    if (window.confirm(`Delete meal "${meal.name}"?`)) {
      dispatch(removeMeal(meal.id))
    }
  }

  const showPlanForm = addingPlan || editingPlan !== null
  const showMealForm = addingMeal || editingMeal !== null

  return (
    <section>
      <PageHeader
        eyebrow="Owner console"
        title="Food"
        description="Monthly plans, single meals, and current activity."
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

        {/* Individual meals tab */}
        {activeTab === 'meals' && !isLoading && !error && (
          <section aria-labelledby="meals-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="meals-heading" className="text-base font-semibold text-charcoal">
                Individual meals
              </h2>
              {!showMealForm && (
                <Button size="sm" onClick={() => setAddingMeal(true)}>
                  Add meal
                </Button>
              )}
            </div>

            <div className="mt-3 space-y-4">
              {showMealForm && (
                <div className="card p-5">
                  <MealForm
                    meal={editingMeal}
                    onDone={() => {
                      setAddingMeal(false)
                      setEditingMeal(null)
                    }}
                  />
                </div>
              )}

              {!showMealForm && meals.length === 0 && (
                <EmptyState
                  icon={UtensilsCrossed}
                  title="No individual meals yet"
                  hint="Add single meals tenants can book for a specific day."
                />
              )}

              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isSaving={isSaving}
                  onEdit={() => {
                    setAddingMeal(false)
                    setEditingMeal(meal)
                  }}
                  onDelete={() => handleDeleteMeal(meal)}
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
                      {subscriptions.filter((s) => s.status === 'active').length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {subscriptions.filter((s) => s.status === 'active').length === 0 && (
                      <p className="text-sm text-charcoal/60">
                        No active subscriptions.
                      </p>
                    )}
                    {subscriptions
                      .filter((s) => s.status === 'active')
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
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status="active" />
                            <span className="text-xs text-charcoal/55">
                              since {sub.startedOn}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                <section aria-labelledby="bookings-heading">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2
                      id="bookings-heading"
                      className="text-base font-semibold text-charcoal"
                    >
                      Meal bookings
                    </h2>
                    <span className="text-sm text-charcoal/55">
                      {bookings.length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {bookings.length === 0 && (
                      <p className="text-sm text-charcoal/60">
                        No meal bookings yet.
                      </p>
                    )}
                    {[...bookings]
                      .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
                      .map((bk) => (
                        <div
                          key={bk.id}
                          className="card flex flex-wrap items-center justify-between gap-2 p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-charcoal">
                              {bk.tenantName}
                            </p>
                            <p className="mt-0.5 text-xs text-charcoal/55">
                              {bk.mealName} · ₹{bk.price} · {bk.date}
                            </p>
                          </div>
                          <StatusBadge status={bk.status} />
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
