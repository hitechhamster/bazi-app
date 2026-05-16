-- compatibility_reports: stores marriage compatibility analyses
-- Each row represents one report (free or premium tier)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TABLE IF NOT EXISTS compatibility_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Report tier: free (Flash-lite, 1 prompt) or premium (Pro, 6 sectional chapters)
  tier text NOT NULL CHECK (tier IN ('free', 'premium')),
  -- Optional links to user's profile library (nullable: partners can be filled in ad-hoc)
  partner_a_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  partner_b_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  -- Frozen snapshots of the input data (immune to later profile edits/deletions)
  -- Each contains: { name, gender, birthDate, birthTime, isTimeUnknown, longitude, timezoneOffsetSec, locationName }
  partner_a_data jsonb NOT NULL,
  partner_b_data jsonb NOT NULL,
  -- Derived bazi data for both partners (full BaziPartnerData shape)
  -- Stored to avoid recomputation when building prompts
  bazi_a jsonb NOT NULL,
  bazi_b jsonb NOT NULL,
  -- Six-dimension scores + total + level
  scores jsonb NOT NULL,
  -- Locale used for the AI prompt and UI rendering
  locale text NOT NULL DEFAULT 'en',
  -- Free tier: single Flash-lite output
  free_report_text text,
  free_report_status text NOT NULL DEFAULT 'pending'
    CHECK (free_report_status IN ('pending', 'generating', 'completed', 'failed')),
  -- Premium tier: 6 chapters, each generated independently and persisted on completion
  premium_overview text,
  premium_compatibility text,
  premium_communication text,
  premium_wealth_career text,
  premium_love_marriage text,
  premium_forecast text,
  premium_status text NOT NULL DEFAULT 'pending'
    CHECK (premium_status IN ('pending', 'generating', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS compatibility_reports_user_created_idx
  ON compatibility_reports (user_id, created_at DESC);
-- For quota counting by tier
CREATE INDEX IF NOT EXISTS compatibility_reports_user_tier_created_idx
  ON compatibility_reports (user_id, tier, created_at DESC);
CREATE TRIGGER set_compatibility_reports_updated_at
  BEFORE UPDATE ON compatibility_reports
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
ALTER TABLE compatibility_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own compatibility reports"
  ON compatibility_reports FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compatibility reports"
  ON compatibility_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compatibility reports"
  ON compatibility_reports FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own compatibility reports"
  ON compatibility_reports FOR DELETE
  USING (auth.uid() = user_id);
