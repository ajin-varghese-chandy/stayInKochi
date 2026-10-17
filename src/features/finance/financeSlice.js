import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getFinanceData } from './financeService'

const initialState = {
  summary: null, // computed totals for the dashboard
  isLoading: false,
  error: null,
}

// Owner: load the money collections and total them up.
export const fetchFinancialSummary = createAsyncThunk(
  'finance/fetchFinancialSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { payments, subscriptions, mealBookings, switchRequests } =
        await getFinanceData()

      const sum = (items, amountOf) =>
        items.reduce((total, item) => total + (amountOf(item) ?? 0), 0)

      return {
        collected: sum(
          payments.filter((payment) => payment.status === 'paid'),
          (payment) => payment.amount,
        ),
        pending: sum(
          payments.filter((payment) => payment.status === 'pending'),
          (payment) => payment.amount,
        ),
        // Active plans bill monthly; booked meals are one-off charges.
        food: sum(
          subscriptions.filter((sub) => sub.status === 'active'),
          (sub) => sub.pricePerMonth,
        ) + sum(
          mealBookings.filter((booking) => booking.status === 'booked'),
          (booking) => booking.price,
        ),
        // Fees from switch requests that were actually paid for.
        switchFees: sum(
          switchRequests.filter(
            (request) =>
              request.status === 'pending' || request.status === 'approved',
          ),
          (request) => request.amount,
        ),
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.summary = action.payload
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

// Selectors
export const selectFinancialSummary = (state) => state.finance.summary
export const selectFinanceLoading = (state) => state.finance.isLoading
export const selectFinanceError = (state) => state.finance.error

export default financeSlice.reducer
