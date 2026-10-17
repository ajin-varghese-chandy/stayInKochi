import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createBooking,
  createSubscription,
  deleteSubscription,
  getBookingsByUser,
  getSubscriptionByUser,
  updateBooking,
} from './foodBookingService'

const initialState = {
  subscription: null, // the plan this user is subscribed to (or null)
  bookings: [], // this user's meal bookings
  isLoading: false,
  error: null,
  isSaving: false,
  saveError: null,
}

// Tenant: load their current food plan subscription and meal bookings.
export const fetchMyFoodBookings = createAsyncThunk(
  'foodBookings/fetchMyFoodBookings',
  async (tenantUid, { rejectWithValue }) => {
    try {
      const [subscriptions, bookings] = await Promise.all([
        getSubscriptionByUser(tenantUid),
        getBookingsByUser(tenantUid),
      ])
      return { subscription: subscriptions[0] ?? null, bookings }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: subscribe to a food plan.
export const subscribeToFoodPlan = createAsyncThunk(
  'foodBookings/subscribeToFoodPlan',
  async (subscription, { rejectWithValue }) => {
    try {
      return await createSubscription({
        ...subscription,
        status: 'active',
        startedOn: new Date().toISOString().slice(0, 10),
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: cancel their food plan subscription.
export const cancelFoodSubscription = createAsyncThunk(
  'foodBookings/cancelFoodSubscription',
  async (subscriptionId, { rejectWithValue }) => {
    try {
      await deleteSubscription(subscriptionId)
      return subscriptionId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: book an individual meal for a date.
export const bookMeal = createAsyncThunk(
  'foodBookings/bookMeal',
  async (booking, { rejectWithValue }) => {
    try {
      return await createBooking({
        ...booking,
        status: 'booked',
        createdAt: new Date().toISOString().slice(0, 10),
      })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: cancel a meal booking.
export const cancelMealBooking = createAsyncThunk(
  'foodBookings/cancelMealBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await updateBooking(bookingId, { status: 'cancelled' })
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
        state.bookings = action.payload.bookings
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
        state.subscription = action.payload
      })
      .addCase(subscribeToFoodPlan.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(cancelFoodSubscription.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(cancelFoodSubscription.fulfilled, (state) => {
        state.isSaving = false
        state.subscription = null
      })
      .addCase(cancelFoodSubscription.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(bookMeal.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(bookMeal.fulfilled, (state, action) => {
        state.isSaving = false
        state.bookings.unshift(action.payload)
      })
      .addCase(bookMeal.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(cancelMealBooking.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(cancelMealBooking.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.bookings.findIndex(
          (booking) => booking.id === action.payload.id,
        )
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
      })
      .addCase(cancelMealBooking.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

export const { clearBookingSaveFeedback } = foodBookingSlice.actions

// Selectors
export const selectFoodSubscription = (state) => state.foodBookings.subscription
export const selectMyMealBookings = (state) => state.foodBookings.bookings
export const selectBookingsLoading = (state) => state.foodBookings.isLoading
export const selectBookingsError = (state) => state.foodBookings.error
export const selectBookingSaving = (state) => state.foodBookings.isSaving
export const selectBookingSaveError = (state) => state.foodBookings.saveError

export default foodBookingSlice.reducer
