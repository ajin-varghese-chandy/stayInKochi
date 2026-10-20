import api from '../../services/api'

// Every food plan (owner management).
export function getAllFoodPlans() {
  return api.get('/foodPlans')
}

// Food plans offered by one hostel (tenant view).
export function getFoodPlansByHostel(hostelId) {
  return api.get(`/foodPlans?hostelId=${hostelId}`)
}

export function createFoodPlan(foodPlan) {
  return api.post('/foodPlans', foodPlan)
}

export function updateFoodPlan(foodPlanId, updates) {
  return api.patch(`/foodPlans/${foodPlanId}`, updates)
}

export function deleteFoodPlan(foodPlanId) {
  return api.delete(`/foodPlans/${foodPlanId}`)
}
