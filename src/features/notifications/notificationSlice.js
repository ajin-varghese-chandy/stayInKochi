import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getNotificationsByUser,
  updateNotification,
} from './notificationService'

const initialState = {
  items: [], // notifications for the signed-in recipient
  isLoading: false,
  error: null,
  isSaving: false, // a "mark as read" update is in progress
  saveError: null,
}

// Load this user's inbox (tenant uid, or the fixed owner inbox).
export const fetchMyNotifications = createAsyncThunk(
  'notifications/fetchMyNotifications',
  async (recipientId, { rejectWithValue }) => {
    try {
      return await getNotificationsByUser(recipientId)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notification, { rejectWithValue }) => {
    try {
      return await updateNotification(notification.id, { read: true })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchMyNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.isSaving = false
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        )
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

// Selectors
export const selectNotifications = (state) => state.notifications.items
export const selectNotificationsLoading = (state) =>
  state.notifications.isLoading
export const selectNotificationsError = (state) => state.notifications.error
export const selectNotificationsSaving = (state) => state.notifications.isSaving
export const selectUnreadCount = (state) =>
  state.notifications.items.filter((item) => !item.read).length

export default notificationSlice.reducer
