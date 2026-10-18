import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginUser, logoutUser, registerUser } from './authService'

const initialState = {
  // Start as "loading" until Firebase reports whether anyone is signed in.
  // This guards ProtectedRoute but must NOT be used to disable form buttons.
  user: null,
  isLoading: true,
  // Tracks only an in-flight login/register form submission so the buttons
  // don't show a spinner just because Firebase hasn't resolved yet.
  isSubmitting: false,
  error: null,
}

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await registerUser(userData)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginUser(credentials)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by the auth listener whenever Firebase reports a user change.
    authStateChanged(state, action) {
      state.user = action.payload
      state.isLoading = false
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })
      .addCase(login.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { authStateChanged, clearAuthError } = authSlice.actions

// Selectors used by components across the app.
export const selectCurrentUser = (state) => state.auth.user
// True only while waiting for Firebase's initial auth check (guards ProtectedRoute).
export const selectAuthLoading = (state) => state.auth.isLoading
// True only while a login/register form is being submitted.
export const selectAuthSubmitting = (state) => state.auth.isSubmitting
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
