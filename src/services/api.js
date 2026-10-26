import axios from 'axios'


export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})



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
