import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import TenantNav from '../../components/layout/TenantNav'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import MealBookingCard from '../../features/food/components/MealBookingCard'
import SubscriptionCard from '../../features/food/components/SubscriptionCard'
import {
  bookMeal,
  cancelMealBooking,
  cancelFoodSubscription,
  fetchMyFoodBookings,
  selectBookingsError,
  selectBookingsLoading,
  selectBookingSaveError,
  selectBookingSaving,
  selectFoodSubscription,
  selectMyMealBookings,
  subscribeToFoodPlan,
} from '../../features/food/foodBookingSlice'
import {
  fetchFoodDataByHostel,
  selectFoodError,
  selectFoodLoading,
  selectFoodPlans,
  selectMeals,
} from '../../features/food/foodPlanSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'

// Tenant screen for viewing food plans, subscribing, and booking meals.
export default function TenantFoodPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const plans = useSelector(selectFoodPlans)
  const meals = useSelector(selectMeals)
  const foodLoading = useSelector(selectFoodLoading)
  const foodError = useSelector(selectFoodError)

  const subscription = useSelector(selectFoodSubscription)
  const bookings = useSelector(selectMyMealBookings)
  const bookingsLoading = useSelector(selectBookingsLoading)
  const bookingsError = useSelector(selectBookingsError)
  const isSaving = useSelector(selectBookingSaving)
  const bookingSaveError = useSelector(selectBookingSaveError)

  // The user's active tenancy tells us which hostel's food they can see.
  const [tenancy, setTenancy] = useState(null)
  const [tenancyLoading, setTenancyLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    let cancelled = false
    dispatch(fetchMyFoodBookings(user.uid))

    getTenantsByUser(user.uid)
      .then((tenants) => {
        if (cancelled) return
        const activeTenancy = tenants[0] ?? null
        setTenancy(activeTenancy)
        setTenancyLoading(false)
        if (activeTenancy) {
          dispatch(fetchFoodDataByHostel(activeTenancy.hostelId))
        }
      })
      .catch(() => {
        if (cancelled) return
        setTenancy(null)
        setTenancyLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, user?.uid])

  function handleSubscribe(foodPlan) {
    // Safety: only one active plan at a time (the UI also hides this button).
    if (subscription) return

    dispatch(
      subscribeToFoodPlan({
        hostelId: tenancy.hostelId,
        foodPlanId: foodPlan.id,
        planName: foodPlan.name,
        pricePerMonth: foodPlan.pricePerMonth,
        tenantUid: user.uid,
        tenantName: user.displayName,
      }),
    )
  }

  function handleBook(meal, date) {
    dispatch(
      bookMeal({
        hostelId: tenancy.hostelId,
        mealId: meal.id,
        mealName: meal.name,
        price: meal.price,
        date,
        tenantUid: user.uid,
        tenantName: user.displayName,
      }),
    )
  }

  if (tenancyLoading) {
    return <Spinner label="Checking your tenancy..." />
  }

  if (!tenancy) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Food</h1>
        <div className="mt-6">
          <TenantNav />
        </div>
        <p className="mt-6 text-slate-600">
          Only active tenants can view food plans and book meals.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Food</h1>
      <p className="mt-1 text-slate-600">{tenancy.hostelName}</p>

      <div className="mt-6">
        <TenantNav />
      </div>

      {foodLoading && <Spinner label="Loading food options..." />}
      {foodError && (
        <p className="mt-6 text-red-600">Could not load food data: {foodError}</p>
      )}
      {bookingSaveError && <p className="mt-6 text-red-600">{bookingSaveError}</p>}

      {/* Monthly food plans */}
      {!foodLoading && !foodError && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Monthly food plans
          </h2>

          {plans.length === 0 && (
            <p className="mt-3 text-slate-600">
              No food plans offered here yet.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {plans.map((foodPlan) => (
              <SubscriptionCard
                key={foodPlan.id}
                foodPlan={foodPlan}
                isActive={subscription?.foodPlanId === foodPlan.id}
                hasActiveSubscription={Boolean(subscription)}
                isSaving={isSaving}
                onSubscribe={() => handleSubscribe(foodPlan)}
                onUnsubscribe={() =>
                  dispatch(cancelFoodSubscription(subscription.id))
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Individual meal bookings */}
      {!foodLoading && !foodError && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">
            Book an individual meal
          </h2>

          {meals.length === 0 && (
            <p className="mt-3 text-slate-600">
              No individual meals offered here yet.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {meals.map((meal) => (
              <MealBookingCard
                key={meal.id}
                meal={meal}
                isSaving={isSaving}
                onBook={handleBook}
              />
            ))}
          </div>
        </div>
      )}

      {/* My bookings */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">
          My meal bookings
        </h2>

        {bookingsLoading && <Spinner label="Loading your bookings..." />}
        {bookingsError && (
          <p className="mt-3 text-red-600">
            Could not load your bookings: {bookingsError}
          </p>
        )}

        {!bookingsLoading && !bookingsError && bookings.length === 0 && (
          <p className="mt-3 text-slate-600">
            You have not booked any meals yet.
          </p>
        )}

        <div className="mt-4 space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {booking.mealName} · ₹{booking.price}
                </p>
                <p className="text-sm text-slate-500">Date: {booking.date}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    booking.status === 'booked'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {booking.status}
                </span>

                {booking.status === 'booked' && (
                  <button
                    type="button"
                    onClick={() => dispatch(cancelMealBooking(booking.id))}
                    disabled={isSaving}
                    className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
