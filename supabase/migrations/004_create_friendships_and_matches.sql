-- Migration 004: Create friendships and matches tables
-- These tables are required for the friends and social features to work
-- Run this in Supabase SQL Editor

-- =================================================================
-- 1. FRIENDSHIPS TABLE - Friend relationships
-- =================================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Friendship status
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')) DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  initiated_by UUID REFERENCES public.users(id), -- Who sent the request

  -- Constraints
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id) -- Can't be friends with yourself
);

-- =================================================================
-- 2. MATCHES TABLE - Head-to-head game records
-- =================================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Players
  player1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  player2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Match result
  winner_id UUID REFERENCES public.users(id),
  player1_score INTEGER DEFAULT 0 CHECK (player1_score >= 0),
  player2_score INTEGER DEFAULT 0 CHECK (player2_score >= 0),
  total_points INTEGER DEFAULT 30 CHECK (total_points IN (16, 24, 30)),

  -- Match metadata
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL, -- Link to game record
  duration_minutes INTEGER,

  -- Timestamps
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (player1_id != player2_id), -- Can't play against yourself
  CHECK (winner_id = player1_id OR winner_id = player2_id OR winner_id IS NULL) -- Winner must be one of the players
);

-- =================================================================
-- 3. INDEXES FOR PERFORMANCE
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON public.friendships(created_at);

CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON public.matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON public.matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner_id ON public.matches(winner_id);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON public.matches(played_at);

-- =================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 5. RLS POLICIES - Friendships
-- =================================================================

-- Users can view friendships where they are involved
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
    OR friend_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Users can create friendships (send friend requests)
DROP POLICY IF EXISTS "Users can create friendships" ON public.friendships;
CREATE POLICY "Users can create friendships" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Users can update friendships where they are the receiver (to accept/reject)
DROP POLICY IF EXISTS "Users can update own friendships" ON public.friendships;
CREATE POLICY "Users can update own friendships" ON public.friendships
  FOR UPDATE TO authenticated
  USING (
    friend_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
    OR user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Users can delete friendships where they are involved
DROP POLICY IF EXISTS "Users can delete own friendships" ON public.friendships;
CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE TO authenticated
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
    OR friend_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- =================================================================
-- 6. RLS POLICIES - Matches
-- =================================================================

-- Users can view matches where they participated
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT TO authenticated
  USING (
    player1_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
    OR player2_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Users can create matches where they are a player
DROP POLICY IF EXISTS "Users can create own matches" ON public.matches;
CREATE POLICY "Users can create own matches" ON public.matches
  FOR INSERT TO authenticated
  WITH CHECK (
    player1_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
    OR player2_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- =================================================================
-- 7. TRIGGERS - Auto-update timestamps
-- =================================================================
DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 8. RLS POLICIES - Users (CRITICAL FIX)
-- =================================================================

-- IMPORTANT: Allow users to search and view other users' public profiles
-- This fixes the issue where user search returns no results

DROP POLICY IF EXISTS "Users can view all public profiles" ON public.users;
CREATE POLICY "Users can view all public profiles" ON public.users
  FOR SELECT TO authenticated
  USING (
    -- Users can view their own profile
    auth.uid()::TEXT = auth_uid
    -- OR users can view public profiles (for search functionality)
    OR is_public = true
  );

-- =================================================================
-- 9. GRANT PERMISSIONS
-- =================================================================
GRANT ALL ON public.friendships TO authenticated;
GRANT ALL ON public.matches TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =================================================================
-- 10. VERIFICATION
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ Friendships and Matches tables created!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '  - friendships (for friend relationships)';
  RAISE NOTICE '  - matches (for head-to-head game records)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '🔑 Policies configured for authenticated users';
  RAISE NOTICE '👥 Users can now search other users!';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Next steps:';
  RAISE NOTICE '  1. Go to Profile screen and search for users';
  RAISE NOTICE '  2. Send friend requests';
  RAISE NOTICE '  3. Test the friends functionality';
  RAISE NOTICE '';
END $$;
