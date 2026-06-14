import { Pool, PoolClient } from 'pg'

export interface ActivityLog {
  id: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  student_id: number | null
  student_name: string | null
  admission_no: string | null
  changes: Record<string, unknown> | null
  performed_at: string
}

export function createLogsRepository(pool: Pool | PoolClient) {
  async function insert(entry: {
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    student_id: number | null
    student_name: string | null
    admission_no: string | null
    changes?: Record<string, unknown>
  }): Promise<void> {
    await pool.query(
      `INSERT INTO activity_logs (action, student_id, student_name, admission_no, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        entry.action,
        entry.student_id,
        entry.student_name,
        entry.admission_no,
        entry.changes ? JSON.stringify(entry.changes) : null,
      ],
    )
  }

  async function list(params: {
    page: number
    limit: number
  }): Promise<{ data: ActivityLog[]; total: number }> {
    const offset = (params.page - 1) * params.limit
    const [countResult, dataResult] = await Promise.all([
      pool.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM activity_logs'),
      pool.query<ActivityLog>(
        'SELECT * FROM activity_logs ORDER BY performed_at DESC LIMIT $1 OFFSET $2',
        [params.limit, offset],
      ),
    ])
    return { data: dataResult.rows, total: Number(countResult.rows[0].count) }
  }

  return { insert, list }
}

export type LogsRepository = ReturnType<typeof createLogsRepository>
