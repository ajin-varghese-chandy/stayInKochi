import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import { updateBed } from '../rooms/bedService'
import { deleteTenant } from '../tenants/tenantService'
import {
  createVacateRequest,
  getAllVacateRequests,
  getVacateRequestsByUser,
  updateVacateRequest,
} from './vacateService'

// Minimum notice a tenant must give before their vacate date.
export const VACATE_NOTICE_DAYS = 5

// A tenancy is still live while a request is waiting for or has received the
// owner's approval. Once it is completed, rejected, or cancelled it is history.
const ACTIVE_STATUSES = ['pending', 'approved']

// Local-time ISO date (YYYY-MM-DD). Using local date parts keeps the notice
// calculation aligned with the date the tenant picks in the date input.
function pad(value) {
  return String(value).padStart(2, '0')
}

export function todayISO(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return todayISO(date)
}

// The first date a tenant may vacate if they give notice today.
export function earliestVacateDate() {
  return addDays(todayISO(), VACATE_NOTICE_DAYS)
}

const initialState = {
  items: [], // vacate requests for the current view (tenant: mine, owner: all)
  isLoading: false,
  error: null,
  isSaving: false, // submitting / approving / checking out in progress
  saveError: null,
}

// Tenant: load this user's vacate requests.
export const fetchMyVacates = createAsyncThunk(
  'vacates/fetchMyVacates',
  async (tenantUid, { rejectWithValue }) => {
    try {
      return await getVacateRequestsByUser(tenantUid)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: load every vacate request.
export const fetchAllVacates = createAsyncThunk(
  'vacates/fetchAllVacates',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllVacateRequests()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: lodge a vacate request. The chosen date must honour the notice
// period, and only one request can be active at a time.
export const requestVacate = createAsyncThunk(
  'vacates/requestVacate',
  async ({ tenancy, vacateOn, reason }, { rejectWithValue }) => {
    try {
      if (!tenancy?.id || !tenancy?.uid) {
        return rejectWithValue(
          'Your tenancy could not be found. Reload the page and try again.',
        )
      }

      if (!vacateOn) {
        return rejectWithValue('Choose the date you will vacate.')
      }

      const earliest = earliestVacateDate()
      if (vacateOn < earliest) {
        return rejectWithValue(
          `Please give at least ${VACATE_NOTICE_DAYS} days' notice. The earliest you can vacate is ${earliest}.`,
        )
      }

      const existing = await getVacateRequestsByUser(tenancy.uid)
      if (existing.some((item) => ACTIVE_STATUSES.includes(item.status))) {
        return rejectWithValue(
          'You already have a vacate request awaiting action.',
        )
      }

      const created = await createVacateRequest({
        tenantId: tenancy.id,
        tenantUid: tenancy.uid,
        tenantName: tenancy.name,
        hostelId: tenancy.hostelId,
        hostelName: tenancy.hostelName,
        roomId: tenancy.roomId ?? null,
        roomNumber: tenancy.roomNumber ?? null,
        bedId: tenancy.bedId ?? null,
        bedNumber: tenancy.bedNumber ?? null,
        noticeDays: VACATE_NOTICE_DAYS,
        requestedOn: todayISO(),
        vacateOn,
        reason: (reason ?? '').trim(),
        status: 'pending',
        decidedOn: '',
      })

      const room = created.roomNumber
        ? `Room ${created.roomNumber}${created.bedNumber ? ` (Bed ${created.bedNumber})` : ''}`
        : 'their room'

      await notify(
        OWNER_INBOX,
        `${created.tenantName} requested to vacate ${room} at ${created.hostelName} on ${created.vacateOn} — ${VACATE_NOTICE_DAYS}-day notice.`,
      )

      return created
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: withdraw a request that has not been decided yet.
export const cancelVacate = createAsyncThunk(
  'vacates/cancelVacate',
  async (request, { rejectWithValue }) => {
    try {
      const cancelled = await updateVacateRequest(request.id, {
        status: 'cancelled',
        decidedOn: todayISO(),
      })

      await notify(
        OWNER_INBOX,
        `${request.tenantName} withdrew their request to vacate on ${request.vacateOn}.`,
      )

      return cancelled
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: accept the notice. The tenancy stays live until the tenant actually
// hands the room over, which is when the owner marks it vacated.
export const approveVacate = createAsyncThunk(
  'vacates/approveVacate',
  async (request, { rejectWithValue }) => {
    try {
      const approved = await updateVacateRequest(request.id, {
        status: 'approved',
        decidedOn: todayISO(),
      })

      await notify(
        request.tenantUid,
        `Your request to vacate ${request.hostelName} on ${request.vacateOn} was approved. Hand over your room and bed on that date.`,
      )

      return approved
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: decline the notice, so the tenancy continues.
export const rejectVacate = createAsyncThunk(
  'vacates/rejectVacate',
  async (request, { rejectWithValue }) => {
    try {
      const rejected = await updateVacateRequest(request.id, {
        status: 'rejected',
        decidedOn: todayISO(),
      })

      await notify(
        request.tenantUid,
        `Your request to vacate ${request.hostelName} on ${request.vacateOn} was declined.`,
      )

      return rejected
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: the tenant has handed the room over. Frees the bed and ends the
// tenancy, then closes the request.
export const completeVacate = createAsyncThunk(
  'vacates/completeVacate',
  async (request, { rejectWithValue }) => {
    try {
      if (request.bedId) {
        await updateBed(request.bedId, { status: 'available', tenantId: null })
      }

      if (request.tenantId) {
        try {
          await deleteTenant(request.tenantId)
        } catch (error) {
          // The owner may already have checked the tenant out from the
          // tenants list; that should not block closing the request.
          if (error.status !== 404) throw error
        }
      }

      const completed = await updateVacateRequest(request.id, {
        status: 'completed',
        completedOn: todayISO(),
      })

      await notify(
        request.tenantUid,
        `You have been checked out of ${request.hostelName}. Your bed is now free.`,
      )

      return completed
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const vacateSlice = createSlice({
  name: 'vacates',
  initialState,
  reducers: {
    clearVacateSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVacates.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyVacates.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMyVacates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchAllVacates.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllVacates.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchAllVacates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(requestVacate.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(requestVacate.fulfilled, (state, action) => {
        state.isSaving = false
        state.items.unshift(action.payload)
      })
      .addCase(requestVacate.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(cancelVacate.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(cancelVacate.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(cancelVacate.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(approveVacate.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(approveVacate.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(approveVacate.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(rejectVacate.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(rejectVacate.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(rejectVacate.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(completeVacate.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(completeVacate.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(completeVacate.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

// Swap the updated request into the list (by id).
function replaceRequest(items, updated) {
  const index = items.findIndex((item) => item.id === updated.id)
  if (index !== -1) {
    items[index] = updated
  }
}

export const { clearVacateSaveFeedback } = vacateSlice.actions

// Selectors
export const selectVacateRequests = (state) => state.vacates.items
export const selectVacatesLoading = (state) => state.vacates.isLoading
export const selectVacatesError = (state) => state.vacates.error
export const selectVacatesSaving = (state) => state.vacates.isSaving
export const selectVacatesSaveError = (state) => state.vacates.saveError

export default vacateSlice.reducer
