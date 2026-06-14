import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { env } from '../../config/env'
import { Errors } from '../../shared/errors'
import { ok } from '../../shared/response'
import {
  createStudentsRepository,
  StudentsRepository,
} from './students.repository'
import { createLogsRepository } from '../logs/logs.repository'
import { CreateStudentInput, ListStudentsQuery, UpdateStudentInput } from './students.schema'
import { pool, withTransaction } from '../../db/pool'

// Allowed MIME types for photo uploads
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function createStudentsService() {
  const studentsRepo: StudentsRepository = createStudentsRepository(pool)


  async function list(query: ListStudentsQuery) {
    const result = await studentsRepo.list(query)
    return ok(result.data.map(enrichWithPhotoUrl), result.meta as unknown as Record<string, unknown>)
  }

  async function getById(id: number) {
    const student = await studentsRepo.findById(id)
    if (!student) throw Errors.notFound('Student')
    return ok(enrichWithPhotoUrl(student))
  }

  async function create(
    input: CreateStudentInput,
    photoFile?: { filename: string; mimetype: string; buffer: Buffer },
  ) {
    let photo_path: string | undefined

    if (photoFile) {
      if (!ALLOWED_MIME_TYPES.has(photoFile.mimetype)) {
        throw Errors.badRequest('Photo must be JPEG, PNG, or WebP')
      }
      const ext = photoFile.mimetype.split('/')[1].replace('jpeg', 'jpg')
      const filename = `${uuidv4()}.${ext}`
      await writeFile(path.join(env.UPLOAD_DIR, filename), photoFile.buffer)
      photo_path = filename
    }

    try {
      const student = await withTransaction(async (client) => {
        const txStudentsRepo = createStudentsRepository(client)
        const txLogsRepo = createLogsRepository(client)

        const s = await txStudentsRepo.create({ ...input, photo_path })
        await txLogsRepo.insert({
          action: 'CREATE',
          student_id: s.id,
          student_name: s.name,
          admission_no: s.admission_no,
          changes: { created: input },
        })
        return s
      })

      return ok(enrichWithPhotoUrl(student))
    } catch (error) {
      if (photo_path) {
        await unlink(path.join(env.UPLOAD_DIR, photo_path)).catch(() => {})
      }
      throw error
    }
  }

  async function update(
    id: number,
    input: UpdateStudentInput,
    photoFile?: { filename: string; mimetype: string; buffer: Buffer },
  ) {
    const existing = await studentsRepo.findById(id)
    if (!existing) throw Errors.notFound('Student')

    let newPhotoPath: string | undefined

    if (photoFile) {
      if (!ALLOWED_MIME_TYPES.has(photoFile.mimetype)) {
        throw Errors.badRequest('Photo must be JPEG, PNG, or WebP')
      }
      const ext = photoFile.mimetype.split('/')[1].replace('jpeg', 'jpg')
      newPhotoPath = `${uuidv4()}.${ext}`
      await writeFile(path.join(env.UPLOAD_DIR, newPhotoPath), photoFile.buffer)
    }

    try {
      const updated = await withTransaction(async (client) => {
        const txStudentsRepo = createStudentsRepository(client)
        const txLogsRepo = createLogsRepository(client)

        const u = await txStudentsRepo.update(id, { ...input, photo_path: newPhotoPath })
        if (!u) throw Errors.notFound('Student')

        await txLogsRepo.insert({
          action: 'UPDATE',
          student_id: u.id,
          student_name: u.name,
          admission_no: u.admission_no,
          changes: { before: existing, after: u },
        })
        return u
      })

      // Clean up old photo only after database transaction succeeds
      if (newPhotoPath && existing.photo_path) {
        await unlink(path.join(env.UPLOAD_DIR, existing.photo_path)).catch(() => {})
      }

      return ok(enrichWithPhotoUrl(updated))
    } catch (error) {
      if (newPhotoPath) {
        await unlink(path.join(env.UPLOAD_DIR, newPhotoPath)).catch(() => {})
      }
      throw error
    }
  }

  async function remove(id: number) {
    const student = await withTransaction(async (client) => {
      const txStudentsRepo = createStudentsRepository(client)
      const txLogsRepo = createLogsRepository(client)

      const s = await txStudentsRepo.remove(id)
      if (!s) throw Errors.notFound('Student')

      await txLogsRepo.insert({
        action: 'DELETE',
        student_id: s.id,
        student_name: s.name,
        admission_no: s.admission_no,
      })
      return s
    })

    // Clean up photo from disk only after database transaction succeeds
    if (student.photo_path) {
      await unlink(path.join(env.UPLOAD_DIR, student.photo_path)).catch(() => {})
    }

    return ok({ id: student.id, admission_no: student.admission_no })
  }

  async function getCourses() {
    const courses = await studentsRepo.getDistinctCourses()
    return ok(courses)
  }

  return { list, getById, create, update, remove, getCourses }
}

// ── Helpers ───────────────────────────────────────────────────
function enrichWithPhotoUrl<T extends { photo_path: string | null }>(
  student: T,
): T & { photo_url: string | null } {
  return {
    ...student,
    photo_url: student.photo_path
      ? `/uploads/${student.photo_path}`
      : null,
  }
}
