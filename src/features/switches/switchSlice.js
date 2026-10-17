import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { openRazorpayCheckout, verifyRazorpayPayment } from '../../services/razorpay'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import { updateBed } from '../rooms/bedService'
import { getTenantsByUser, updateTenant } from '../tenants/tenantService'
import {
  createSwitchRequest,
  getAllSwitchRequests,
  getSwitchRequestsByUser,
  updateSwitchRequest,
} from './switchService'

// Flat fee a tenant pays to move from one hostel to another.
export const SWITCH_FEE_RUPEES = 500

const today = () => new Date().toISOString().slice(0, 10)

const initialState = {
  items: [], // switch requests for the current view (tenant: mine, owner: all)
  isLoading: false,
  error: null,
  isSaving: false, // payment / approve / reject in progress
  saveError: null,
}

// Tenant: load this user's switch requests.
export const fetchMySwitches = createAsyncThunk(
  'switches/fetchMySwitches',
  async (tenantUid, { rejectWithValue }) => {
    try {
      return await getSwitchRequestsByUser(tenantUid)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: load every switch request.
export const fetchAllSwitches = createAsyncThunk(
  'switches/fetchAllSwitches',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllSwitchRequests()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: pay the switching fee, then lodge the request for owner approval.
//   1. record the request as unpaid
//   2. open Razorpay
//   3. mark it pending (paid) on success, cancelled otherwise
export const requestHostelSwitch = createAsyncThunk(
  'switches/requestHostelSwitch',
  async ({ tenant, toHostel, amount }, { rejectWithValue }) => {
    try {
      const request = await createSwitchRequest({
        tenantId: tenant.id,
        tenantUid: tenant.uid,
        tenantName: tenant.name,
        fromHostelId: tenant.hostelId,
        fromHostelName: tenant.hostelName,
        toHostelId: toHostel.id,
        toHostelName: toHostel.name,
        amount,
        status: 'unpaid',
        razorpayPaymentId: '',
        createdAt: today(),
      })

      let response
      try {
        response = await openRazorpayCheckout({
          amountInRupees: amount,
          description: `Switch to ${toHostel.name}`,
          prefill: { name: tenant.name, email: tenant.email },
        })
      } catch (error) {
        await updateSwitchRequest(request.id, { status: 'cancelled' })
        return rejectWithValue(error.message)
      }

      if (!response) {
        await updateSwitchRequest(request.id, { status: 'cancelled' })
        return rejectWithValue('Payment was cancelled.')
      }

      // The server re-checks the signature with RAZORPAY_KEY_SECRET before the
      // fee is recorded as paid.
      const verified = await verifyRazorpayPayment({
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      })

      if (!verified) {
        await updateSwitchRequest(request.id, { status: 'cancelled' })
        return rejectWithValue('Payment could not be verified. Please contact support.')
      }

      const pending = await updateSwitchRequest(request.id, {
        status: 'pending',
        razorpayPaymentId: response.razorpay_payment_id ?? '',
        paidOn: today(),
      })

      await notify(
        OWNER_INBOX,
        `${tenant.name} paid the switch fee to move to ${toHostel.name}.`,
      )

      return pending
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: approve a paid switch. This frees the old bed and moves the tenant to
// the new hostel (a bed there is assigned afterwards from the rooms screen).
export const approveSwitch = createAsyncThunk(
  'switches/approveSwitch',
  async (switchRequest, { rejectWithValue }) => {
    try {
      const tenants = await getTenantsByUser(switchRequest.tenantUid)
      const tenant = tenants[0]

      if (tenant?.bedId) {
        await updateBed(tenant.bedId, { status: 'available', tenantId: null })
      }

      await updateTenant(tenant.id, {
        hostelId: switchRequest.toHostelId,
        hostelName: switchRequest.toHostelName,
        roomId: null,
        bedId: null,
        roomNumber: null,
        bedNumber: null,
        rentPerMonth: null,
        rentStatus: 'unpaid',
      })

      const approved = await updateSwitchRequest(switchRequest.id, {
        status: 'approved',
        decidedOn: today(),
      })

      await notify(
        switchRequest.tenantUid,
        `Your switch to ${switchRequest.toHostelName} was approved. Ask the owner to assign you a bed.`,
      )

      return approved
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: reject a switch request.
export const rejectSwitch = createAsyncThunk(
  'switches/rejectSwitch',
  async (switchRequest, { rejectWithValue }) => {
    try {
      const updated = await updateSwitchRequest(switchRequest.id, {
        status: 'rejected',
        decidedOn: today(),
      })

      await notify(
        switchRequest.tenantUid,
        `Your switch to ${switchRequest.toHostelName} was rejected.`,
      )

      return updated
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const switchSlice = createSlice({
  name: 'switches',
  initialState,
  reducers: {
    clearSwitchSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySwitches.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMySwitches.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMySwitches.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchAllSwitches.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllSwitches.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchAllSwitches.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(requestHostelSwitch.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(requestHostelSwitch.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        )
        if (index === -1) {
          state.items.unshift(action.payload)
        } else {
          state.items[index] = action.payload
        }
      })
      .addCase(requestHostelSwitch.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(approveSwitch.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(approveSwitch.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(approveSwitch.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(rejectSwitch.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(rejectSwitch.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(rejectSwitch.rejected, (state, action) => {
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

export const { clearSwitchSaveFeedback } = switchSlice.actions

// Selectors
export const selectSwitchRequests = (state) => state.switches.items
export const selectSwitchesLoading = (state) => state.switches.isLoading
export const selectSwitchesError = (state) => state.switches.error
export const selectSwitchesSaving = (state) => state.switches.isSaving
export const selectSwitchesSaveError = (state) => state.switches.saveError

export default switchSlice.reducer
