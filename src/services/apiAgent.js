import axios from 'axios'

const API_URL = process.env.VITE_API_URL
const MOCK_LATENCY_MS = Number(process.env.VITE_MOCK_LATENCY_MS ?? 0)

if (!API_URL) {
  throw new Error('VITE_API_URL is not set. Add it to your .env file.')
}

const apiAxios = axios.create({
  baseURL: `${API_URL.replace(/\/$/, '')}/api`,
  timeout: 10000,
})

if (MOCK_LATENCY_MS > 0) {
  apiAxios.interceptors.request.use(
    (config) => new Promise((resolve) => setTimeout(() => resolve(config), MOCK_LATENCY_MS)),
  )
}

export const AccountApiAgent = {
  get: async () => {
    return apiAxios.get('/account.json').then((res) => res.data)
  },
}

export const TransactionApiAgent = {
  getAll: async () => {
    return apiAxios.get('/transactions.json').then((res) => res.data)
  },
}

export const FilterApiAgent = {
  getOptions: async () => {
    return apiAxios.get('/filters.json').then((res) => res.data)
  },
}
