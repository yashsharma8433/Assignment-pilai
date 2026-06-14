import { FastifyInstance } from 'fastify'
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getCourses,
} from './students.controller'

export default async function studentRoutes(app: FastifyInstance) {
  // GET /api/v1/students
  app.get('/students', {
    schema: {
      tags: ['Students'],
      summary: 'List all students with search, filter, sort, pagination',
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          course: { type: 'string' },
          year: { type: 'integer', minimum: 1, maximum: 6 },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 },
          sort: { type: 'string', default: 'created_at' },
          order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        },
      },
    },
    handler: listStudents,
  })

  // GET /api/v1/students/courses
  app.get('/students/courses', {
    schema: {
      tags: ['Students'],
      summary: 'Get distinct course names for filter dropdown',
    },
    handler: getCourses,
  })

  // GET /api/v1/students/:id
  app.get('/students/:id', {
    schema: {
      tags: ['Students'],
      summary: 'Get a single student by ID',
      params: { type: 'object', properties: { id: { type: 'string' } } },
    },
    handler: getStudent,
  })

  // POST /api/v1/students (multipart/form-data)
  app.post('/students', {
    schema: {
      tags: ['Students'],
      summary: 'Create a new student (multipart form with optional photo)',
      consumes: ['multipart/form-data'],
    },
    handler: createStudent,
  })

  // PUT /api/v1/students/:id (multipart/form-data)
  app.put('/students/:id', {
    schema: {
      tags: ['Students'],
      summary: 'Update a student (multipart form with optional photo)',
      consumes: ['multipart/form-data'],
      params: { type: 'object', properties: { id: { type: 'string' } } },
    },
    handler: updateStudent,
  })

  // DELETE /api/v1/students/:id
  app.delete('/students/:id', {
    schema: {
      tags: ['Students'],
      summary: 'Delete a student and their photo',
      params: { type: 'object', properties: { id: { type: 'string' } } },
    },
    handler: deleteStudent,
  })
}
