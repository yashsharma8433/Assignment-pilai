// ── Shared domain types (mirrors server shapes) ───────────────

export interface Student {
  id: number
  admission_no: string
  name: string
  course: string
  year: number
  dob: string
  email: string
  mobile: string
  gender: 'Male' | 'Female' | 'Other'
  address: string | null
  photo_path: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  student_id: number | null
  student_name: string | null
  admission_no: string | null
  changes: Record<string, unknown> | null
  performed_at: string
}

export interface AnalyticsData {
  total_students: number
  course_breakdown: Array<{ course: string; count: number }>
  year_breakdown: Array<{ year: number; count: number }>
  gender_breakdown: Array<{ gender: string; count: number }>
  monthly_enrollment: Array<{ month: string; count: number }>
  recent_count: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PaginationMeta
}

export interface StudentFilters {
  search?: string
  course?: string
  year?: number
  gender?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export type CreateStudentInput = {
  name: string
  course: string
  year: number
  dob: string
  email: string
  mobile: string
  gender: 'Male' | 'Female' | 'Other'
  address?: string
  photo?: File
}

export type UpdateStudentInput = Partial<CreateStudentInput>
