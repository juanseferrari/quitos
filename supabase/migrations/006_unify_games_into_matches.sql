-- Migration 006: Unify games table into matches table
-- This migration adds missing columns to matches and drops the games table

-- =================================================================
-- 1. ADD MISSING COLUMNS TO MATCHES TABLE
-- =================================================================

-- Add score columns for both teams
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team_nosotros_score INTEGER DEFAULT 0 CHECK (team_nosotros_score >= 0);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team_ellos_score INTEGER DEFAULT 0 CHECK (team_ellos_score >= 0);

-- Add winner column
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS winner TEXT CHECK (winner IN ('nosotros', 'ellos', 'empate', NULL));

-- Add timestamp columns
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;

-- Add duration column
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Add updated_at column
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add game_data JSONB for storing historial and other metadata
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS game_data JSONB DEFAULT '{}';

-- =================================================================
-- 2. UPDATE EXISTING total_points COLUMN (if needed)
-- =================================================================
-- Ensure total_points has correct constraint
DO $$
BEGIN
  -- Drop existing constraint if exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'matches_total_points_check'
  ) THEN
    ALTER TABLE public.matches DROP CONSTRAINT matches_total_points_check;
  END IF;

  -- Add new constraint
  ALTER TABLE public.matches ADD CONSTRAINT matches_total_points_check
    CHECK (total_points IN (16, 24, 30));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- =================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_matches_winner ON public.matches(winner);
CREATE INDEX IF NOT EXISTS idx_matches_started_at ON public.matches(started_at);
CREATE INDEX IF NOT EXISTS idx_matches_finished_at ON public.matches(finished_at);

-- =================================================================
-- 4. ADD TRIGGER FOR UPDATED_AT
-- =================================================================
DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 5. DROP GAME_MOVES TABLE (no longer needed)
-- =================================================================
DROP TABLE IF EXISTS public.game_moves CASCADE;

-- =================================================================
-- 6. DROP GAMES TABLE (unified into matches)
-- =================================================================
DROP TABLE IF EXISTS public.games CASCADE;

-- =================================================================
-- 7. VERIFICATION
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ Tables unified successfully!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Changes made:';
  RAISE NOTICE '  ✅ matches table updated with:';
  RAISE NOTICE '     - team_nosotros_score, team_ellos_score';
  RAISE NOTICE '     - winner (nosotros/ellos/empate)';
  RAISE NOTICE '     - started_at, finished_at, duration_minutes';
  RAISE NOTICE '     - game_data (JSONB for historial)';
  RAISE NOTICE '  ❌ games table DROPPED';
  RAISE NOTICE '  ❌ game_moves table DROPPED';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Now use matches table for all game storage!';
  RAISE NOTICE '';
END $$;
