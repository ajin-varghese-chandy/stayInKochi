import axios from 'axios'

// One axios client for the json-server REST API (`npm run server`).
// Every feature service talks to the backend through it, so the base URL and
// error handling live in one place.
//
// The response interceptor unwraps `response.data`, so a service function
// resolves with the payload itself: an array for collections, an object for a
// single record, and null for the body-less 204 that DELETE returns.
//
// No default Content-Type is set: axios already sends application/json for
// plain objects and multipart/form-data for FormData (image uploads), so the
// caller never has to think about it.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
  timeout: 10000,
})

// axios rejects on any non-2xx status, which the old fetch wrapper did not.
// Translate its errors into the short, human-readable messages the UI shows
// in Alerts, keeping the original status on the error for callers that care.
function toFriendlyError(error) {
  if (error.response) {
    const { status, data } = error.response
    const detail = typeof data?.message === 'string' ? `: ${data.message}` : ''
    const friendly = new Error(`Request failed with status ${status}${detail}`)
    friendly.status = status
    friendly.data = data
    return friendly
  }

  if (error.code === 'ECONNABORTED') {
    return new Error('The API server took too long to respond. Please try again.')
  }

  return new Error('Could not reach the API server. Is `npm run server` running?')
}

api.interceptors.response.use(
  (response) => (response.data === '' || response.data === undefined ? null : response.data),
  (error) => Promise.reject(toFriendlyError(error)),
)

export default api
