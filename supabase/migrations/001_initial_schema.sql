-- 001_initial_schema.sql - Initial database schema for Rey del Truco
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- USERS TABLE - Core user information
-- =================================================================
CREATE TABLE IF NOT EXISTS users (
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
-- GAMES TABLE - Game history and persistence  
-- =================================================================
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Game configuration
  player1_name VARCHAR(100) DEFAULT 'Nosotros',
  player2_name VARCHAR(100) DEFAULT 'Ellos',
  total_points INTEGER DEFAULT 30 CHECK (total_points IN (16, 24, 30)),
  
  -- Game state
  points_us INTEGER DEFAULT 0 CHECK (points_us >= 0),
  points_them INTEGER DEFAULT 0 CHECK (points_them >= 0),
  winner VARCHAR(10) CHECK (winner IN ('nos', 'ellos', NULL)),
  
  -- Game data (for complex state)
  game_data JSONB DEFAULT '{}', -- historial, falta envido moves, etc.
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  duration_minutes INTEGER, -- calculated duration
  is_practice BOOLEAN DEFAULT FALSE, -- practice games don't count for stats
  game_mode VARCHAR(20) DEFAULT 'standard' -- future: 'tournament', 'challenge'
);

-- =================================================================
-- USER_STATS TABLE - Aggregated statistics
-- =================================================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
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
  
  -- Rankings (for future use)
  current_rank INTEGER DEFAULT 0,
  highest_rank INTEGER DEFAULT 0,
  rank_points INTEGER DEFAULT 1000, -- ELO-style ranking
  
  -- Timestamps
  last_game_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_finished_at ON games(finished_at) WHERE finished_at IS NOT NULL;
CREATE INDEX idx_games_winner ON games(winner) WHERE winner IS NOT NULL;
CREATE INDEX idx_users_auth_uid ON users(auth_uid);

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid()::TEXT = auth_uid);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid()::TEXT = auth_uid);

-- Users can only manage their own games
CREATE POLICY "Users can view own games" ON games 
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

CREATE POLICY "Users can insert own games" ON games 
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

CREATE POLICY "Users can update own games" ON games 
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

CREATE POLICY "Users can delete own games" ON games 
  FOR DELETE USING (
    user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Users can only see and update their own stats
CREATE POLICY "Users can view own stats" ON user_stats 
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

CREATE POLICY "Users can update own stats" ON user_stats 
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

-- =================================================================
-- TRIGGERS AND FUNCTIONS
-- =================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user stats record when user is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_stats_trigger 
  AFTER INSERT ON users 
  FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- =================================================================
-- FUNCTION: Create or update user from auth
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =================================================================
-- HELPFUL QUERIES FOR DEVELOPMENT
-- =================================================================

-- View to see current user info
CREATE OR REPLACE VIEW current_user_info AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.created_at,
  us.games_played,
  us.games_won,
  us.win_percentage
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
WHERE u.auth_uid = auth.uid()::TEXT;

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Rey del Truco database schema created successfully!';
  RAISE NOTICE '📊 Tables created: users, games, user_stats';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '⚡ Triggers and functions configured';
  RAISE NOTICE '🎉 Database is ready for use!';
END $$;