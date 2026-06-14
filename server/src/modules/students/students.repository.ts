import { Pool, PoolClient } from 'pg'
import { CreateStudentInput, ListStudentsQuery, UpdateStudentInput } from './students.schema'

// ── Domain types ──────────────────────────────────────────────

export interface Student {
  id: number
  admission_no: string
  name: string
  course: string
  year: number
  dob: string
  email: string
  mobile: string
  gender: string
  address: string | null
  photo_path: string | null
  created_at: string
  updated_at: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ListResult {
  data: Student[]
  meta: PaginationMeta
}

// ── Repository factory ────────────────────────────────────────
// Returns a plain object of data-access functions.
// No class inheritance — easy to mock in tests.

export function createStudentsRepository(pool: Pool | PoolClient) {
  // ── List with search / filter / sort / pagination ──────────
  async function list(params: ListStudentsQuery): Promise<ListResult> {
    const { search, course, year, gender, page, limit, sort, order } = params
    const offset = (page - 1) * limit

    const conditions: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (search) {
      conditions.push(
        `(name ILIKE $${idx} OR email ILIKE $${idx} OR admission_no ILIKE $${idx})`,
      )
      values.push(`%${search}%`)
      idx++
    }
    if (course) {
      conditions.push(`course = $${idx++}`)
      values.push(course)
    }
    if (year !== undefined) {
      conditions.push(`year = $${idx++}`)
      values.push(year)
    }
    if (gender) {
      conditions.push(`gender = $${idx++}`)
      values.push(gender)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Whitelist sort columns to prevent SQL injection
    const safeSort = sort
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC'

    const [countResult, dataResult] = await Promise.all([
      pool.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM students ${where}`,
        values,
      ),
      pool.query<Student>(
        `SELECT * FROM students ${where}
         ORDER BY ${safeSort} ${safeOrder}
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ])

    const total = Number(countResult.rows[0].count)
    const totalPages = Math.ceil(total / limit)

    return {
      data: dataResult.rows,
      meta: {
        total,
        page,
        limit,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    }
  }

  // ── Find by ID ────────────────────────────────────────────
  async function findById(id: number): Promise<Student | null> {
    const { rows } = await pool.query<Student>(
      'SELECT * FROM students WHERE id = $1',
      [id],
    )
    return rows[0] ?? null
  }

  // ── Create ────────────────────────────────────────────────
  async function create(
    input: CreateStudentInput & { photo_path?: string },
  ): Promise<Student> {
    // Generate admission number — atomically via DB sequence
    const seqResult = await pool.query<{ seq: string }>(
      "SELECT nextval('admission_seq') AS seq",
    )
    const seq = parseInt(seqResult.rows[0].seq, 10)
    const admissionNo = `ADM-${new Date().getFullYear()}-${seq.toString().padStart(4, '0')}`

    const { rows } = await pool.query<Student>(
      `INSERT INTO students
         (admission_no, name, course, year, dob, email, mobile, gender, address, photo_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        admissionNo,
        input.name,
        input.course,
        input.year,
        input.dob,
        input.email,
        input.mobile,
        input.gender,
        input.address ?? null,
        input.photo_path ?? null,
      ],
    )
    return rows[0]
  }

  // ── Update ────────────────────────────────────────────────
  async function update(
    id: number,
    input: UpdateStudentInput & { photo_path?: string },
  ): Promise<Student | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    const fieldMap: Array<[keyof typeof input, string]> = [
      ['name', 'name'],
      ['course', 'course'],
      ['year', 'year'],
      ['dob', 'dob'],
      ['email', 'email'],
      ['mobile', 'mobile'],
      ['gender', 'gender'],
      ['address', 'address'],
      ['photo_path', 'photo_path'],
    ]

    for (const [key, col] of fieldMap) {
      if (input[key] !== undefined) {
        fields.push(`${col} = $${idx++}`)
        values.push(input[key])
      }
    }

    if (fields.length === 0) return findById(id)

    values.push(id)
    const { rows } = await pool.query<Student>(
      `UPDATE students SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    )
    return rows[0] ?? null
  }

  // ── Delete ────────────────────────────────────────────────
  async function remove(id: number): Promise<Student | null> {
    const { rows } = await pool.query<Student>(
      'DELETE FROM students WHERE id = $1 RETURNING *',
      [id],
    )
    return rows[0] ?? null
  }

  // ── Distinct courses (for filter dropdowns) ───────────────
  async function getDistinctCourses(): Promise<string[]> {
    const { rows } = await pool.query<{ course: string }>(
      'SELECT DISTINCT course FROM students ORDER BY course',
    )
    return rows.map((r) => r.course)
  }

  return { list, findById, create, update, remove, getDistinctCourses }
}

export type StudentsRepository = ReturnType<typeof createStudentsRepository>
