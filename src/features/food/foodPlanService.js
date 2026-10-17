import { apiRequest } from '../../services/api'

// Every food plan (owner management).
export function getAllFoodPlans() {
  return apiRequest('/foodPlans')
}

// Food plans offered by one hostel (tenant view).
export function getFoodPlansByHostel(hostelId) {
  return apiRequest(`/foodPlans?hostelId=${hostelId}`)
}

export function createFoodPlan(foodPlan) {
  return apiRequest('/foodPlans', {
    method: 'POST',
    body: JSON.stringify(foodPlan),
  })
}

export function updateFoodPlan(foodPlanId, updates) {
  return apiRequest(`/foodPlans/${foodPlanId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function deleteFoodPlan(foodPlanId) {
  return apiRequest(`/foodPlans/${foodPlanId}`, { method: 'DELETE' })
}
