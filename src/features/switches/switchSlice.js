import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { openCheckout } from '../../services/paymentGateway'
import { notify, OWNER_INBOX } from '../notifications/notificationService'
import { createPayment, getPaymentsByUser } from '../payments/paymentService'
import { getBedsByRoom, updateBed } from '../rooms/bedService'
import { getTenantsByUser, updateTenant } from '../tenants/tenantService'
import {
  createSwitchRequest,
  getAllSwitchRequests,
  getSwitchRequestsByUser,
  updateSwitchRequest,
} from './switchService'
import {
  applyRentCredit,
  computeSwitchSettlement,
  monthRangeLabel,
} from './switchSettlement'

// Flat fee a tenant pays to move from one hostel to another.
export const SWITCH_FEE_RUPEES = 500

const today = () => new Date().toISOString().slice(0, 10)

const formatMoney = (amount) =>
  `₹${Number(amount ?? 0).toLocaleString('en-IN')}`

// Statuses that mean the tenant already has a move in progress.
const ACTIVE_STATUSES = ['pending', 'approved']

const initialState = {
  items: [], // switch requests for the current view (tenant: mine, owner: all)
  isLoading: false,
  error: null,
  isSaving: false, // request / approve / pay / reject in progress
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

// Tenant: ask to move. This costs nothing yet — the owner first checks the
// destination and reserves a free bed before any money changes hands.
export const requestHostelSwitch = createAsyncThunk(
  'switches/requestHostelSwitch',
  async ({ tenant, toHostel }, { rejectWithValue }) => {
    try {
      if (!tenant?.id || !tenant?.uid) {
        return rejectWithValue(
          'Your tenancy could not be found. Reload the page and try again.',
        )
      }

      if (!toHostel?.id) {
        return rejectWithValue('Choose a branch to switch to.')
      }

      if (String(toHostel.id) === String(tenant.hostelId)) {
        return rejectWithValue('You already live at this branch.')
      }

      // One move at a time, so two reservations can never be open at once.
      const existing = await getSwitchRequestsByUser(tenant.uid)
      const active = existing.find((item) =>
        ACTIVE_STATUSES.includes(item.status),
      )
      if (active) {
        return rejectWithValue(
          'You already have a switch in progress. Finish or cancel it before requesting another.',
        )
      }

      const request = await createSwitchRequest({
        tenantId: tenant.id,
        tenantUid: tenant.uid,
        tenantName: tenant.name,
        fromHostelId: tenant.hostelId,
        fromHostelName: tenant.hostelName,
        fromRentPerMonth: tenant.rentPerMonth ?? null,
        toHostelId: toHostel.id,
        toHostelName: toHostel.name,
        amount: SWITCH_FEE_RUPEES,
        status: 'pending',
        paymentId: '',
        requestedOn: today(),
        createdAt: today(),
      })

      await notify(
        OWNER_INBOX,
        `${tenant.name} asked to switch from ${tenant.hostelName} to ${toHostel.name}. Reserve a bed or decline the request.`,
      )

      return request
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: approve a pending request and reserve a specific free bed at the
// destination. The tenant keeps their current bed until they pay and move, so
// nobody is left without a room while the request is being settled.
export const approveSwitch = createAsyncThunk(
  'switches/approveSwitch',
  async ({ switchRequest, room, bed }, { rejectWithValue }) => {
    try {
      if (switchRequest?.status !== 'pending') {
        return rejectWithValue('This request is no longer waiting for approval.')
      }

      if (!room?.id || !bed?.id) {
        return rejectWithValue('Choose a room and bed to reserve.')
      }

      // Re-check the bed against the server: another tenant may have taken it
      // while the owner had the page open.
      const beds = await getBedsByRoom(room.id)
      const target = beds.find((item) => String(item.id) === String(bed.id))

      if (!target) {
        return rejectWithValue(`Bed ${bed.bedNumber} no longer exists.`)
      }

      if (String(target.hostelId) !== String(switchRequest.toHostelId)) {
        return rejectWithValue('That bed belongs to a different branch.')
      }

      if (target.status !== 'available') {
        return rejectWithValue(
          `Bed ${target.bedNumber} in room ${room.roomNumber} is no longer free. Choose another bed.`,
        )
      }

      // Hold the bed. The public availability count treats anything that is
      // not "available" as taken, so reserved beds immediately stop showing up.
      await updateBed(target.id, {
        status: 'reserved',
        tenantId: switchRequest.tenantId,
      })

      const approved = await updateSwitchRequest(switchRequest.id, {
        status: 'approved',
        reservedRoomId: room.id,
        reservedRoomNumber: room.roomNumber,
        reservedBedId: target.id,
        reservedBedNumber: target.bedNumber,
        reservedRentPerMonth: room.rentPerMonth,
        decidedOn: today(),
      })

      await notify(
        switchRequest.tenantUid,
        `Your switch to ${switchRequest.toHostelName} was approved. Room ${room.roomNumber}, bed ${target.bedNumber} is held for you. Clear this month’s rent if it is still due, then pay the ${formatMoney(switchRequest.amount)} switch fee plus any prorated rent difference to complete the move.`,
      )

      return approved
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: pay the fee for an approved switch. Payment is the point of no
// return: the old bed is released and the reserved bed becomes theirs.
export const paySwitchFee = createAsyncThunk(
  'switches/paySwitchFee',
  async (switchRequest, { rejectWithValue }) => {
    try {
      if (switchRequest?.status !== 'approved') {
        return rejectWithValue('This switch is not ready for payment yet.')
      }

      if (!switchRequest.reservedBedId || !switchRequest.reservedRoomId) {
        return rejectWithValue(
          'No bed is reserved for this switch. Ask the owner to reserve one first.',
        )
      }

      const tenants = await getTenantsByUser(switchRequest.tenantUid)
      const tenant =
        tenants.find(
          (item) => String(item.id) === String(switchRequest.tenantId),
        ) ?? tenants[0]

      if (!tenant) {
        return rejectWithValue('The tenant record for this switch no longer exists.')
      }

      // The reservation must still be valid before taking any money.
      const beds = await getBedsByRoom(switchRequest.reservedRoomId)
      const bed = beds.find(
        (item) => String(item.id) === String(switchRequest.reservedBedId),
      )

      if (!bed || bed.status !== 'reserved') {
        return rejectWithValue(
          'Your reserved bed is no longer held. Ask the owner to reserve another one.',
        )
      }

      if (bed.tenantId && String(bed.tenantId) !== String(tenant.id)) {
        return rejectWithValue(
          'That bed is reserved for someone else. Ask the owner to review this switch.',
        )
      }

      // Switch fee and the mid-month rent difference are settled together.
      const fee = Number(switchRequest.amount) || SWITCH_FEE_RUPEES

      const settlement = computeSwitchSettlement({
        fromRent: tenant.rentPerMonth,
        toRent: switchRequest.reservedRentPerMonth,
      })

      if (!settlement) {
        return rejectWithValue(
          'Rent for this move could not be calculated. Ask the owner to check both branches’ room rents.',
        )
      }

      // Dues at the current branch must be clear before a move, otherwise the
      // unused-days credit would be calculated against rent that was never paid.
      const tenantPayments = await getPaymentsByUser(tenant.uid)
      const monthCleared = tenantPayments.some(
        (payment) =>
          payment.status === 'paid' && payment.month === settlement.month,
      )

      if (!monthCleared) {
        return rejectWithValue(
          `Pay your ${monthRangeLabel(settlement)} rent before moving. Once this month is cleared, the unused days are credited against the new branch.`,
        )
      }

      // Any credit already on the account reduces what is due now.
      const rent = applyRentCredit(settlement.charge, tenant.rentCredit)
      const rentCharge = rent.amountDue
      const creditLeft = rent.creditLeft + settlement.credit
      const totalDue = fee + rentCharge

      let response
      try {
        response = await openCheckout({
          amountInRupees: totalDue,
          description:
            rentCharge > 0
              ? `Switch to ${switchRequest.toHostelName} + rent difference`
              : `Switch to ${switchRequest.toHostelName}`,
          payer: { name: tenant.name, email: tenant.email },
        })
      } catch (error) {
        return rejectWithValue(error.message)
      }

      if (!response) {
        // Keep the reservation: the tenant can reopen the payment sheet.
        return rejectWithValue(
          'Payment was cancelled. Your bed is still reserved — try again when ready.',
        )
      }

      const settlementRecord = {
        ...settlement,
        fromHostelName: switchRequest.fromHostelName,
        toHostelName: switchRequest.toHostelName,
        grossCharge: settlement.charge,
        charged: rentCharge,
        creditApplied: rent.creditApplied,
        credited: settlement.credit,
        creditLeft,
        movedOn: today(),
      }

      // Record the rent difference separately so the rent history explains why
      // the moving month does not equal the new monthly rent.
      if (rentCharge > 0) {
        await createPayment({
          hostelId: switchRequest.toHostelId,
          hostelName: switchRequest.toHostelName,
          tenantId: tenant.id,
          tenantUid: tenant.uid,
          tenantName: tenant.name,
          amount: rentCharge,
          grossAmount: settlement.charge,
          creditApplied: rent.creditApplied,
          month: settlement.month,
          status: 'paid',
          category: 'rent-adjustment',
          note: `Mid-month move from ${switchRequest.fromHostelName} to ${switchRequest.toHostelName} — ${settlement.remainingDays} days at the new rent.`,
          switchRequestId: switchRequest.id,
          paymentId: response.paymentId ? `${response.paymentId}-rent` : '',
          createdAt: today(),
          paidOn: today(),
        })
      }

      // Move the tenant. The old bed is only freed once the fee is paid.
      if (tenant.bedId && String(tenant.bedId) !== String(bed.id)) {
        await updateBed(tenant.bedId, { status: 'available', tenantId: null })
      }

      await updateBed(bed.id, { status: 'occupied', tenantId: tenant.id })

      await updateTenant(tenant.id, {
        hostelId: switchRequest.toHostelId,
        hostelName: switchRequest.toHostelName,
        roomId: switchRequest.reservedRoomId,
        roomNumber: switchRequest.reservedRoomNumber,
        bedId: bed.id,
        bedNumber: bed.bedNumber,
        rentPerMonth: switchRequest.reservedRentPerMonth ?? tenant.rentPerMonth,
        rentStatus: 'paid',
        rentCredit: creditLeft,
        rentSettlement: settlementRecord,
        movedOn: today(),
      })

      const completed = await updateSwitchRequest(switchRequest.id, {
        status: 'completed',
        paymentId: response.paymentId ?? '',
        paidOn: today(),
        completedOn: today(),
        rentSettlement: settlementRecord,
        rentAdjustment: rentCharge,
        totalPaid: totalDue,
      })

      await notify(
        OWNER_INBOX,
        `${tenant.name} paid ${formatMoney(totalDue)} and moved to ${switchRequest.toHostelName} — room ${switchRequest.reservedRoomNumber}, bed ${bed.bedNumber}. Switch fee ${formatMoney(fee)}${
          rentCharge > 0
            ? `, rent difference ${formatMoney(rentCharge)}`
            : ''
        }.`,
      )

      const creditLine =
        creditLeft > 0
          ? ` ${formatMoney(creditLeft)} rent credit will be applied to your next rent.`
          : ''

      await notify(
        switchRequest.tenantUid,
        `You are now at ${switchRequest.toHostelName} — room ${switchRequest.reservedRoomNumber}, bed ${bed.bedNumber}. Your old bed has been released.${
          rentCharge > 0
            ? ` ${formatMoney(rentCharge)} was charged for the rent difference this month.`
            : ''
        }${creditLine}`,
      )

      return completed
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: decline a pending request. Nothing was reserved, so there is nothing
// to release.
export const rejectSwitch = createAsyncThunk(
  'switches/rejectSwitch',
  async ({ switchRequest, reason = '' }, { rejectWithValue }) => {
    try {
      if (switchRequest?.status !== 'pending') {
        return rejectWithValue('This request is no longer waiting for approval.')
      }

      const updated = await updateSwitchRequest(switchRequest.id, {
        status: 'rejected',
        decidedOn: today(),
        decisionNote: reason.trim(),
      })

      await notify(
        switchRequest.tenantUid,
        `Your switch to ${switchRequest.toHostelName} was declined.${
          reason.trim() ? ` Reason: ${reason.trim()}` : ''
        }`,
      )

      return updated
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: release a bed held for an approved request that the tenant has not
// paid for, so it can be offered to another tenant.
export const releaseSwitchReservation = createAsyncThunk(
  'switches/releaseSwitchReservation',
  async ({ switchRequest, reason = '' }, { rejectWithValue }) => {
    try {
      if (switchRequest?.status !== 'approved') {
        return rejectWithValue('Only an approved switch can have its bed released.')
      }

      if (switchRequest.reservedBedId) {
        try {
          await updateBed(switchRequest.reservedBedId, {
            status: 'available',
            tenantId: null,
          })
        } catch {
          // The bed may already have been freed; the request should still close.
        }
      }

      const updated = await updateSwitchRequest(switchRequest.id, {
        status: 'cancelled',
        decidedOn: today(),
        decisionNote: reason.trim(),
      })

      await notify(
        switchRequest.tenantUid,
        `Your switch to ${switchRequest.toHostelName} was closed because the fee was not paid. The reserved bed has been released.`,
      )

      return updated
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: withdraw a request. An approved request releases its reserved bed.
export const cancelSwitch = createAsyncThunk(
  'switches/cancelSwitch',
  async (switchRequest, { rejectWithValue }) => {
    try {
      if (!ACTIVE_STATUSES.includes(switchRequest?.status)) {
        return rejectWithValue('Only a request in progress can be cancelled.')
      }

      if (switchRequest.reservedBedId) {
        try {
          await updateBed(switchRequest.reservedBedId, {
            status: 'available',
            tenantId: null,
          })
        } catch {
          // The bed may already have been freed or removed; cancelling the
          // request must still go through.
        }
      }

      const updated = await updateSwitchRequest(switchRequest.id, {
        status: 'cancelled',
        decidedOn: today(),
        cancelledByTenant: true,
      })

      await notify(
        OWNER_INBOX,
        `${switchRequest.tenantName} cancelled the switch to ${switchRequest.toHostelName}.`,
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
        state.items.unshift(action.payload)
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
      .addCase(paySwitchFee.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(paySwitchFee.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(paySwitchFee.rejected, (state, action) => {
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
      .addCase(cancelSwitch.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(cancelSwitch.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(cancelSwitch.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(releaseSwitchReservation.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(releaseSwitchReservation.fulfilled, (state, action) => {
        state.isSaving = false
        replaceRequest(state.items, action.payload)
      })
      .addCase(releaseSwitchReservation.rejected, (state, action) => {
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
