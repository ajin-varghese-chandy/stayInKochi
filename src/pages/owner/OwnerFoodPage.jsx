import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerNav from '../../components/layout/OwnerNav'
import Spinner from '../../components/common/Spinner'
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

  useEffect(() => {
    if (activeTab !== 'activity') return
    setActivityLoading(true)
    Promise.all([getAllSubscriptions(), getAllBookings()])
      .then(([subs, bks]) => {
        setSubscriptions(subs)
        setBookings(bks)
        setActivityLoading(false)
      })
      .catch((err) => {
        setActivityError(err.message)
        setActivityLoading(false)
      })
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
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Food management</h1>

      <div className="mt-6">
        <OwnerNav />
      </div>

      {/* Sub-tabs */}
      <div className="mt-8 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
        {[
          { key: 'plans', label: 'Food plans' },
          { key: 'meals', label: 'Individual meals' },
          { key: 'activity', label: 'Activity' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner label="Loading food data..." />}
      {error && <p className="mt-6 text-red-600">Could not load food data: {error}</p>}

      {/* Food plans tab */}
      {activeTab === 'plans' && !isLoading && !error && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Food plans</h2>
            {!showPlanForm && (
              <button
                type="button"
                onClick={() => setAddingPlan(true)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add food plan
              </button>
            )}
          </div>

          {showPlanForm && (
            <div className="mt-4">
              <FoodPlanForm
                foodPlan={editingPlan}
                onDone={() => {
                  setAddingPlan(false)
                  setEditingPlan(null)
                }}
              />
            </div>
          )}

          {plans.length === 0 && (
            <p className="mt-4 text-slate-600">No food plans yet.</p>
          )}

          <div className="mt-4 space-y-4">
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
        </div>
      )}

      {/* Individual meals tab */}
      {activeTab === 'meals' && !isLoading && !error && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Individual meals</h2>
            {!showMealForm && (
              <button
                type="button"
                onClick={() => setAddingMeal(true)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add meal
              </button>
            )}
          </div>

          {showMealForm && (
            <div className="mt-4">
              <MealForm
                meal={editingMeal}
                onDone={() => {
                  setAddingMeal(false)
                  setEditingMeal(null)
                }}
              />
            </div>
          )}

          {meals.length === 0 && (
            <p className="mt-4 text-slate-600">
              No individual meals yet.
            </p>
          )}

          <div className="mt-4 space-y-4">
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
        </div>
      )}

      {/* Activity tab */}
      {activeTab === 'activity' && (
        <div className="mt-6">
          {activityLoading && <Spinner label="Loading activity..." />}
          {activityError && (
            <p className="text-red-600">Could not load activity: {activityError}</p>
          )}

          {!activityLoading && !activityError && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900">
                  Active plan subscriptions
                  <span className="ml-2 text-base font-normal text-slate-500">
                    ({subscriptions.filter((s) => s.status === 'active').length})
                  </span>
                </h2>
                {subscriptions.filter((s) => s.status === 'active').length === 0 && (
                  <p className="mt-3 text-slate-600">No active subscriptions.</p>
                )}
                <div className="mt-3 space-y-2">
                  {subscriptions
                    .filter((s) => s.status === 'active')
                    .map((sub) => (
                      <div
                        key={sub.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{sub.tenantName}</p>
                          <p className="text-sm text-slate-500">
                            {sub.planName} · ₹{sub.pricePerMonth?.toLocaleString('en-IN')}/month
                          </p>
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active since {sub.startedOn}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Meal bookings
                  <span className="ml-2 text-base font-normal text-slate-500">
                    ({bookings.length})
                  </span>
                </h2>
                {bookings.length === 0 && (
                  <p className="mt-3 text-slate-600">No meal bookings yet.</p>
                )}
                <div className="mt-3 space-y-2">
                  {[...bookings]
                    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
                    .map((bk) => (
                      <div
                        key={bk.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{bk.tenantName}</p>
                          <p className="text-sm text-slate-500">
                            {bk.mealName} · ₹{bk.price} · {bk.date}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            bk.status === 'booked'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {bk.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
