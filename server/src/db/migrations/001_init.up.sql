-- ─────────────────────────────────────────────────────────────
--  Migration: 001_init
--  Creates the core schema for the Student Management System
-- ─────────────────────────────────────────────────────────────

-- Admission number sequence (persists across restarts)
CREATE SEQUENCE IF NOT EXISTS admission_seq
  START 1 INCREMENT 1 NO MAXVALUE CACHE 1;

-- ── Students ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           SERIAL        PRIMARY KEY,
  admission_no VARCHAR(20)   NOT NULL UNIQUE,
  name         VARCHAR(100)  NOT NULL,
  course       VARCHAR(100)  NOT NULL,
  year         SMALLINT      NOT NULL CHECK (year BETWEEN 1 AND 6),
  dob          DATE          NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  mobile       VARCHAR(15)   NOT NULL,
  gender       VARCHAR(10)   NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  address      TEXT,
  photo_path   TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Performance indexes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_name_trgm
  ON students USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_students_email
  ON students (email);

CREATE INDEX IF NOT EXISTS idx_students_course
  ON students (course);

CREATE INDEX IF NOT EXISTS idx_students_year
  ON students (year);

CREATE INDEX IF NOT EXISTS idx_students_gender
  ON students (gender);

CREATE INDEX IF NOT EXISTS idx_students_created_at
  ON students (created_at DESC);

-- ── Activity log (bonus) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id           SERIAL       PRIMARY KEY,
  action       VARCHAR(10)  NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  student_id   INT,
  student_name VARCHAR(100),
  admission_no VARCHAR(20),
  changes      JSONB,
  performed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_student_id   ON activity_logs (student_id);
CREATE INDEX IF NOT EXISTS idx_logs_action        ON activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_logs_performed_at  ON activity_logs (performed_at DESC);

-- ── Auto-update updated_at trigger ───────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_updated_at();
