import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { sendMessage } from './chatService'

const initialState = {
  messages: [],
  isLoading: false, // waiting for the first snapshot of the open room
  error: null, // subscription/read error
  isSaving: false, // a message is being sent
  saveError: null, // send error
}

// Tenant: send a message as themselves in the open conversation.
export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ conversation, sender, text }, { rejectWithValue }) => {
    try {
      await sendMessage(conversation, {
        senderUid: sender.uid,
        senderName: sender.displayName ?? sender.email ?? 'Unknown',
        senderRole: sender.role ?? 'tenant',
        text,
        createdAt: new Date().toISOString(),
      })
      // No payload needed: the live subscription delivers the stored message.
      return true
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // A different room was opened: drop the old messages and start fresh.
    conversationOpened(state) {
      state.messages = []
      state.isLoading = true
      state.error = null
      state.saveError = null
    },
    messagesReceived(state, action) {
      state.messages = action.payload
      state.isLoading = false
      state.error = null
    },
    messagesLoadFailed(state, action) {
      state.isLoading = false
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isSaving = true
        state.saveError = null
      })
      .addCase(sendChatMessage.fulfilled, (state) => {
        state.isSaving = false
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSaving = false
        state.saveError = action.payload
      })
  },
})

export const { conversationOpened, messagesReceived, messagesLoadFailed } =
  chatSlice.actions

// Selectors
export const selectChatMessages = (state) => state.chat.messages
export const selectChatLoading = (state) => state.chat.isLoading
export const selectChatError = (state) => state.chat.error
export const selectChatSaving = (state) => state.chat.isSaving
export const selectChatSaveError = (state) => state.chat.saveError

export default chatSlice.reducer
