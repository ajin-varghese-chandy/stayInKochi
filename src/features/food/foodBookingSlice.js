import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { openCheckout } from '../../services/paymentGateway'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import {
  createFoodPayment,
  createSubscription,
  getFoodPaymentsByUser,
  getSubscriptionByUser,
  updateFoodPayment,
  updateSubscription,
} from './foodBookingService'

// "2026-10" -> "October 2026" for payment descriptions.
function monthLabel(month) {
  const date = new Date(`${month}-01T00:00:00`)
  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

const today = () => new Date().toISOString().slice(0, 10)

// A plan is paid for one month. The end date is the same day next month
// (clamped to the last day when that month is shorter, e.g. Jan 31 -> Feb 28).
function addOneMonth(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + 1)

  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))

  return date.toISOString().slice(0, 10)
}

const initialState = {
  subscription: null, // the plan this user is subscribed to (or null)
  payments: [], // this user's food plan payments
  isLoading: false,
  error: null,
  isSaving: false,
  saveError: null,
}

// Tenant: load their current food plan subscription and payments.
export const fetchMyFoodBookings = createAsyncThunk(
  'foodBookings/fetchMyFoodBookings',
  async (tenantUid, { rejectWithValue }) => {
    try {
      const [subscriptions, payments] = await Promise.all([
        getSubscriptionByUser(tenantUid),
        getFoodPaymentsByUser(tenantUid),
      ])

      // The most recent active plan is "my plan".
      let subscription =
        subscriptions
          .filter((item) => item.status === 'active')
          .sort((a, b) =>
            String(b.startedOn ?? '').localeCompare(String(a.startedOn ?? '')),
          )[0] ?? null

      // Older records predate the one-month term; derive their end date.
      if (subscription && !subscription.endsOn && subscription.startedOn) {
        subscription = await updateSubscription(subscription.id, {
          endsOn: addOneMonth(subscription.startedOn),
        })
      }

      // The paid month has finished: close the plan automatically so the
      // tenant can pick a new one (or renew).
      if (subscription?.endsOn && subscription.endsOn < today()) {
        await updateSubscription(subscription.id, {
          status: subscription.cancelAtPeriodEnd ? 'cancelled' : 'expired',
          endedOn: subscription.endsOn,
        })
        subscription = null
      }

      return {
        subscription,
        payments: payments.sort((a, b) =>
          String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
        ),
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: pay for a food plan, then activate the subscription.
//   1. record a pending food payment
//   2. open the payment sheet
//   3. mark it paid and create the subscription on success
//   4. mark it failed/cancelled otherwise
export const subscribeToFoodPlan = createAsyncThunk(
  'foodBookings/subscribeToFoodPlan',
  async (subscription, { rejectWithValue }) => {
    try {
      const amount = Number(subscription.pricePerMonth)

      // Never open a ₹0 checkout for a plan the owner left unpriced.
      if (!Number.isFinite(amount) || amount <= 0) {
        return rejectWithValue(
          'This plan has no price set. Ask the owner to update it first.',
        )
      }

      const month = new Date().toISOString().slice(0, 7)
      const todayStr = today()

      const pending = await createFoodPayment({
        hostelId: subscription.hostelId,
        hostelName: subscription.hostelName,
        tenantUid: subscription.tenantUid,
        tenantName: subscription.tenantName,
        foodPlanId: subscription.foodPlanId,
        planName: subscription.planName,
        amount,
        month,
        status: 'pending',
        paymentId: '',
        paidOn: '',
        createdAt: todayStr,
      })

      let response
      try {
        response = await openCheckout({
          amountInRupees: amount,
          description: `${subscription.planName} · ${monthLabel(month)}`,
          payer: {
            name: subscription.tenantName,
            email: subscription.tenantEmail,
          },
        })
      } catch (error) {
        await updateFoodPayment(pending.id, { status: 'failed' })
        return rejectWithValue(error.message)
      }

      if (!response) {
        await updateFoodPayment(pending.id, { status: 'cancelled' })
        return rejectWithValue('Payment was cancelled.')
      }

      const paid = await updateFoodPayment(pending.id, {
        status: 'paid',
        paymentId: response.paymentId ?? '',
        paidOn: todayStr,
      })

      const created = await createSubscription({
        ...subscription,
        status: 'active',
        startedOn: todayStr,
        endsOn: addOneMonth(todayStr),
        cancelAtPeriodEnd: false,
        billingMonth: month,
        amountPaid: amount,
        foodPaymentId: paid.id,
        paymentId: paid.paymentId,
        paidOn: todayStr,
      })

      await notify(
        OWNER_INBOX,
        `${subscription.tenantName} paid ₹${amount.toLocaleString('en-IN')} for the ${subscription.planName} food plan.`,
      )

      return { subscription: created, payment: paid }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: stop a plan, but only once the paid month has run its course.
// Cancelling mid-month schedules the stop for the term end; the plan stays
// active until then so the tenant keeps the meals they paid for.
export const cancelFoodSubscription = createAsyncThunk(
  'foodBookings/cancelFoodSubscription',
  async (subscription, { rejectWithValue }) => {
    try {
      if (!subscription?.id) {
        return rejectWithValue(
          'Your plan could not be found. Reload the page and try again.',
        )
      }

      const todayStr = today()

      // The term is already over: close the record out now.
      if (!subscription.endsOn || subscription.endsOn < todayStr) {
        await updateSubscription(subscription.id, {
          status: subscription.cancelAtPeriodEnd ? 'cancelled' : 'expired',
          endedOn: subscription.endsOn ?? todayStr,
        })
        return null
      }

      return await updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true,
        cancelRequestedOn: todayStr,
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const foodBookingSlice = createSlice({
  name: 'foodBookings',
  initialState,
  reducers: {
    clearBookingSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFoodBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyFoodBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.subscription = action.payload.subscription
        state.payments = action.payload.payments
      })
      .addCase(fetchMyFoodBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(subscribeToFoodPlan.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(subscribeToFoodPlan.fulfilled, (state, action) => {
        state.isSaving = false
        state.subscription = action.payload.subscription
        state.payments.unshift(action.payload.payment)
      })
      .addCase(subscribeToFoodPlan.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(cancelFoodSubscription.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(cancelFoodSubscription.fulfilled, (state, action) => {
        state.isSaving = false
        state.subscription = action.payload
      })
      .addCase(cancelFoodSubscription.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

export const { clearBookingSaveFeedback } = foodBookingSlice.actions

// Selectors
export const selectFoodSubscription = (state) => state.foodBookings.subscription
export const selectMyFoodPayments = (state) => state.foodBookings.payments
export const selectBookingSaving = (state) => state.foodBookings.isSaving
export const selectBookingSaveError = (state) => state.foodBookings.saveError

export default foodBookingSlice.reducer
