import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ClipboardList, UtensilsCrossed } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
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
import formatRupees from '../../utils/formatRupees'

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
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Food"
          description="Meal plans and single-meal bookings at your branch."
        />
        <div className="mt-6">
          <Spinner compact label="Checking your tenancy…" />
        </div>
      </section>
    )
  }

  if (!tenancy) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Food"
          description="Meal plans and single-meal bookings at your branch."
        />
        <div className="mt-6">
          <EmptyState
            icon={UtensilsCrossed}
            title="Only active tenants can see food plans"
            hint="Join a branch to subscribe to a monthly plan or book a single meal."
            action={
              <Button to="/hostels" variant="secondary">
                Browse branches
              </Button>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow="Tenant portal"
        title="Food"
        description={tenancy.hostelName}
      />

      <div className="mt-6 space-y-8">
        {foodLoading && <Spinner compact label="Loading food options…" />}
        {foodError && (
          <Alert tone="error">Could not load food data: {foodError}</Alert>
        )}
        {bookingSaveError && <Alert tone="error">{bookingSaveError}</Alert>}

        {/* Current subscription */}
        <section aria-labelledby="my-plan-heading">
          <h2
            id="my-plan-heading"
            className="text-base font-semibold text-charcoal"
          >
            My plan
          </h2>

          <div className="mt-3">
            {subscription ? (
              <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-charcoal">
                    {subscription.planName}
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-forest">
                    {formatRupees(subscription.pricePerMonth)}
                    <span className="ml-1 text-xs font-normal text-charcoal/70">
                      /month
                    </span>
                  </p>
                </div>

                <StatusBadge status={subscription.status ?? 'active'} />
              </div>
            ) : (
              <EmptyState
                icon={UtensilsCrossed}
                title="No food plan yet"
                hint="Subscribe to a monthly plan below and meals are taken care of."
              />
            )}
          </div>
        </section>

        {/* Monthly food plans */}
        {!foodLoading && !foodError && (
          <section aria-labelledby="food-plans-heading">
            <h2
              id="food-plans-heading"
              className="text-base font-semibold text-charcoal"
            >
              Meal plans at your branch
            </h2>

            <div className="mt-3">
              {plans.length === 0 ? (
                <EmptyState
                  icon={UtensilsCrossed}
                  title="No meal plans here yet"
                  hint="Your branch has not published monthly food plans."
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
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
              )}
            </div>
          </section>
        )}

        {/* Individual meal bookings */}
        {!foodLoading && !foodError && (
          <section aria-labelledby="single-meals-heading">
            <h2
              id="single-meals-heading"
              className="text-base font-semibold text-charcoal"
            >
              Book a single meal
            </h2>

            <div className="mt-3">
              {meals.length === 0 ? (
                <EmptyState
                  icon={UtensilsCrossed}
                  title="No single meals right now"
                  hint="Your branch has not listed individual meals today."
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {meals.map((meal) => (
                    <MealBookingCard
                      key={meal.id}
                      meal={meal}
                      isSaving={isSaving}
                      onBook={handleBook}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* My bookings */}
        <section aria-labelledby="my-bookings-heading">
          <h2
            id="my-bookings-heading"
            className="text-base font-semibold text-charcoal"
          >
            My bookings
          </h2>

          <div className="mt-3">
            {bookingsLoading && (
              <Spinner compact label="Loading your bookings…" />
            )}

            {bookingsError && (
              <Alert tone="error">
                Could not load your bookings: {bookingsError}
              </Alert>
            )}

            {!bookingsLoading && !bookingsError && bookings.length === 0 && (
              <EmptyState
                icon={ClipboardList}
                title="No bookings yet"
                hint="Book a single meal above and it will show up here."
              />
            )}

            {!bookingsLoading && !bookingsError && bookings.length > 0 && (
              <>
                {/* Stacked cards — the mobile view */}
                <div className="space-y-3 sm:hidden">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-charcoal">
                            {booking.mealName}
                          </p>
                          <p className="mt-0.5 text-xs text-charcoal/70">
                            {booking.date}
                          </p>
                        </div>

                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                        <p className="text-base font-semibold tabular-nums text-forest">
                          {formatRupees(booking.price)}
                        </p>

                        {booking.status === 'booked' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              dispatch(cancelMealBooking(booking.id))
                            }
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table — from sm up */}
                <div className="table-wrap card hidden sm:block">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Meal</th>
                        <th>Date</th>
                        <th className="align-right">Amount</th>
                        <th>Status</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="font-medium text-charcoal">
                            {booking.mealName}
                          </td>
                          <td>{booking.date}</td>
                          <td className="num align-right">
                            <span className="text-base font-semibold tabular-nums text-forest">
                              {formatRupees(booking.price)}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="align-right">
                            {booking.status === 'booked' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  dispatch(cancelMealBooking(booking.id))
                                }
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
