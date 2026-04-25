-- Migration: add daily reading cache columns to profiles
-- Stage 3 Batch 1 — personalized daily almanac

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_reading        JSONB  NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_reading_status TEXT   NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_reading_error  TEXT   NULL;

-- daily_reading stores: { date: "YYYY-MM-DD", content: "markdown string", poem: string[4] }
-- daily_reading_status: 'pending' | 'generating' | 'done' | 'failed'
-- Cache valid for calendar day: check daily_reading->>'date' = current_date::text before regenerating
