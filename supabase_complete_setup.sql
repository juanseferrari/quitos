-- =================================================================
-- REY DEL TRUCO - SUPABASE COMPLETE SETUP
-- =================================================================
-- Ejecutar este SQL en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New query > Pegar todo y ejecutar
-- =================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. USERS TABLE - Información de usuarios
-- =================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'google', -- 'google', 'apple'
  auth_uid TEXT UNIQUE, -- Supabase Auth UID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,

  -- User preferences
  preferred_points INTEGER DEFAULT 30 CHECK (preferred_points IN (16, 24, 30)),
  display_name VARCHAR(50),
  is_premium BOOLEAN DEFAULT FALSE,

  -- Privacy settings
  is_public BOOLEAN DEFAULT TRUE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  allow_challenges BOOLEAN DEFAULT TRUE
);

-- =================================================================
-- 2. GAMES TABLE - Historial de partidas
-- =================================================================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Game configuration
  player1_name VARCHAR(100) DEFAULT 'Nosotros',
  player2_name VARCHAR(100) DEFAULT 'Ellos',
  total_points INTEGER DEFAULT 30 CHECK (total_points IN (16, 24, 30)),

  -- Game state (compatible con ambas versiones)
  points_us INTEGER DEFAULT 0 CHECK (points_us >= 0),
  points_them INTEGER DEFAULT 0 CHECK (points_them >= 0),
  player1_score INTEGER DEFAULT 0 CHECK (player1_score >= 0),
  player2_score INTEGER DEFAULT 0 CHECK (player2_score >= 0),
  winner VARCHAR(20) CHECK (winner IN ('nos', 'ellos', 'player1', 'player2', NULL)),

  -- Game data (for complex state)
  game_data JSONB DEFAULT '{}',

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  duration_minutes INTEGER DEFAULT 0,
  is_practice BOOLEAN DEFAULT FALSE,
  game_mode VARCHAR(20) DEFAULT 'standard',
  migrated_from_local BOOLEAN DEFAULT FALSE,
  original_local_timestamp BIGINT
);

-- =================================================================
-- 3. USER_STATS TABLE - Estadísticas agregadas
-- =================================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  -- Game statistics
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  win_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Streak tracking
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  current_loss_streak INTEGER DEFAULT 0,

  -- Point statistics
  total_points_scored INTEGER DEFAULT 0,
  total_points_conceded INTEGER DEFAULT 0,
  average_points_per_game DECIMAL(5,2) DEFAULT 0.00,

  -- Falta Envido statistics
  falta_envidos_played INTEGER DEFAULT 0,
  falta_envidos_won INTEGER DEFAULT 0,

  -- Time statistics
  total_play_time_minutes INTEGER DEFAULT 0,
  average_game_duration DECIMAL(5,2) DEFAULT 0.00,

  -- Rankings
  current_rank INTEGER DEFAULT 0,
  highest_rank INTEGER DEFAULT 0,
  rank_points INTEGER DEFAULT 1000,

  -- Timestamps
  last_game_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- 4. GAME_MOVES TABLE - Movimientos individuales
-- =================================================================
CREATE TABLE IF NOT EXISTS public.game_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,

  -- Move details
  move_number INTEGER NOT NULL CHECK (move_number > 0),
  timestamp_in_game BIGINT NOT NULL,

  -- Scoring team
  team TEXT NOT NULL CHECK (team IN ('nosotros', 'ellos', 'player1', 'player2')),

  -- Action type
  action TEXT NOT NULL CHECK (action IN ('+', '-', 'falta_envido')),

  -- Score tracking
  score_before INTEGER NOT NULL CHECK (score_before >= 0),
  score_after INTEGER NOT NULL CHECK (score_after >= 0),
  points_scored INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- 5. DATA_MIGRATIONS TABLE - Tracking de migraciones
-- =================================================================
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
  backup_data JSONB,

  UNIQUE(user_id, migration_type)
);

-- =================================================================
-- 6. INDEXES - Para mejor performance
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON public.users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_finished_at ON public.games(finished_at) WHERE finished_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_winner ON public.games(winner) WHERE winner IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_migrated ON public.games(migrated_from_local);
CREATE INDEX IF NOT EXISTS idx_game_moves_game_id ON public.game_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_timestamp ON public.game_moves(timestamp_in_game);
CREATE INDEX IF NOT EXISTS idx_data_migrations_user_id ON public.data_migrations(user_id);

