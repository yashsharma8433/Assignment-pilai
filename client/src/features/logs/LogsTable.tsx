import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { logsApi } from '@/api/logs'
import { Pagination } from '@/components/ui/Pagination'
import type { ActivityLog } from '@/types'

const actionColor: Record<string, string> = {
  CREATE: 'badge-green',
  UPDATE: 'badge-amber',
  DELETE: 'badge-red',
}

export function LogsTable() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['logs', page],
    queryFn: () => logsApi.list({ page, limit: 20 }),
    staleTime: 10_000,
  })

  const logs: ActivityLog[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="table-container">
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Student</th>
              <th>Admission No.</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 18, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="table-empty">
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 600 }}>No activity yet</div>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className={`badge ${actionColor[log.action] ?? 'badge-indigo'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="log-entry">
                      <span style={{ fontWeight: 600 }}>{log.student_name ?? '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm" style={{ color: 'var(--accent-light)' }}>
                      {log.admission_no ?? '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(log.performed_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.total_pages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
