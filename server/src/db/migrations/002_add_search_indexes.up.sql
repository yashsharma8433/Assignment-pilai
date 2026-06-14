-- ─────────────────────────────────────────────────────────────
--  Migration: 002_add_search_indexes
--  Creates GIN trigram indexes on email and admission_no for
--  high-performance partial search (ILIKE '%search%')
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_students_admission_no_trgm
  ON students USING gin (admission_no gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_students_email_trgm
  ON students USING gin (email gin_trgm_ops);
