import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15_000,
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: { message?: string; code?: string } }>) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      'An unexpected error occurred'

    if (error.response?.status !== 404) {
      toast.error(message, { id: 'api-error', duration: 4000 })
    }

    return Promise.reject(error)
  },
)
