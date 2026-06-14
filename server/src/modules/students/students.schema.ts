import { z } from 'zod'

// ── Reusable sub-schemas ──────────────────────────────────────

const mobileSchema = z
  .string()
  .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits')

const dobSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
  .refine((val) => {
    const dob = new Date(val)
    if (isNaN(dob.getTime())) return false
    const ageMs = Date.now() - dob.getTime()
    const ageyears = ageMs / (365.25 * 24 * 60 * 60 * 1000)
    return ageyears >= 15
  }, 'Student must be at least 15 years old')

// ── Create ────────────────────────────────────────────────────

export const createStudentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name must contain only letters and basic punctuation'),
  course: z
    .string()
    .min(1, 'Course is required')
    .max(100, 'Course must be at most 100 characters'),
  year: z.coerce
    .number()
    .int('Year must be an integer')
    .min(1, 'Year must be between 1 and 6')
    .max(6, 'Year must be between 1 and 6'),
  dob: dobSchema,
  email: z.string().email('Must be a valid email address').max(150),
  mobile: mobileSchema,
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: "Gender must be 'Male', 'Female', or 'Other'" }),
  }),
  address: z.string().max(500, 'Address must be at most 500 characters').optional(),
})

// ── Update (all fields optional) ─────────────────────────────

export const updateStudentSchema = createStudentSchema.partial()

// ── Query params for list ─────────────────────────────────────

export const listStudentsQuerySchema = z.object({
  search: z.string().optional(),
  course: z.string().optional(),
  year: z.coerce.number().int().min(1).max(6).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z
    .enum(['name', 'course', 'year', 'email', 'admission_no', 'created_at'])
    .default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// ── Inferred types ────────────────────────────────────────────

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>
