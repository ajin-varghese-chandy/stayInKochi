import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createFoodPlan,
  deleteFoodPlan,
  getAllFoodPlans,
  getFoodPlansByHostel,
  updateFoodPlan,
} from './foodPlanService'
import {
  createMeal,
  deleteMeal,
  getAllMeals,
  getMealsByHostel,
  updateMeal,
} from './mealService'

const initialState = {
  plans: [],
  meals: [],
  isLoading: false,
  error: null,
  isSaving: false,
  saveError: null,
}

// Owner: load every food plan and meal.
export const fetchAllFoodData = createAsyncThunk(
  'food/fetchAllFoodData',
  async (_, { rejectWithValue }) => {
    try {
      const [plans, meals] = await Promise.all([
        getAllFoodPlans(),
        getAllMeals(),
      ])
      return { plans, meals }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Tenant: load the food plans and meals for one hostel.
export const fetchFoodDataByHostel = createAsyncThunk(
  'food/fetchFoodDataByHostel',
  async (hostelId, { rejectWithValue }) => {
    try {
      const [plans, meals] = await Promise.all([
        getFoodPlansByHostel(hostelId),
        getMealsByHostel(hostelId),
      ])
      return { plans, meals }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const saveFoodPlan = createAsyncThunk(
  'food/saveFoodPlan',
  async ({ foodPlan, foodPlanId }, { rejectWithValue }) => {
    try {
      return foodPlanId
        ? await updateFoodPlan(foodPlanId, foodPlan)
        : await createFoodPlan(foodPlan)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const removeFoodPlan = createAsyncThunk(
  'food/removeFoodPlan',
  async (foodPlanId, { rejectWithValue }) => {
    try {
      await deleteFoodPlan(foodPlanId)
      return foodPlanId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const saveMeal = createAsyncThunk(
  'food/saveMeal',
  async ({ meal, mealId }, { rejectWithValue }) => {
    try {
      return mealId ? await updateMeal(mealId, meal) : await createMeal(meal)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const removeMeal = createAsyncThunk(
  'food/removeMeal',
  async (mealId, { rejectWithValue }) => {
    try {
      await deleteMeal(mealId)
      return mealId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const foodPlanSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    clearFoodSaveFeedback(state) {
      state.saveError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFoodData.pending, setListLoading)
      .addCase(fetchAllFoodData.fulfilled, setListData)
      .addCase(fetchAllFoodData.rejected, setListError)
      .addCase(fetchFoodDataByHostel.pending, setListLoading)
      .addCase(fetchFoodDataByHostel.fulfilled, setListData)
      .addCase(fetchFoodDataByHostel.rejected, setListError)
      // Saving a plan (create or edit)
      .addCase(saveFoodPlan.pending, setSaving)
      .addCase(saveFoodPlan.fulfilled, (state, action) => {
        state.isSaving = false
        upsert(state.plans, action.payload)
      })
      .addCase(saveFoodPlan.rejected, setSaveError)
      // Deleting a plan
      .addCase(removeFoodPlan.pending, setSaving)
      .addCase(removeFoodPlan.fulfilled, (state, action) => {
        state.isSaving = false
        state.plans = state.plans.filter(
          (plan) => plan.id !== action.payload,
        )
      })
      .addCase(removeFoodPlan.rejected, setSaveError)
      // Saving a meal (create or edit)
      .addCase(saveMeal.pending, setSaving)
      .addCase(saveMeal.fulfilled, (state, action) => {
        state.isSaving = false
        upsert(state.meals, action.payload)
      })
      .addCase(saveMeal.rejected, setSaveError)
      // Deleting a meal
      .addCase(removeMeal.pending, setSaving)
      .addCase(removeMeal.fulfilled, (state, action) => {
        state.isSaving = false
        state.meals = state.meals.filter((meal) => meal.id !== action.payload)
      })
      .addCase(removeMeal.rejected, setSaveError)
  },
})

// --- Reusable reducer helpers (keep extraReducers short) ---

function setListLoading(state) {
  state.isLoading = true
  state.error = null
}

function setListData(state, action) {
  state.isLoading = false
  state.plans = action.payload.plans
  state.meals = action.payload.meals
}

function setListError(state, action) {
  state.isLoading = false
  state.error = action.payload
}

function setSaving(state) {
  state.isSaving = true
  state.saveError = null
}

function setSaveError(state, action) {
  state.isSaving = false
  state.saveError = action.payload
}

// Insert a new record, or replace the existing one with the same id.
function upsert(list, record) {
  const index = list.findIndex((item) => item.id === record.id)
  if (index === -1) {
    list.push(record)
  } else {
    list[index] = record
  }
}

export const { clearFoodSaveFeedback } = foodPlanSlice.actions

// Selectors
export const selectFoodPlans = (state) => state.food.plans
export const selectMeals = (state) => state.food.meals
export const selectFoodLoading = (state) => state.food.isLoading
export const selectFoodError = (state) => state.food.error
export const selectFoodSaving = (state) => state.food.isSaving
export const selectFoodSaveError = (state) => state.food.saveError

export default foodPlanSlice.reducer
