import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import { createTenant, getTenantsByUser } from '../tenants/tenantService'
import {
  createStayRequest,
  getStayRequests,
  getStayRequestsByUser,
  getStayRequestsForHostel,
  updateStayRequest,
} from './stayRequestService'

const today = () => new Date().toISOString().slice(0, 10)

const initialState = {
  items: [], // requests for the current view (owner: all, tenant: mine)
  isLoading: false, // list loading
  error: null, // list load error
  isSaving: false, // submit/approve/reject in progress
  saveError: null, // submit/approve/reject error
  saveSuccess: null, // success message after submitting a request
  decidingRequestId: null, // which request is being approved/rejected
}

// Owner: load every stay request.
export const fetchAllStayRequests = createAsyncThunk(
  'stayRequests/fetchAllStayRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await getStayRequests()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: load this user's own stay requests.
export const fetchMyStayRequests = createAsyncThunk(
  'stayRequests/fetchMyStayRequests',
  async (tenantUid, { rejectWithValue }) => {
    try {
      return await getStayRequestsByUser(tenantUid)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: send a new request, unless one is already pending/approved here.
export const submitStayRequest = createAsyncThunk(
  'stayRequests/submitStayRequest',
  async (stayRequest, { rejectWithValue }) => {
    try {
      // An active tenant moves hostel through the paid switch flow instead.
      const tenancies = await getTenantsByUser(stayRequest.tenantUid)
      if (tenancies.length > 0) {
        return rejectWithValue(
          `You are already an active tenant at ${tenancies[0].hostelName}. Use the switch hostel flow to move.`,
        )
      }

      const existing = await getStayRequestsForHostel(
        stayRequest.hostelId,
        stayRequest.tenantUid,
      )
      const alreadyActive = existing.some(
        (request) =>
          request.status === 'pending' || request.status === 'approved',
      )

      if (alreadyActive) {
        return rejectWithValue('You already have a stay request for this hostel.')
      }

      const created = await createStayRequest(stayRequest)

      // Let the owner know a new request is waiting for them.
      await notify(
        OWNER_INBOX,
        `${created.tenantName} requested a stay at ${created.hostelName}.`,
      )

      return created
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: approve a request. This also activates the applicant as a tenant.
export const approveStayRequest = createAsyncThunk(
  'stayRequests/approveStayRequest',
  async (stayRequest, { rejectWithValue }) => {
    try {
      // Activate first, approve second. If activation fails the request stays
      // pending, so the Approve button is still there to retry — the other
      // order could approve a request whose tenant record never got created.
      const existingTenants = await getTenantsByUser(stayRequest.tenantUid)
      const activeElsewhere = existingTenants.find(
        (tenant) => String(tenant.hostelId) !== String(stayRequest.hostelId),
      )

      // Already living somewhere else: a stay request cannot move them, so
      // point the owner at the switch flow instead of creating a contradiction.
      if (activeElsewhere) {
        return rejectWithValue(
          `${stayRequest.tenantName} is already an active tenant at ${activeElsewhere.hostelName}. Ask them to use the switch hostel flow instead.`,
        )
      }

      if (existingTenants.length === 0) {
        await createTenant({
          uid: stayRequest.tenantUid,
          name: stayRequest.tenantName,
          email: stayRequest.tenantEmail,
          phone: stayRequest.phone ?? '',
          dateOfBirth: stayRequest.dateOfBirth ?? '',
          hostelId: stayRequest.hostelId,
          hostelName: stayRequest.hostelName,
          roomId: null, // assigned in the room & bed management phase
          bedId: null,
          rentStatus: 'unpaid',
          joinedOn: today(),
          documents: stayRequest.documents ?? [],
        })
      }

      const updated = await updateStayRequest(stayRequest.id, {
        status: 'approved',
        decidedOn: today(),
      })

      await notify(
        stayRequest.tenantUid,
        `Your stay request for ${stayRequest.hostelName} was approved.`,
      )

      return updated
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: reject a request.
export const rejectStayRequest = createAsyncThunk(
  'stayRequests/rejectStayRequest',
  async (stayRequest, { rejectWithValue }) => {
    try {
      const updated = await updateStayRequest(stayRequest.id, {
        status: 'rejected',
        decidedOn: today(),
      })

      await notify(
        stayRequest.tenantUid,
        `Your stay request for ${stayRequest.hostelName} was rejected.`,
      )

      return updated
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const stayRequestSlice = createSlice({
  name: 'stayRequests',
  initialState,
  reducers: {
    clearSaveFeedback(state) {
      state.saveError = null
      state.saveSuccess = null
    },
  },
  extraReducers: (builder) => {
    builder
      // List loading (owner + tenant views)
      .addCase(fetchAllStayRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllStayRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchAllStayRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchMyStayRequests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyStayRequests.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMyStayRequests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Submitting a new request
      .addCase(submitStayRequest.pending, (state) => {
        state.isSaving = true
        state.saveError = null
        state.saveSuccess = null
      })
      .addCase(submitStayRequest.fulfilled, (state, action) => {
        state.isSaving = false
        state.items.unshift(action.payload)
        state.saveSuccess =
          'Your stay request has been sent to the owner for approval.'
      })
      .addCase(submitStayRequest.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Approve / reject
      .addCase(approveStayRequest.pending, (state, action) => {
        state.isSaving = true
        state.saveError = null
        state.decidingRequestId = action.meta.arg.id
      })
      .addCase(approveStayRequest.fulfilled, (state, action) => {
        state.isSaving = false
        state.decidingRequestId = null
        replaceRequest(state.items, action.payload)
      })
      .addCase(approveStayRequest.rejected, (state, action) => {
        state.isSaving = false
        state.decidingRequestId = null
        state.saveError = action.payload
      })
      .addCase(rejectStayRequest.pending, (state, action) => {
        state.isSaving = true
        state.saveError = null
        state.decidingRequestId = action.meta.arg.id
      })
      .addCase(rejectStayRequest.fulfilled, (state, action) => {
        state.isSaving = false
        state.decidingRequestId = null
        replaceRequest(state.items, action.payload)
      })
      .addCase(rejectStayRequest.rejected, (state, action) => {
        state.isSaving = false
        state.decidingRequestId = null
        state.saveError = action.payload
      })
  },
})

// Swap the updated request into the list after a decision.
function replaceRequest(items, updatedRequest) {
  const index = items.findIndex((request) => request.id === updatedRequest.id)
  if (index !== -1) {
    items[index] = updatedRequest
  }
}

export const { clearSaveFeedback } = stayRequestSlice.actions

// Selectors
export const selectStayRequests = (state) => state.stayRequests.items
export const selectStayRequestsLoading = (state) => state.stayRequests.isLoading
export const selectStayRequestsError = (state) => state.stayRequests.error
export const selectIsSaving = (state) => state.stayRequests.isSaving
export const selectSaveError = (state) => state.stayRequests.saveError
export const selectSaveSuccess = (state) => state.stayRequests.saveSuccess
export const selectDecidingRequestId = (state) =>
  state.stayRequests.decidingRequestId

export default stayRequestSlice.reducer
