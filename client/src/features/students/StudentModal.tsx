import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsApi } from '@/api/students'
import { StudentForm } from './StudentForm'
import type { Student, CreateStudentInput } from '@/types'

interface Props {
  student?: Student          // undefined = create mode
  onClose: () => void
}

export function StudentModal({ student, onClose }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(student)

  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      toast.success(`Student ${res.data.name} added — ${res.data.admission_no}`)
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateStudentInput }) =>
      studentsApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      toast.success(`${res.data.name}'s profile updated`)
      onClose()
    },
  })

  const handleSubmit = async (data: CreateStudentInput) => {
    if (isEdit && student) {
      await updateMutation.mutateAsync({ id: student.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <StudentForm
            defaultValues={student}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
