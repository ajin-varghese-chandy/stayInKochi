import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  loginUser,
  logoutUser,
  readCachedUser,
  registerUser,
} from './authService'

const userFromLastVisit = readCachedUser()

const initialState = {
  user: userFromLastVisit,
  isLoading: !userFromLastVisit,
  isSubmitting: false,
  error: null,
}

export const register = createAsyncThunk('auth/register', async (formData) => {
  return await registerUser(formData)
})

export const login = createAsyncThunk('auth/login', async (credentials) => {
  return await loginUser(credentials)
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStateChanged(state, action) {
      state.user = action.payload
      state.isLoading = false
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(register.pending, (state) => {
      state.isSubmitting = true
      state.error = null
    })

    builder.addCase(register.fulfilled, (state, action) => {
      state.isSubmitting = false
      state.isLoading = false
      state.user = action.payload
    })

    builder.addCase(register.rejected, (state, action) => {
      state.isSubmitting = false
      state.error = action.error.message
    })

    builder.addCase(login.pending, (state) => {
      state.isSubmitting = true
      state.error = null
    })

    builder.addCase(login.fulfilled, (state, action) => {
      state.isSubmitting = false
      state.isLoading = false
      state.user = action.payload
    })

    builder.addCase(login.rejected, (state, action) => {
      state.isSubmitting = false
      state.error = action.error.message
    })

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null
    })
  },
})

export const { authStateChanged, clearAuthError } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthSubmitting = (state) => state.auth.isSubmitting
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
