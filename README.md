# 🎓 Student Management System

A full-stack Student Management System built with **React**, **Fastify**, and **PostgreSQL** — deployed with Docker Compose using Alpine-based containers for minimal storage.

---

## ✨ Features

### Core
- ✅ Add / Edit / Delete Students
- ✅ View student list with photo thumbnails
- ✅ Auto-generated unique Admission Numbers (`ADM-YYYY-NNNN`)
- ✅ Photo upload (JPEG, PNG, WebP · max 2MB)
- ✅ Frontend + backend validation

### Bonus
- 🔍 Search by name, email, admission number
- 🔎 Filter by course, year, gender
- 📊 Analytics dashboard (charts: course, year, gender, monthly trend)
- 📜 Activity log (CREATE / UPDATE / DELETE audit trail)
- 📄 Server-side pagination
- 🗂️ Sortable columns
- ⚡ GIN full-text indexes on PostgreSQL
- 📖 Auto-generated Swagger UI at `/docs`
- 🔒 Helmet security headers + rate limiting

---

## 🧰 Technology Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18 + Vite + TypeScript |
| State     | TanStack Query v5 + Zustand |
| Forms     | React Hook Form + Zod |
| Charts    | Recharts |
| Backend   | Fastify v4 + TypeScript |
| Database  | PostgreSQL 16 |
| Container | Docker Compose (Alpine images) |
| ORM       | None — raw SQL via `pg` |

---

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org) (v20 or higher)
- [Docker Desktop](https://www.docker.com) (or [OrbStack](https://orbstack.dev) on Mac) running in the background.

### 1. Extract & Open
If you received this project as a zip file, extract it completely.
Open your terminal and navigate to the root directory of the project (where this README is located):
```bash
cd path/to/Assignment
```

### 2. Configure Environment Variables
The application needs environment variables to set the ports and connect to the database.

```bash
# Copy the provided example environment variables to the server folder
cp .env.example server/.env
```

### 3. Start PostgreSQL Database
We use Docker to quickly spin up a PostgreSQL instance without requiring manual database installation. Make sure Docker Desktop is open and running on your machine.

```bash
# Start the database container in the background
docker compose up -d

# You can verify it's running via:
docker compose ps
```

### 4. Install Dependencies
Install the required Node packages for both the backend and frontend.

```bash
# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 5. Start the Application
You will need two separate terminal windows/tabs to run the backend and frontend simultaneously.

**Terminal 1 — Start the Backend:**
```bash
cd server
npm run dev
# Note: The backend automatically runs all database migrations and creates the required tables on startup.
# The API will run on http://localhost:5001
# You can view the Swagger API Documentation at http://localhost:5001/docs
```

**Terminal 2 — Start the Frontend:**
```bash
cd client
npm run dev
# The frontend will run on http://localhost:5173
```

### 6. Open the App
Visit **http://localhost:5173** in your web browser. 

The application is completely initialized and ready to use! You can freely add, edit, and search for students.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/students` | List students (search, filter, sort, paginate) |
| `GET` | `/api/v1/students/:id` | Get single student |
| `GET` | `/api/v1/students/courses` | Distinct course list |
| `POST` | `/api/v1/students` | Create student (multipart/form-data) |
| `PUT` | `/api/v1/students/:id` | Update student (multipart/form-data) |
| `DELETE` | `/api/v1/students/:id` | Delete student |
| `GET` | `/api/v1/analytics` | Aggregated statistics |
| `GET` | `/api/v1/logs` | Activity log (paginated) |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI |

### Query Parameters for `GET /api/v1/students`

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search on name, email, admission_no |
| `course` | string | Filter by course |
| `year` | integer | Filter by year (1–6) |
| `gender` | string | Filter by gender |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 10, max: 100) |
| `sort` | string | Column to sort by |
| `order` | string | `asc` or `desc` |

---

## 📁 Project Structure

```
Assignment/
├── client/                     ← React (Vite) frontend
│   └── src/
│       ├── api/                ← Axios API layer
│       ├── components/         ← Shared UI components
│       ├── features/           ← Feature modules (students, analytics, logs)
│       ├── pages/              ← Route pages
│       ├── store/              ← Zustand UI store
│       └── types/              ← TypeScript types
│
├── server/                     ← Fastify API
│   └── src/
│       ├── config/env.ts       ← Zod-validated env
│       ├── db/                 ← Pool + migrations
│       ├── modules/            ← students | analytics | logs
│       │   └── students/
│       │       ├── *.schema.ts     ← Zod validation
│       │       ├── *.repository.ts ← Raw SQL
│       │       ├── *.service.ts    ← Business logic
│       │       ├── *.controller.ts ← Request handling
│       │       └── *.routes.ts     ← Route registration
│       ├── plugins/            ← Fastify plugin wrappers
│       └── shared/             ← Error types + response envelope
│
├── docker-compose.yml          ← postgres:16-alpine
└── .env.example
```

---

## 🗄️ Database Schema

```sql
students (
  id SERIAL PK,
  admission_no VARCHAR(20) UNIQUE NOT NULL,  -- ADM-2026-0001
  name, course, year, dob, email UNIQUE,
  mobile, gender, address, photo_path,
  created_at, updated_at TIMESTAMPTZ
)

activity_logs (
  id, action (CREATE|UPDATE|DELETE),
  student_id, student_name, admission_no,
  changes JSONB, performed_at
)
```

---

## 🏗️ Architecture Highlights

- **Layered backend**: Routes → Controller → Service → Repository
- **No ORM**: Raw SQL with `pg` — full control, no magic
- **Crash-fast env validation**: Zod schema at startup
- **Graceful shutdown**: SIGTERM/SIGINT handlers drain connections
- **GIN indexes**: Fast ILIKE search on name/email
- **Auto `updated_at`**: PostgreSQL trigger — no app-layer bookkeeping
- **Atomic admission numbers**: DB sequence — no race conditions
