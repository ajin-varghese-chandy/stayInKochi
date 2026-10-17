// Thin wrapper around fetch for talking to the json-server REST API.
// Reused by every feature service (hostels, rooms, tenants, ...) so the base
// URL and error handling live in one place.
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  // Deletes (and 204s) may have no body to parse.
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
