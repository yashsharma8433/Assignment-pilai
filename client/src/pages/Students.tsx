import { useState } from 'react'
import { Plus } from 'lucide-react'
import { StudentTable } from '@/features/students/StudentTable'
import { StudentModal } from '@/features/students/StudentModal'
import { DeleteConfirm } from '@/features/students/DeleteConfirm'
import type { Student } from '@/types'

export default function Students() {
  const [modalStudent, setModalStudent] = useState<Student | null | 'new'>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteStudentName, setDeleteStudentName] = useState<string>('')

  const handleEdit = (student: Student) => setModalStudent(student)
  const handleAdd = () => setModalStudent('new')
  const handleDelete = (id: number, name?: string) => {
    setDeleteId(id)
    setDeleteStudentName(name ?? '')
  }

  return (
    <>
      <div className="section-header">
        <div>
          <h1 className="section-title">Student Records</h1>
          <div className="section-sub">Manage, search, and filter all enrolled students</div>
        </div>
        <button id="btn-add-student" className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} />
          Add Student
        </button>
      </div>

      <StudentTable
        onEdit={handleEdit}
        onDelete={(id) => {
          // We pass name via a ref lookup — find from cache would be complex, just pass id
          handleDelete(id)
        }}
      />

      {/* Add/Edit Modal */}
      {modalStudent !== null && (
        <StudentModal
          student={modalStudent === 'new' ? undefined : modalStudent}
          onClose={() => setModalStudent(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <DeleteConfirm
          studentId={deleteId}
          studentName={deleteStudentName}
          onClose={() => { setDeleteId(null); setDeleteStudentName('') }}
        />
      )}
    </>
  )
}
