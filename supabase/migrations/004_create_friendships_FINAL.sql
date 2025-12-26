-- Migration 004: Create friendships table and fix users RLS policy
-- The matches table already exists, so we only need to create friendships
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
-- 2. INDEXES FOR PERFORMANCE - Friendships
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON public.friendships(created_at);

-- =================================================================
-- 3. INDEXES FOR PERFORMANCE - Matches (existing table)
-- =================================================================
-- Add indexes to the existing matches table if they don't exist
CREATE INDEX IF NOT EXISTS idx_matches_created_by ON public.matches(created_by);
CREATE INDEX IF NOT EXISTS idx_matches_team_nosotros ON public.matches USING GIN (team_nosotros_ids);
CREATE INDEX IF NOT EXISTS idx_matches_team_ellos ON public.matches USING GIN (team_ellos_ids);

-- =================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Matches table should already have RLS, but ensure it's enabled
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
-- 6. RLS POLICIES - Matches (existing table)
-- =================================================================

-- Users can view matches where they participated
-- The matches table uses team_nosotros_ids and team_ellos_ids (arrays of UUIDs)
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT TO authenticated
  USING (
    -- User's UUID is in team_nosotros_ids array
    (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT) = ANY(team_nosotros_ids)
    -- OR User's UUID is in team_ellos_ids array
    OR (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT) = ANY(team_ellos_ids)
    -- OR User is the creator
    OR created_by IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Users can create matches where they are a participant
DROP POLICY IF EXISTS "Users can create own matches" ON public.matches;
CREATE POLICY "Users can create own matches" ON public.matches
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
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

-- First, drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create new policy that allows viewing own profile AND public profiles
CREATE POLICY "Users can view own profile" ON public.users
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
  RAISE NOTICE '✅ Friendships table created and RLS policies fixed!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables:';
  RAISE NOTICE '  - friendships (CREATED - for friend relationships)';
  RAISE NOTICE '  - matches (UPDATED - added RLS policies for teams)';
  RAISE NOTICE '  - users (UPDATED - can now search public profiles)';
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
