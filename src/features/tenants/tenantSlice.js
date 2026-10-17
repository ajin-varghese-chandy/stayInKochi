import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { updateBed } from '../rooms/bedService'
import { deleteTenant, getAllTenants } from './tenantService'

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  isSaving: false, // checking a tenant out is in progress
  saveError: null,
}

// Owner: load every active tenant.
export const fetchTenants = createAsyncThunk(
  'tenants/fetchTenants',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllTenants()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: check a tenant out. Frees their bed first so it is not left
// pointing at someone who no longer lives here, then removes the record.
export const checkOutTenant = createAsyncThunk(
  'tenants/checkOutTenant',
  async (tenant, { rejectWithValue }) => {
    try {
      if (tenant.bedId) {
        await updateBed(tenant.bedId, { status: 'available', tenantId: null })
      }
      await deleteTenant(tenant.id)
      return tenant.id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearTenantSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(checkOutTenant.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(checkOutTenant.fulfilled, (state, action) => {
        state.isSaving = false
        state.items = state.items.filter(
          (tenant) => tenant.id !== action.payload,
        )
      })
      .addCase(checkOutTenant.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

// Selectors used by the owner's tenants screen and bed assignment.
export const { clearTenantSaveFeedback } = tenantSlice.actions

export const selectTenants = (state) => state.tenants.items
export const selectTenantsLoading = (state) => state.tenants.isLoading
export const selectTenantsError = (state) => state.tenants.error
export const selectTenantsSaving = (state) => state.tenants.isSaving
export const selectTenantsSaveError = (state) => state.tenants.saveError

export default tenantSlice.reducer
