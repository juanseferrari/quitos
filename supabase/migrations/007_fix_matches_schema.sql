-- Migration 007: Fix matches table schema
-- 1. Remove duplicate score columns (team_nosotros_score, team_ellos_score)
-- 2. Keep only score_nosotros and score_ellos
-- 3. Add notas column

-- =================================================================
-- 1. DROP DUPLICATE SCORE COLUMNS
-- =================================================================
ALTER TABLE public.matches DROP COLUMN IF EXISTS team_nosotros_score CASCADE;
ALTER TABLE public.matches DROP COLUMN IF EXISTS team_ellos_score CASCADE;

-- =================================================================
-- 2. ENSURE CORRECT SCORE COLUMNS EXIST
-- =================================================================
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS score_nosotros INTEGER DEFAULT 0 CHECK (score_nosotros >= 0);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS score_ellos INTEGER DEFAULT 0 CHECK (score_ellos >= 0);

-- =================================================================
-- 3. ADD NOTAS COLUMN
-- =================================================================
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS notas TEXT;

-- =================================================================
-- 4. VERIFICATION
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ Matches schema fixed!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Changes made:';
  RAISE NOTICE '  ❌ Removed: team_nosotros_score, team_ellos_score';
  RAISE NOTICE '  ✅ Kept: score_nosotros, score_ellos';
  RAISE NOTICE '  ✅ Added: notas (TEXT)';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Ready to save matches with correct schema!';
  RAISE NOTICE '';
END $$;
