-- Add missing columns to existing games table
-- Execute this SQL in your Supabase SQL Editor

-- 1. Add missing columns to games table if they don't exist
DO $$ 
BEGIN
    -- Add migrated_from_local column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' 
        AND column_name = 'migrated_from_local'
    ) THEN
        ALTER TABLE public.games ADD COLUMN migrated_from_local BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add original_local_timestamp column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' 
        AND column_name = 'original_local_timestamp'
    ) THEN
        ALTER TABLE public.games ADD COLUMN original_local_timestamp BIGINT;
    END IF;
    
    -- Add duration_minutes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' 
        AND column_name = 'duration_minutes'
    ) THEN
        ALTER TABLE public.games ADD COLUMN duration_minutes INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create game_moves table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.game_moves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    
    -- Move details
    move_number INTEGER NOT NULL CHECK (move_number > 0),
    timestamp_in_game BIGINT NOT NULL, -- Milliseconds since game start
    
    -- Scoring team
    team TEXT NOT NULL CHECK (team IN ('nosotros', 'ellos', 'player1', 'player2')),
    
    -- Action type
    action TEXT NOT NULL CHECK (action IN ('+', '-', 'falta_envido')),
    
    -- Score before and after this move
    score_before INTEGER NOT NULL CHECK (score_before >= 0),
    score_after INTEGER NOT NULL CHECK (score_after >= 0),
    
    -- Points scored in this move
    points_scored INTEGER NOT NULL DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create data_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.data_migrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Migration metadata
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    migration_type TEXT NOT NULL DEFAULT 'local_games',
    
    -- Source data info
    local_games_count INTEGER NOT NULL DEFAULT 0,
    local_data_timestamp BIGINT,
    
    -- Migration results
    games_migrated INTEGER NOT NULL DEFAULT 0,
    moves_migrated INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'partial')) DEFAULT 'completed',
    error_message TEXT,
    
    -- Backup reference
    backup_data JSONB, -- Store original local data as backup
    
    UNIQUE(user_id, migration_type)
);

-- 4. Enable Row Level Security if not already enabled
DO $$ 
BEGIN
    ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.data_migrations ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if RLS is already enabled
END $$;

-- 5. Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own games" ON public.games;
DROP POLICY IF EXISTS "Users can insert own games" ON public.games;
DROP POLICY IF EXISTS "Users can view own game moves" ON public.game_moves;
DROP POLICY IF EXISTS "Users can insert own game moves" ON public.game_moves;
DROP POLICY IF EXISTS "Users can view own migrations" ON public.data_migrations;
DROP POLICY IF EXISTS "Users can insert own migrations" ON public.data_migrations;

-- 6. Create RLS Policies
CREATE POLICY "Users can view own games" 
ON public.games FOR SELECT 
TO authenticated
USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

CREATE POLICY "Users can insert own games" 
ON public.games FOR INSERT 
TO authenticated
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

CREATE POLICY "Users can view own game moves" 
ON public.game_moves FOR SELECT 
TO authenticated
USING (game_id IN (SELECT id FROM public.games WHERE user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)));

CREATE POLICY "Users can insert own game moves" 
ON public.game_moves FOR INSERT 
TO authenticated
WITH CHECK (game_id IN (SELECT id FROM public.games WHERE user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)));

CREATE POLICY "Users can view own migrations" 
ON public.data_migrations FOR SELECT 
TO authenticated
USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

CREATE POLICY "Users can insert own migrations" 
ON public.data_migrations FOR INSERT 
TO authenticated
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

-- 7. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS games_user_id_idx ON public.games(user_id);
CREATE INDEX IF NOT EXISTS games_created_at_idx ON public.games(created_at);
CREATE INDEX IF NOT EXISTS games_migrated_idx ON public.games(migrated_from_local);

CREATE INDEX IF NOT EXISTS game_moves_game_id_idx ON public.game_moves(game_id);
CREATE INDEX IF NOT EXISTS game_moves_timestamp_idx ON public.game_moves(timestamp_in_game);

CREATE INDEX IF NOT EXISTS data_migrations_user_id_idx ON public.data_migrations(user_id);

-- 8. Grant permissions
GRANT ALL ON public.games TO authenticated;
GRANT ALL ON public.game_moves TO authenticated;
GRANT ALL ON public.data_migrations TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 9. Create or replace view for game statistics
CREATE OR REPLACE VIEW public.user_game_stats AS
SELECT 
    g.user_id,
    COUNT(*) as total_games,
    COUNT(*) FILTER (WHERE g.winner = 'player1') as games_won,
    ROUND(
        (COUNT(*) FILTER (WHERE g.winner = 'player1')::FLOAT / COUNT(*)) * 100, 
        2
    ) as win_percentage,
    AVG(g.player1_score) as avg_score,
    AVG(g.player2_score) as avg_opponent_score,
    COUNT(*) FILTER (WHERE g.winner = 'player1' AND g.player2_score = 0) as shutouts_given,
    COUNT(*) FILTER (WHERE g.winner = 'player2' AND g.player1_score = 0) as shutouts_received,
    AVG(g.duration_minutes) as avg_duration_minutes
FROM public.games g
GROUP BY g.user_id;

-- Grant access to the view
GRANT SELECT ON public.user_game_stats TO authenticated;

-- Success message
SELECT 'Tables updated successfully! Missing columns added.' as status;