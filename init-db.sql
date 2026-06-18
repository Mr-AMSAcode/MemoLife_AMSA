-- ────────────────────────────────
-- MemoLife PostgreSQL Init Script
-- ────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database user (if not already exists)
-- Note: This is typically done via environment variables in docker-compose
-- but can be duplicated here for consistency

-- Log initialization
SELECT NOW() as initialization_time;
