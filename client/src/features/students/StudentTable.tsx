import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Filter } from 'lucide-react'
import { studentsApi } from '@/api/students'
import { Pagination } from '@/components/ui/Pagination'
import type { Student, StudentFilters } from '@/types'

interface Props {
  onEdit: (student: Student) => void
  onDelete: (id: number) => void
}

const GENDERS = ['', 'Male', 'Female', 'Other']
const YEARS   = ['', '1', '2', '3', '4', '5', '6']

function SortIcon({ col, sort, order }: { col: string; sort: string; order: string }) {
  if (sort !== col) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />
  return order === 'asc'
    ? <ChevronUp size={13} style={{ color: 'var(--accent-light)' }} />
    : <ChevronDown size={13} style={{ color: 'var(--accent-light)' }} />
}

export function StudentTable({ onEdit, onDelete }: Props) {
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1, limit: 10, sort: 'created_at', order: 'desc',
  })
  const [searchInput, setSearchInput] = useState('')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout>>()
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsApi.list(filters),
    staleTime: 30_000,
  })

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => studentsApi.getCourses(),
    staleTime: 5 * 60_000,
  })

  const courses = coursesData?.data ?? []
  const students = data?.data ?? []
  const meta = data?.meta

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setSearchInput(value)
    clearTimeout(debounceTimer)
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value || undefined, page: 1 }))
    }, 300)
    setDebounceTimer(t)
  }, [debounceTimer])

  const handleSort = (col: string) => {
    setFilters((f) => ({
      ...f,
      sort: col,
      order: f.sort === col && f.order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  const handleFilter = (key: keyof StudentFilters, value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: value || undefined,
      page: 1,
    }))
  }

  return (
    <div className="table-container">
      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            id="student-search"
            type="text"
            placeholder="Search name, email, admission no…"
            className="form-input search-input"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <button
          id="btn-toggle-filters"
          className={`btn btn-ghost btn-sm ${showFilters ? 'btn-secondary' : ''}`}
          onClick={() => setShowFilters((s) => !s)}
        >
          <Filter size={15} />
          Filters
        </button>

        <select
          className="form-select"
          style={{ width: 'auto', fontSize: '0.8rem', padding: '8px 32px 8px 10px' }}
          value={filters.limit ?? 10}
          onChange={(e) => setFilters((f) => ({ ...f, limit: Number(e.target.value), page: 1 }))}
        >
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8rem', padding: '7px 32px 7px 10px' }}
            value={filters.course ?? ''}
            onChange={(e) => handleFilter('course', e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8rem', padding: '7px 32px 7px 10px' }}
            value={filters.year ?? ''}
            onChange={(e) => handleFilter('year', e.target.value)}
          >
            <option value="">All Years</option>
            {YEARS.slice(1).map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8rem', padding: '7px 32px 7px 10px' }}
            value={filters.gender ?? ''}
            onChange={(e) => handleFilter('gender', e.target.value)}
          >
            <option value="">All Genders</option>
            {GENDERS.slice(1).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFilters({ page: 1, limit: 10, sort: 'created_at', order: 'desc' })
              setSearchInput('')
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th className="sortable" onClick={() => handleSort('admission_no')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Admission No <SortIcon col="admission_no" sort={filters.sort!} order={filters.order!} />
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort('course')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Course <SortIcon col="course" sort={filters.sort!} order={filters.order!} />
                </span>
              </th>
              <th className="sortable" onClick={() => handleSort('year')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Year <SortIcon col="year" sort={filters.sort!} order={filters.order!} />
                </span>
              </th>
              <th>Gender</th>
              <th>Mobile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 18, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🎓</div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>No students found</div>
                    <div className="text-sm text-muted">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.total_pages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        />
      )}
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────
function StudentRow({
  student,
  onEdit,
  onDelete,
}: {
  student: Student
  onEdit: (s: Student) => void
  onDelete: (id: number) => void
}) {
  const genderColor: Record<string, string> = {
    Male: 'badge-blue', Female: 'badge-indigo', Other: 'badge-amber',
  }

  return (
    <tr>
      <td>
        <div className="student-cell">
          <Avatar student={student} />
          <div className="student-info">
            <span className="student-name">{student.name}</span>
            <span className="student-admission">{student.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="font-mono text-sm" style={{ color: 'var(--accent-light)' }}>
          {student.admission_no}
        </span>
      </td>
      <td style={{ color: 'var(--text-secondary)' }}>{student.course}</td>
      <td>
        <span className="badge badge-green">Year {student.year}</span>
      </td>
      <td>
        <span className={`badge ${genderColor[student.gender] ?? 'badge-indigo'}`}>
          {student.gender}
        </span>
      </td>
      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        {student.mobile}
      </td>
      <td>
        <div className="row-actions">
          <button
            id={`btn-edit-${student.id}`}
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onEdit(student)}
            title="Edit student"
          >
            <Pencil size={15} />
          </button>
          <button
            id={`btn-delete-${student.id}`}
            className="btn btn-danger btn-icon btn-sm"
            onClick={() => onDelete(student.id)}
            title="Delete student"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function Avatar({ student }: { student: Student }) {
  if (student.photo_url) {
    return (
      <img
        src={student.photo_url}
        alt={student.name}
        className="avatar"
        loading="lazy"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
          target.nextElementSibling?.removeAttribute('style')
        }}
      />
    )
  }
  return (
    <div className="avatar-fallback">
      {student.name.charAt(0).toUpperCase()}
    </div>
  )
}
