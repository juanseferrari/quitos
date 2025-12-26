-- SIMPLE: Add only the essential columns
-- Execute these commands one by one in Supabase SQL Editor

-- 1. Add missing columns to existing games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS migrated_from_local BOOLEAN DEFAULT FALSE;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS original_local_timestamp BIGINT;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

-- 2. Create game_moves table
CREATE TABLE IF NOT EXISTS public.game_moves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    move_number INTEGER NOT NULL,
    timestamp_in_game BIGINT NOT NULL,
    team TEXT NOT NULL,
    action TEXT NOT NULL,
    score_before INTEGER NOT NULL DEFAULT 0,
    score_after INTEGER NOT NULL DEFAULT 0,
    points_scored INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create data_migrations table
CREATE TABLE IF NOT EXISTS public.data_migrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migration_type TEXT NOT NULL DEFAULT 'local_games',
    local_games_count INTEGER NOT NULL DEFAULT 0,
    games_migrated INTEGER NOT NULL DEFAULT 0,
    moves_migrated INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    backup_data JSONB,
    UNIQUE(user_id, migration_type)
);

-- 4. Enable RLS
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_migrations ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON public.game_moves TO authenticated;
GRANT ALL ON public.data_migrations TO authenticated;