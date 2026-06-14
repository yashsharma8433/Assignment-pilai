import { api } from './client'
import type {
  ApiResponse,
  Student,
  StudentFilters,
  CreateStudentInput,
  UpdateStudentInput,
} from '@/types'

function toFormData(data: CreateStudentInput | UpdateStudentInput): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    if (key === 'photo' && value instanceof File) {
      fd.append('photo', value)
    } else {
      fd.append(key, String(value))
    }
  }
  return fd
}

export const studentsApi = {
  list: (filters: StudentFilters = {}) =>
    api.get<ApiResponse<Student[]>>('/students', { params: filters }).then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Student>>(`/students/${id}`).then((r) => r.data),

  create: (data: CreateStudentInput) =>
    api
      .post<ApiResponse<Student>>('/students', toFormData(data), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  update: (id: number, data: UpdateStudentInput) =>
    api
      .put<ApiResponse<Student>>(`/students/${id}`, toFormData(data), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<{ id: number }>>(`/students/${id}`).then((r) => r.data),

  getCourses: () =>
    api.get<ApiResponse<string[]>>('/students/courses').then((r) => r.data),
}
