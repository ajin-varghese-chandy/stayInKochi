import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UtensilsCrossed } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/common/Spinner'
import { selectCurrentUser } from '../../features/auth/authSlice'
import SubscriptionCard from '../../features/food/components/SubscriptionCard'
import {
  cancelFoodSubscription,
  fetchMyFoodBookings,
  selectBookingSaveError,
  selectBookingSaving,
  selectFoodSubscription,
  selectMyFoodPayments,
  subscribeToFoodPlan,
} from '../../features/food/foodBookingSlice'
import {
  fetchFoodDataByHostel,
  selectFoodError,
  selectFoodLoading,
  selectFoodPlans,
} from '../../features/food/foodPlanSlice'
import { getTenantsByUser } from '../../features/tenants/tenantService'
import formatRupees from '../../utils/formatRupees'

// Tenant screen for viewing and subscribing to food plans.
export default function TenantFoodPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const plans = useSelector(selectFoodPlans)
  const foodLoading = useSelector(selectFoodLoading)
  const foodError = useSelector(selectFoodError)

  const subscription = useSelector(selectFoodSubscription)
  const foodPayments = useSelector(selectMyFoodPayments)
  const isSaving = useSelector(selectBookingSaving)
  const saveError = useSelector(selectBookingSaveError)

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
        hostelName: tenancy.hostelName,
        foodPlanId: foodPlan.id,
        planName: foodPlan.name,
        pricePerMonth: foodPlan.pricePerMonth,
        tenantUid: user.uid,
        tenantName: user.displayName,
        tenantEmail: user.email,
      }),
    ).then(() => {
      // Refresh so cancelled/failed attempts also show in the payment list.
      dispatch(fetchMyFoodBookings(user.uid))
    })
  }

  if (tenancyLoading) {
    return (
      <section>
        <PageHeader
          eyebrow="Tenant portal"
          title="Food"
          description="Monthly meal plans at your branch."
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
          description="Monthly meal plans at your branch."
        />
        <div className="mt-6">
          <EmptyState
            icon={UtensilsCrossed}
            title="Only active tenants can see food plans"
            hint="Join a branch to subscribe to a monthly meal plan."
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
        {saveError && <Alert tone="error">{saveError}</Alert>}

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
                  {subscription.endsOn && (
                    <p className="mt-0.5 text-xs text-charcoal/70">
                      {subscription.cancelAtPeriodEnd
                        ? `Cancels after ${subscription.endsOn}`
                        : `Runs until ${subscription.endsOn}`}
                    </p>
                  )}
                  {subscription.paymentId && (
                    <p className="mt-1 text-xs text-charcoal/55">
                      Paid
                      {subscription.amountPaid
                        ? ` ${formatRupees(subscription.amountPaid)}`
                        : ''}
                      {subscription.paidOn ? ` on ${subscription.paidOn}` : ''}
                      {` · UPI ref ${subscription.paymentId}`}
                    </p>
                  )}
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

        {/* Food plan payments */}
        {foodPayments.length > 0 && (
          <section aria-labelledby="food-payments-heading">
            <h2
              id="food-payments-heading"
              className="text-base font-semibold text-charcoal"
            >
              Food payments
            </h2>

            <div className="mt-3 space-y-2">
              {foodPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="card flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal">
                      {payment.planName}
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal/55">
                      {payment.month}
                      {payment.status === 'paid' && payment.paidOn
                        ? ` · paid ${payment.paidOn}`
                        : ` · created ${payment.createdAt ?? ''}`}
                      {payment.paymentId ? ` · ${payment.paymentId}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold tabular-nums text-forest">
                      {formatRupees(payment.amount)}
                    </span>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
                      subscription={subscription}
                      isActive={subscription?.foodPlanId === foodPlan.id}
                      hasActiveSubscription={Boolean(subscription)}
                      isSaving={isSaving}
                      onSubscribe={() => handleSubscribe(foodPlan)}
                      onUnsubscribe={() =>
                        dispatch(cancelFoodSubscription(subscription))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </section>
  )
}
