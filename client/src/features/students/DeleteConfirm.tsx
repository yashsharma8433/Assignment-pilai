import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentsApi } from '@/api/students'

interface Props {
  studentId: number
  studentName?: string
  onClose: () => void
}

export function DeleteConfirm({ studentId, studentName, onClose }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => studentsApi.delete(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['logs'] })
      toast.success('Student record deleted')
      onClose()
    },
  })

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal confirm-modal" role="alertdialog" aria-modal="true">
        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 28px' }}>
          <div className="confirm-icon">
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
            Delete Student?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
            This will permanently remove{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{studentName ?? 'this student'}</strong>
            {' '}and all their data. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button id="btn-cancel-delete" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              id="btn-confirm-delete"
              className="btn btn-danger"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
