import { api } from './client'
import type { ApiResponse, AnalyticsData } from '@/types'

export const analyticsApi = {
  get: () =>
    api.get<ApiResponse<AnalyticsData>>('/analytics').then((r) => r.data),
}
