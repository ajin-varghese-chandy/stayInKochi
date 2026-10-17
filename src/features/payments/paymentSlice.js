import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { openRazorpayCheckout, verifyRazorpayPayment } from '../../services/razorpay'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import { updateTenant } from '../tenants/tenantService'
import {
  createPayment,
  getAllPayments,
  getPaymentsByUser,
  updatePayment,
} from './paymentService'

const initialState = {
  items: [], // payments for the current view (tenant: mine, owner: all)
  isLoading: false,
  error: null,
  isSaving: false, // a Razorpay payment is in progress
  saveError: null,
}

// Tenant: load this user's rent payments.
export const fetchMyPayments = createAsyncThunk(
  'payments/fetchMyPayments',
  async (tenantUid, { rejectWithValue }) => {
    try {
      return await getPaymentsByUser(tenantUid)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: load every rent payment.
export const fetchAllPayments = createAsyncThunk(
  'payments/fetchAllPayments',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllPayments()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: pay one month's rent through Razorpay.
//   1. record a pending payment
//   2. open the Razorpay checkout
//   3. mark it paid (and the tenant's rent paid) on success
//   4. mark it failed/cancelled otherwise
export const payRent = createAsyncThunk(
  'payments/payRent',
  async ({ tenant, month }, { rejectWithValue }) => {
    try {
      const amount = tenant.rentPerMonth ?? 0

      const payment = await createPayment({
        hostelId: tenant.hostelId,
        hostelName: tenant.hostelName,
        tenantId: tenant.id,
        tenantUid: tenant.uid,
        tenantName: tenant.name,
        amount,
        month,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
      })

      let response
      try {
        response = await openRazorpayCheckout({
          amountInRupees: amount,
          description: `Rent for ${month}`,
          prefill: { name: tenant.name, email: tenant.email },
        })
      } catch (error) {
        await updatePayment(payment.id, { status: 'failed' })
        return rejectWithValue(error.message)
      }

      if (!response) {
        await updatePayment(payment.id, { status: 'cancelled' })
        return rejectWithValue('Payment was cancelled.')
      }

      // Never trust the checkout callback alone: the server re-checks the
      // signature with RAZORPAY_KEY_SECRET before we record anything as paid.
      const verified = await verifyRazorpayPayment({
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      })

      if (!verified) {
        await updatePayment(payment.id, { status: 'failed' })
        return rejectWithValue('Payment could not be verified. Please contact support.')
      }

      const paid = await updatePayment(payment.id, {
        status: 'paid',
        razorpayPaymentId: response.razorpay_payment_id ?? '',
        paidOn: new Date().toISOString().slice(0, 10),
      })

      // Rent is settled for this tenant until the next month.
      await updateTenant(tenant.id, { rentStatus: 'paid' })

      await notify(
        OWNER_INBOX,
        `${tenant.name} paid ₹${amount.toLocaleString('en-IN')} rent for ${month}.`,
      )

      return paid
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchAllPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(payRent.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(payRent.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.items.findIndex(
          (payment) => payment.id === action.payload.id,
        )
        if (index === -1) {
          state.items.unshift(action.payload)
        } else {
          state.items[index] = action.payload
        }
      })
      .addCase(payRent.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

export const { clearPaymentSaveFeedback } = paymentSlice.actions

// Selectors
export const selectPayments = (state) => state.payments.items
export const selectPaymentsLoading = (state) => state.payments.isLoading
export const selectPaymentsError = (state) => state.payments.error
export const selectPaymentsSaving = (state) => state.payments.isSaving
export const selectPaymentsSaveError = (state) => state.payments.saveError

export default paymentSlice.reducer
