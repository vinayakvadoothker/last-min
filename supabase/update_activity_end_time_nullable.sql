-- ============================================
-- UPDATE ACTIVITY END TIME TO BE NULLABLE
-- ============================================
-- This allows activities to be created without an end time
-- Duration will be calculated if end time is provided, otherwise null

ALTER TABLE activities
ALTER COLUMN activity_end_time DROP NOT NULL;

