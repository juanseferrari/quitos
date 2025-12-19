-- Migration 002: Tables for game data storage and migration
-- Creates tables to store games and moves for authenticated users

-- Games table to store completed games
CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Game metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Players
    player1_name TEXT NOT NULL DEFAULT 'Nosotros',
    player2_name TEXT NOT NULL DEFAULT 'Ellos',
    
    -- Final scores
    player1_score INTEGER NOT NULL CHECK (player1_score >= 0 AND player1_score <= 50),
    player2_score INTEGER NOT NULL CHECK (player2_score >= 0 AND player2_score <= 50),
    
    -- Game settings
    total_points INTEGER NOT NULL CHECK (total_points IN (16, 24, 30)) DEFAULT 30,
    
    -- Winner
    winner TEXT NOT NULL CHECK (winner IN ('player1', 'player2', 'nosotros', 'ellos')),
    
    -- Game duration in minutes
    duration_minutes INTEGER DEFAULT 0,
    
    -- Metadata
    migrated_from_local BOOLEAN DEFAULT FALSE,
    original_local_timestamp BIGINT, -- For migrated games
    
    -- Indexes for performance
    created_at_idx TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game moves table to store individual scoring events
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

-- Migration tracking table
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

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_migrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games
CREATE POLICY "Users can view own games" 
ON public.games FOR SELECT 
TO authenticated
USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

CREATE POLICY "Users can insert own games" 
ON public.games FOR INSERT 
TO authenticated
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

-- RLS Policies for game_moves
CREATE POLICY "Users can view own game moves" 
ON public.game_moves FOR SELECT 
TO authenticated
USING (game_id IN (SELECT id FROM public.games WHERE user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)));

CREATE POLICY "Users can insert own game moves" 
ON public.game_moves FOR INSERT 
TO authenticated
WITH CHECK (game_id IN (SELECT id FROM public.games WHERE user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)));

-- RLS Policies for data_migrations
CREATE POLICY "Users can view own migrations" 
ON public.data_migrations FOR SELECT 
TO authenticated
USING (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

CREATE POLICY "Users can insert own migrations" 
ON public.data_migrations FOR INSERT 
TO authenticated
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS games_user_id_idx ON public.games(user_id);
CREATE INDEX IF NOT EXISTS games_created_at_idx ON public.games(created_at);
CREATE INDEX IF NOT EXISTS games_migrated_idx ON public.games(migrated_from_local);

CREATE INDEX IF NOT EXISTS game_moves_game_id_idx ON public.game_moves(game_id);
CREATE INDEX IF NOT EXISTS game_moves_timestamp_idx ON public.game_moves(timestamp_in_game);

CREATE INDEX IF NOT EXISTS data_migrations_user_id_idx ON public.data_migrations(user_id);

-- Grant permissions
GRANT ALL ON public.games TO authenticated;
GRANT ALL ON public.game_moves TO authenticated;
GRANT ALL ON public.data_migrations TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;