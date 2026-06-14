import { FastifyRequest, FastifyReply } from 'fastify'
import { createStudentsService } from './students.service'
import {
  createStudentSchema,
  listStudentsQuerySchema,
  updateStudentSchema,
} from './students.schema'
import { Errors } from '../../shared/errors'
import { env } from '../../config/env'

const service = createStudentsService()

// ── List ──────────────────────────────────────────────────────
export async function listStudents(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const query = listStudentsQuerySchema.parse(req.query)
  const result = await service.list(query)
  reply.send(result)
}

// ── Get by ID ─────────────────────────────────────────────────
export async function getStudent(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) throw Errors.badRequest('Invalid student ID')
  const result = await service.getById(id)
  reply.send(result)
}

// ── Create (multipart) ────────────────────────────────────────
export async function createStudent(
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const fields: Record<string, string> = {}
  let photoFile:
    | { filename: string; mimetype: string; buffer: Buffer }
    | undefined

  const parts = req.parts()
  for await (const part of parts) {
    if (part.type === 'file') {
      // Guard: check size before buffering
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of part.file) {
        size += chunk.length
        if (size > env.MAX_UPLOAD_SIZE_BYTES) {
          throw Errors.badRequest(
            `File too large. Max allowed: ${env.MAX_UPLOAD_SIZE_MB}MB`,
          )
        }
        chunks.push(chunk)
      }
      photoFile = {
        filename: part.filename,
        mimetype: part.mimetype,
        buffer: Buffer.concat(chunks),
      }
    } else {
      fields[part.fieldname] = part.value as string
    }
  }

  const input = createStudentSchema.parse(fields)
  const result = await service.create(input, photoFile)
  reply.status(201).send(result)
}

// ── Update (multipart) ────────────────────────────────────────
export async function updateStudent(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) throw Errors.badRequest('Invalid student ID')

  const fields: Record<string, string> = {}
  let photoFile:
    | { filename: string; mimetype: string; buffer: Buffer }
    | undefined

  const parts = req.parts()
  for await (const part of parts) {
    if (part.type === 'file') {
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of part.file) {
        size += chunk.length
        if (size > env.MAX_UPLOAD_SIZE_BYTES) {
          throw Errors.badRequest(
            `File too large. Max allowed: ${env.MAX_UPLOAD_SIZE_MB}MB`,
          )
        }
        chunks.push(chunk)
      }
      photoFile = {
        filename: part.filename,
        mimetype: part.mimetype,
        buffer: Buffer.concat(chunks),
      }
    } else {
      fields[part.fieldname] = part.value as string
    }
  }

  const input = updateStudentSchema.parse(fields)
  const result = await service.update(id, input, photoFile)
  reply.send(result)
}

// ── Delete ────────────────────────────────────────────────────
export async function deleteStudent(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) throw Errors.badRequest('Invalid student ID')
  const result = await service.remove(id)
  reply.send(result)
}

// ── Distinct courses ──────────────────────────────────────────
export async function getCourses(
  _req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = await service.getCourses()
  reply.send(result)
}
