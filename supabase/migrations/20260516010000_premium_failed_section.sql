-- Add premium_failed_section column to compatibility_reports
-- Tracks which section caused a generation failure, enabling precise retry resumption.
-- Run once on each Supabase project (dev + prod).

alter table compatibility_reports
add column if not exists premium_failed_section text;
