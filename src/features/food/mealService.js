import { apiRequest } from '../../services/api'

// Every individual meal (owner management).
export function getAllMeals() {
  return apiRequest('/meals')
}

// Individual meals offered by one hostel (tenant booking view).
export function getMealsByHostel(hostelId) {
  return apiRequest(`/meals?hostelId=${hostelId}`)
}

export function createMeal(meal) {
  return apiRequest('/meals', {
    method: 'POST',
    body: JSON.stringify(meal),
  })
}

export function updateMeal(mealId, updates) {
  return apiRequest(`/meals/${mealId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function deleteMeal(mealId) {
  return apiRequest(`/meals/${mealId}`, { method: 'DELETE' })
}
