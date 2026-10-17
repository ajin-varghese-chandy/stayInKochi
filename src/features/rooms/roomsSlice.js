import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { updateTenant } from '../tenants/tenantService'
import { createBed, deleteBed, getBedsByHostel, getBedsByRoom, updateBed } from './bedService'
import { createRoom, deleteRoom, getRoomsByHostel, updateRoom } from './roomService'

const BED_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const initialState = {
  rooms: [], // rooms for the hostel being managed
  beds: [], // beds for the hostel being managed
  isLoading: false, // list loading
  error: null, // list load error
  isSaving: false, // create/edit/delete/assign in progress
  saveError: null, // create/edit/delete/assign error
}

// Load every room and bed for one hostel in a single dispatch.
export const fetchHostelRoomsAndBeds = createAsyncThunk(
  'rooms/fetchHostelRoomsAndBeds',
  async (hostelId, { rejectWithValue }) => {
    try {
      const [rooms, beds] = await Promise.all([
        getRoomsByHostel(hostelId),
        getBedsByHostel(hostelId),
      ])
      return { rooms, beds }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: add a room and create its beds. Payload: { hostelId, roomNumber,
// floor, rentPerMonth, bedCount }.
export const createRoomWithBeds = createAsyncThunk(
  'rooms/createRoomWithBeds',
  async (roomData, { rejectWithValue }) => {
    try {
      const room = await createRoom(roomData)

      const beds = []
      for (let index = 0; index < roomData.bedCount; index += 1) {
        const bed = await createBed({
          roomId: room.id,
          hostelId: room.hostelId,
          bedNumber: BED_LABELS[index] ?? String(index + 1),
          status: 'available',
          tenantId: null,
        })
        beds.push(bed)
      }

      return { room, beds }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: edit a room's details (bed count is not changed here).
export const updateRoomDetails = createAsyncThunk(
  'rooms/updateRoomDetails',
  async ({ roomId, updates }, { rejectWithValue }) => {
    try {
      return await updateRoom(roomId, updates)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: remove a room and its beds. Resolves with the removed room id.
export const deleteRoomWithBeds = createAsyncThunk(
  'rooms/deleteRoomWithBeds',
  async (roomId, { rejectWithValue }) => {
    try {
      const beds = await getBedsByRoom(roomId)
      for (const bed of beds) {
        await deleteBed(bed.id)
      }
      await deleteRoom(roomId)
      return roomId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: assign a tenant to an available bed (also updates the tenant record).
export const assignBedToTenant = createAsyncThunk(
  'rooms/assignBedToTenant',
  async ({ bed, tenant, room }, { rejectWithValue }) => {
    try {
      const updatedBed = await updateBed(bed.id, {
        status: 'occupied',
        tenantId: tenant.id,
      })
      await updateTenant(tenant.id, {
        roomId: bed.roomId,
        bedId: bed.id,
        roomNumber: room.roomNumber,
        bedNumber: bed.bedNumber,
        rentPerMonth: room.rentPerMonth,
      })
      return updatedBed
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Owner: free an occupied bed (also clears it from the tenant record).
export const freeBedFromTenant = createAsyncThunk(
  'rooms/freeBedFromTenant',
  async ({ bed }, { rejectWithValue }) => {
    try {
      const updatedBed = await updateBed(bed.id, {
        status: 'available',
        tenantId: null,
      })
      if (bed.tenantId) {
        await updateTenant(bed.tenantId, {
          roomId: null,
          bedId: null,
          roomNumber: null,
          bedNumber: null,
          rentPerMonth: null,
        })
      }
      return updatedBed
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostelRoomsAndBeds.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchHostelRoomsAndBeds.fulfilled, (state, action) => {
        state.isLoading = false
        state.rooms = action.payload.rooms
        state.beds = action.payload.beds
      })
      .addCase(fetchHostelRoomsAndBeds.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Creating a room + its beds
      .addCase(createRoomWithBeds.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(createRoomWithBeds.fulfilled, (state, action) => {
        state.isSaving = false
        state.rooms.push(action.payload.room)
        state.beds.push(...action.payload.beds)
      })
      .addCase(createRoomWithBeds.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Editing a room
      .addCase(updateRoomDetails.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(updateRoomDetails.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.rooms.findIndex(
          (room) => room.id === action.payload.id,
        )
        if (index !== -1) {
          state.rooms[index] = action.payload
        }
      })
      .addCase(updateRoomDetails.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Deleting a room + its beds
      .addCase(deleteRoomWithBeds.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(deleteRoomWithBeds.fulfilled, (state, action) => {
        state.isSaving = false
        state.rooms = state.rooms.filter((room) => room.id !== action.payload)
        state.beds = state.beds.filter((bed) => bed.roomId !== action.payload)
      })
      .addCase(deleteRoomWithBeds.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      // Assigning / freeing a bed
      .addCase(assignBedToTenant.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(assignBedToTenant.fulfilled, (state, action) => {
        state.isSaving = false
        replaceBed(state.beds, action.payload)
      })
      .addCase(assignBedToTenant.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
      .addCase(freeBedFromTenant.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(freeBedFromTenant.fulfilled, (state, action) => {
        state.isSaving = false
        replaceBed(state.beds, action.payload)
      })
      .addCase(freeBedFromTenant.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

// Swap the updated bed into the list (by id).
function replaceBed(beds, updatedBed) {
  const index = beds.findIndex((bed) => bed.id === updatedBed.id)
  if (index !== -1) {
    beds[index] = updatedBed
  }
}

export const { clearRoomSaveFeedback } = roomsSlice.actions

// Selectors used by the owner's room & bed management screen.
export const selectRooms = (state) => state.rooms.rooms
export const selectRoomsBeds = (state) => state.rooms.beds
export const selectRoomsLoading = (state) => state.rooms.isLoading
export const selectRoomsError = (state) => state.rooms.error
export const selectRoomsSaving = (state) => state.rooms.isSaving
export const selectRoomsSaveError = (state) => state.rooms.saveError

export default roomsSlice.reducer
