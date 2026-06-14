import { create } from 'zustand'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void

  // Student modal
  modalOpen: boolean
  editingStudentId: number | null
  openAddModal: () => void
  openEditModal: (id: number) => void
  closeModal: () => void

  // Delete confirm
  deleteTargetId: number | null
  openDeleteConfirm: (id: number) => void
  closeDeleteConfirm: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  modalOpen: false,
  editingStudentId: null,
  openAddModal: () => set({ modalOpen: true, editingStudentId: null }),
  openEditModal: (id) => set({ modalOpen: true, editingStudentId: id }),
  closeModal: () => set({ modalOpen: false, editingStudentId: null }),

  deleteTargetId: null,
  openDeleteConfirm: (id) => set({ deleteTargetId: id }),
  closeDeleteConfirm: () => set({ deleteTargetId: null }),
}))
