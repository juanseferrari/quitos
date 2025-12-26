-- Migration 005: Disable RLS for development
-- This allows devImpersonate() to work without real Supabase auth session
-- IMPORTANT: Re-enable RLS before going to production!

-- =================================================================
-- DISABLE RLS FOR DEVELOPMENT
-- =================================================================

-- Friendships table - DISABLE RLS
ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;

-- Matches table - DISABLE RLS
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- Users table - DISABLE RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Games table - DISABLE RLS
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;

-- User stats table - DISABLE RLS
ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;

-- Game moves table - DISABLE RLS
ALTER TABLE public.game_moves DISABLE ROW LEVEL SECURITY;

-- Data migrations table - DISABLE RLS
ALTER TABLE public.data_migrations DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- VERIFICATION
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '⚠️  RLS DISABLED FOR DEVELOPMENT';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RLS disabled on:';
  RAISE NOTICE '  - friendships';
  RAISE NOTICE '  - matches';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - games';
  RAISE NOTICE '  - user_stats';
  RAISE NOTICE '  - game_moves';
  RAISE NOTICE '  - data_migrations';
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now use window.devImpersonate()';
  RAISE NOTICE '✅ Friend requests will work in localhost';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Re-enable RLS before production!';
  RAISE NOTICE '';
END $$;
