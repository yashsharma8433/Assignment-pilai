import { api } from './client'
import type { ApiResponse, ActivityLog } from '@/types'

export const logsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<ActivityLog[]>>('/logs', { params }).then((r) => r.data),
}