-- =================================================================
-- 7. ROW LEVEL SECURITY (RLS) - Seguridad
-- =================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_migrations ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 8. RLS POLICIES - Users
-- =================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::TEXT = auth_uid);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::TEXT = auth_uid);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::TEXT = auth_uid);

-- =================================================================
-- 9. RLS POLICIES - Games
-- =================================================================
DROP POLICY IF EXISTS "Users can view own games" ON public.games;
CREATE POLICY "Users can view own games" ON public.games
  FOR SELECT USING (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

DROP POLICY IF EXISTS "Users can insert own games" ON public.games;
CREATE POLICY "Users can insert own games" ON public.games
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

DROP POLICY IF EXISTS "Users can update own games" ON public.games;
CREATE POLICY "Users can update own games" ON public.games
  FOR UPDATE USING (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

DROP POLICY IF EXISTS "Users can delete own games" ON public.games;
CREATE POLICY "Users can delete own games" ON public.games
  FOR DELETE USING (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- =================================================================
-- 10. RLS POLICIES - User Stats
-- =================================================================
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth_uid = auth.uid()::TEXT)
  );

-- =================================================================
-- 11. RLS POLICIES - Game Moves
-- =================================================================
DROP POLICY IF EXISTS "Users can view own game moves" ON public.game_moves;
CREATE POLICY "Users can view own game moves" ON public.game_moves
  FOR SELECT TO authenticated
  USING (game_id IN (
    SELECT id FROM public.games WHERE user_id IN (
      SELECT id FROM public.users WHERE auth_uid = auth.uid()::text
    )
  ));

DROP POLICY IF EXISTS "Users can insert own game moves" ON public.game_moves;
CREATE POLICY "Users can insert own game moves" ON public.game_moves
  FOR INSERT TO authenticated
  WITH CHECK (game_id IN (
    SELECT id FROM public.games WHERE user_id IN (
      SELECT id FROM public.users WHERE auth_uid = auth.uid()::text
    )
  ));

-- =================================================================
-- 12. RLS POLICIES - Data Migrations
-- =================================================================
DROP POLICY IF EXISTS "Users can view own migrations" ON public.data_migrations;
CREATE POLICY "Users can view own migrations" ON public.data_migrations
  FOR SELECT TO authenticated
  USING (user_id IN (
    SELECT id FROM public.users WHERE auth_uid = auth.uid()::text
  ));

DROP POLICY IF EXISTS "Users can insert own migrations" ON public.data_migrations;
CREATE POLICY "Users can insert own migrations" ON public.data_migrations
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM public.users WHERE auth_uid = auth.uid()::text
  ));

-- =================================================================
-- 13. FUNCTIONS - Updated_at trigger
-- =================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =================================================================
-- 14. TRIGGERS - Auto-update timestamps
-- =================================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 15. FUNCTION - Create user stats automatically
-- =================================================================
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS create_user_stats_trigger ON public.users;
CREATE TRIGGER create_user_stats_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- =================================================================
-- 16. FUNCTION - Handle new auth user (auto-create profile)
-- =================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Extract name and avatar from raw_user_meta_data
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.users (id, email, name, avatar_url, auth_uid, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_avatar,
    NEW.id::TEXT,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email')
  )
  ON CONFLICT (auth_uid)
  DO UPDATE SET
    last_login = NOW(),
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =================================================================
-- 17. GRANT PERMISSIONS
-- =================================================================
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.games TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;
GRANT ALL ON public.game_moves TO authenticated;
GRANT ALL ON public.data_migrations TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =================================================================
-- 18. VIEW - Current user info
-- =================================================================
CREATE OR REPLACE VIEW public.current_user_info AS
SELECT
  u.id,
  u.email,
  u.name,
  u.avatar_url,
  u.created_at,
  us.games_played,
  us.games_won,
  us.win_percentage
FROM public.users u
LEFT JOIN public.user_stats us ON u.id = us.user_id
WHERE u.auth_uid = auth.uid()::TEXT;

GRANT SELECT ON public.current_user_info TO authenticated;

-- =================================================================
-- SUCCESS!
-- =================================================================
SELECT 'Rey del Truco database setup completed!' as status;
