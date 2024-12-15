type ApiEndpoints = {
  TIMERS: string
  TIMER: string
  TAG: string
  COMMENT: string
  ADD_TAG: string
}

const API_URL = import.meta.env.VITE_API_URL
const ENDPOINTS: ApiEndpoints = JSON.parse(import.meta.env.VITE_API_ENDPOINTS.replace(/\n/g, ''))

export const API = {
  url: API_URL,
  endpoints: ENDPOINTS,
  getUrl: (endpoint: keyof ApiEndpoints) => `${API_URL}${ENDPOINTS[endpoint]}`
} 