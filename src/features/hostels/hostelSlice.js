import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { deleteBooking, getBookingsByHostel, getSubscriptionsByHostel, deleteSubscription } from '../food/foodBookingService'
import { deleteFoodPlan, getFoodPlansByHostel } from '../food/foodPlanService'
import { deleteMeal, getMealsByHostel } from '../food/mealService'
import { deleteMaintenanceRequest, getMaintenanceRequestsByHostel } from '../maintenance/maintenanceService'
import { deleteBed, getBedsByHostel } from '../rooms/bedService'
import { deleteRoom, getRoomsByHostel } from '../rooms/roomService'
import { deleteStayRequest, getStayRequestsByHostel } from '../stayRequests/stayRequestService'
import { getTenantsByHostel } from '../tenants/tenantService'
import {
  createHostel as createHostelApi,
  deleteHostel as deleteHostelApi,
  getHostel,
  getHostels,
  updateHostel as updateHostelApi,
} from './hostelService'

const initialState = {
  items: [], // hostels for the browse list
  selected: null, // the hostel currently being viewed
  isLoading: false, // list/detail loading
  error: null, // list/detail load error
  isSaving: false, // owner create/edit/delete in progress
  saveError: null, // owner create/edit/delete error
}

export const fetchHostels = createAsyncThunk(
  'hostels/fetchHostels',
  async (_, { rejectWithValue }) => {
    try {
      return await getHostels()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchHostelById = createAsyncThunk(
  'hostels/fetchHostelById',
  async (hostelId, { rejectWithValue }) => {
    try {
      return await getHostel(hostelId)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: add a hostel.
export const createHostel = createAsyncThunk(
  'hostels/createHostel',
  async (hostel, { rejectWithValue }) => {
    try {
      return await createHostelApi(hostel)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: edit a hostel. Payload: { hostelId, updates }.
export const updateHostel = createAsyncThunk(
  'hostels/updateHostel',
  async ({ hostelId, updates }, { rejectWithValue }) => {
    try {
      return await updateHostelApi(hostelId, updates)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Delete every record in one collection that belongs to this hostel, ignoring
// individual failures so one stuck row cannot block the whole cascade.
async function deleteAllForHostel(fetchRows, deleteRow) {
  const rows = await fetchRows()
  await Promise.allSettled(rows.map((row) => deleteRow(row.id)))
}

// Owner: remove a hostel. Refuses while anyone still lives there; otherwise
// clears out everything the hostel owned (rooms, beds, requests, food, upkeep)
// so no orphaned rows are left behind. Resolves with the removed id.
export const deleteHostel = createAsyncThunk(
  'hostels/deleteHostel',
  async (hostelId, { rejectWithValue }) => {
    try {
      // A tenant without a hostel would be stranded, so make the owner
      // check them out from the tenants screen first.
      const tenants = await getTenantsByHostel(hostelId)
      if (tenants.length > 0) {
        return rejectWithValue(
          `${tenants.length} active tenant(s) still live here. Check them out from the Tenants screen first.`,
        )
      }

      await deleteAllForHostel(
        () => getBedsByHostel(hostelId),
        deleteBed,
      )
      await deleteAllForHostel(
        () => getRoomsByHostel(hostelId),
        deleteRoom,
      )
      await deleteAllForHostel(
        () => getStayRequestsByHostel(hostelId),
        deleteStayRequest,
      )
      await deleteAllForHostel(
        () => getMaintenanceRequestsByHostel(hostelId),
        deleteMaintenanceRequest,
      )
      await deleteAllForHostel(
        () => getBookingsByHostel(hostelId),
        deleteBooking,
      )

      // Food plans own their subscriptions, so clear those before the plans.
      const plans = await getFoodPlansByHostel(hostelId)
      await Promise.allSettled(
        (await getSubscriptionsByHostel(hostelId)).map((subscription) =>
          deleteSubscription(subscription.id),
        ),
      )
      await Promise.allSettled(
        (await getMealsByHostel(hostelId)).map((meal) => deleteMeal(meal.id)),
      )
      await Promise.allSettled(
        plans.map((plan) => deleteFoodPlan(plan.id)),
      )

      await deleteHostelApi(hostelId)
      return hostelId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const hostelSlice = createSlice({
  name: 'hostels',
  initialState,
  reducers: {
    // Forget the previously viewed hostel (used when leaving the detail page).
    clearSelectedHostel(state) {
      state.selected = null
    },
    clearHostelSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Loading the browse list
      .addCase(fetchHostels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Loading one hostel
      .addCase(fetchHostelById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHostelById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selected = action.payload
      })
      .addCase(fetchHostelById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Owner creating a hostel
      .addCase(createHostel.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(createHostel.fulfilled, (state, action) => {
        state.isSaving = false
        state.items.unshift(action.payload)
      })
      .addCase(createHostel.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Owner editing a hostel
      .addCase(updateHostel.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(updateHostel.fulfilled, (state, action) => {
        state.isSaving = false
        replaceInList(state.items, action.payload)
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(updateHostel.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Owner deleting a hostel
      .addCase(deleteHostel.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(deleteHostel.fulfilled, (state, action) => {
        state.isSaving = false
        state.items = state.items.filter((hostel) => hostel.id !== action.payload)
        if (state.selected?.id === action.payload) {
          state.selected = null
        }
      })
      .addCase(deleteHostel.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

// Swap the updated record into a list (by id).
function replaceInList(items, updated) {
  const index = items.findIndex((item) => item.id === updated.id)
  if (index !== -1) {
    items[index] = updated
  }
}

export const { clearSelectedHostel, clearHostelSaveFeedback } =
  hostelSlice.actions

// Selectors used by the hostel list, detail page, and owner management.
export const selectHostels = (state) => state.hostels.items
export const selectSelectedHostel = (state) => state.hostels.selected
export const selectHostelsLoading = (state) => state.hostels.isLoading
export const selectHostelsError = (state) => state.hostels.error
export const selectHostelsSaving = (state) => state.hostels.isSaving
export const selectHostelsSaveError = (state) => state.hostels.saveError

export default hostelSlice.reducer
