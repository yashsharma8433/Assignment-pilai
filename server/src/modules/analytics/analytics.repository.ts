import { pool } from '../../db/pool'

export interface AnalyticsData {
  total_students: number
  course_breakdown: Array<{ course: string; count: number }>
  year_breakdown: Array<{ year: number; count: number }>
  gender_breakdown: Array<{ gender: string; count: number }>
  monthly_enrollment: Array<{ month: string; count: number }>
  recent_count: number // students added in last 30 days
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const [total, courses, years, genders, monthly, recent] = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM students'),
    pool.query<{ course: string; count: string }>(
      `SELECT course, COUNT(*)::int AS count
       FROM students GROUP BY course ORDER BY count DESC`,
    ),
    pool.query<{ year: number; count: string }>(
      `SELECT year, COUNT(*)::int AS count
       FROM students GROUP BY year ORDER BY year`,
    ),
    pool.query<{ gender: string; count: string }>(
      `SELECT gender, COUNT(*)::int AS count
       FROM students GROUP BY gender`,
    ),
    pool.query<{ month: string; count: string }>(
      `SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
              COUNT(*)::int AS count
       FROM students
       WHERE created_at >= NOW() - INTERVAL '12 months'
       GROUP BY month
       ORDER BY month`,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM students
       WHERE created_at >= NOW() - INTERVAL '30 days'`,
    ),
  ])

  return {
    total_students: Number(total.rows[0].count),
    course_breakdown: courses.rows.map((r) => ({ course: r.course, count: Number(r.count) })),
    year_breakdown: years.rows.map((r) => ({ year: r.year, count: Number(r.count) })),
    gender_breakdown: genders.rows.map((r) => ({ gender: r.gender, count: Number(r.count) })),
    monthly_enrollment: monthly.rows.map((r) => ({ month: r.month, count: Number(r.count) })),
    recent_count: Number(recent.rows[0].count),
  }
}
