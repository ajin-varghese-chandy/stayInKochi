import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { uploadImage } from '../../services/cloudinary'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestsByUser,
  updateMaintenanceRequest,
} from './maintenanceService'

const initialState = {
  items: [],
  isLoading: false, // list loading
  error: null, // list load error
  isSaving: false, // submitting / status update in progress
  saveError: null, // submitting / status update error
}

// Owner: load every maintenance request.
export const fetchAllMaintenance = createAsyncThunk(
  'maintenance/fetchAllMaintenance',
  async (_, { rejectWithValue }) => {
    try {
      return await getMaintenanceRequests()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: load this user's own maintenance requests.
export const fetchMyMaintenance = createAsyncThunk(
  'maintenance/fetchMyMaintenance',
  async (tenantUid, { rejectWithValue }) => {
    try {
      return await getMaintenanceRequestsByUser(tenantUid)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: raise a request. The photo (if any) is uploaded to Cloudinary first.
export const submitMaintenanceRequest = createAsyncThunk(
  'maintenance/submitMaintenanceRequest',
  async ({ request, imageFile }, { rejectWithValue }) => {
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : ''

      const created = await createMaintenanceRequest({
        ...request,
        imageUrl,
        status: 'open',
        createdAt: new Date().toISOString(),
      })

      await notify(
        OWNER_INBOX,
        `${request.tenantName} reported: ${request.title}.`,
      )

      return created
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: change a request's status.
export const updateMaintenanceStatus = createAsyncThunk(
  'maintenance/updateMaintenanceStatus',
  async ({ requestId, status }, { getState, rejectWithValue }) => {
    try {
      const updated = await updateMaintenanceRequest(requestId, {
        status,
        updatedAt: new Date().toISOString(),
      })

      // Tell the tenant who raised it (found in the already-loaded list).
      const original = getState().maintenance.items.find(
        (item) => item.id === requestId,
      )
      if (original) {
        await notify(
          original.tenantUid,
          `Your maintenance request "${original.title}" is now ${status}.`,
        )
      }

      return updated
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    clearMaintenanceSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Loading lists
      .addCase(fetchAllMaintenance.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllMaintenance.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchAllMaintenance.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchMyMaintenance.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyMaintenance.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMyMaintenance.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Submitting a new request
      .addCase(submitMaintenanceRequest.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(submitMaintenanceRequest.fulfilled, (state, action) => {
        state.isSaving = false
        state.items.unshift(action.payload)
      })
      .addCase(submitMaintenanceRequest.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Owner updating status
      .addCase(updateMaintenanceStatus.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(updateMaintenanceStatus.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        )
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateMaintenanceStatus.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

export const { clearMaintenanceSaveFeedback } = maintenanceSlice.actions

// Selectors
export const selectMaintenanceRequests = (state) => state.maintenance.items
export const selectMaintenanceLoading = (state) => state.maintenance.isLoading
export const selectMaintenanceError = (state) => state.maintenance.error
export const selectMaintenanceSaving = (state) => state.maintenance.isSaving
export const selectMaintenanceSaveError = (state) => state.maintenance.saveError

export default maintenanceSlice.reducer
