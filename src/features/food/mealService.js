import api from '../../services/api'

// Every individual meal (owner management).
export function getAllMeals() {
  return api.get('/meals')
}

// Individual meals offered by one hostel (tenant booking view).
export function getMealsByHostel(hostelId) {
  return api.get(`/meals?hostelId=${hostelId}`)
}

export function createMeal(meal) {
  return api.post('/meals', meal)
}

export function updateMeal(mealId, updates) {
  return api.patch(`/meals/${mealId}`, updates)
}

export function deleteMeal(mealId) {
  return api.delete(`/meals/${mealId}`)
}
