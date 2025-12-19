-- /src/config/database.sql - Rey del Truco Database Schema
-- This file contains the complete database schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- USERS TABLE - Core user information
-- =================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'google', -- 'google', 'apple'
  auth_uid TEXT, -- Provider-specific user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- User preferences
  preferred_points INTEGER DEFAULT 30, -- 16, 24, 30
  display_name VARCHAR(50),
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Privacy settings
  is_public BOOLEAN DEFAULT TRUE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  allow_challenges BOOLEAN DEFAULT TRUE
);

-- Row Level Security for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid()::TEXT = auth_uid);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid()::TEXT = auth_uid);

-- =================================================================
-- GAMES TABLE - Game history and persistence
-- =================================================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Game configuration
  player1_name VARCHAR(100) DEFAULT 'Nosotros',
  player2_name VARCHAR(100) DEFAULT 'Ellos',
  total_points INTEGER DEFAULT 30, -- 16, 24, 30
  
  -- Game state
  points_us INTEGER DEFAULT 0,
  points_them INTEGER DEFAULT 0,
  winner VARCHAR(10), -- 'nos' | 'ellos' | null for ongoing
  
  -- Game data (for complex state)
  game_data JSONB, -- historial, falta envido moves, etc.
  
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

-- Row Level Security for games
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own games" ON games 
  FOR ALL USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT));

-- Indexes for performance
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_finished_at ON games(finished_at) WHERE finished_at IS NOT NULL;
CREATE INDEX idx_games_winner ON games(winner) WHERE winner IS NOT NULL;

-- =================================================================
-- USER_STATS TABLE - Aggregated statistics
-- =================================================================
CREATE TABLE user_stats (
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
  
  -- Rankings
  current_rank INTEGER DEFAULT 0,
  highest_rank INTEGER DEFAULT 0,
  rank_points INTEGER DEFAULT 1000, -- ELO-style ranking
  
  -- Timestamps
  last_game_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for user_stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON user_stats 
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT));

CREATE POLICY "Users can update own stats" ON user_stats 
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT));

-- =================================================================
-- ACHIEVEMENTS SYSTEM
-- =================================================================

-- Achievement definitions
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'first_win', 'streak_5'
  category VARCHAR(30) NOT NULL, -- 'victorias', 'puntos', 'racha', 'especiales', 'maestria'
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🏆',
  difficulty VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  points INTEGER DEFAULT 10, -- achievement points
  
  -- Unlock criteria (JSONB for flexibility)
  criteria JSONB NOT NULL, -- { "type": "games_won", "value": 1 }
  
  -- Metadata
  is_secret BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievement unlocks
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) REFERENCES achievements(id),
  
  -- Unlock information
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB, -- current progress towards achievement
  
  -- Metadata
  game_id UUID REFERENCES games(id), -- game where it was unlocked
  
  UNIQUE(user_id, achievement_id)
);

-- Row Level Security for achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements 
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT));

-- =================================================================
-- SOCIAL FEATURES
-- =================================================================

-- Friendships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(requester_id, addressee_id)
);

-- Prevent self-friendship
ALTER TABLE friendships ADD CONSTRAINT no_self_friendship 
  CHECK (requester_id != addressee_id);

-- Row Level Security for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships" ON friendships 
  FOR SELECT USING (
    requester_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT) OR
    addressee_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
  );

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenged_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Challenge details
  challenge_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'best_of_3', 'speed'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'expired'
  
  -- Game configuration
  total_points INTEGER DEFAULT 30,
  message TEXT,
  
  -- Results
  game_id UUID REFERENCES games(id), -- when challenge is completed
  winner_id UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security for challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges" ON challenges 
  FOR SELECT USING (
    challenger_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT) OR
    challenged_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::TEXT)
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

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships 
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
-- SAMPLE ACHIEVEMENT DATA
-- =================================================================

-- Insert basic achievements
INSERT INTO achievements (id, category, name, description, icon, difficulty, points, criteria) VALUES
('first_win', 'victorias', 'Primera Victoria', 'Ganá tu primer partido', '🎯', 'bronze', 10, '{"type": "games_won", "value": 1}'),
('win_streak_3', 'racha', 'Racha de 3', 'Ganá 3 partidos seguidos', '🔥', 'silver', 25, '{"type": "win_streak", "value": 3}'),
('win_streak_5', 'racha', 'Imparable', 'Ganá 5 partidos seguidos', '⚡', 'gold', 50, '{"type": "win_streak", "value": 5}'),
('points_100', 'puntos', 'Centurión', 'Anotá 100 puntos en total', '💯', 'bronze', 15, '{"type": "total_points", "value": 100}'),
('perfect_30', 'especiales', 'Perfecto', 'Ganá 30-0', '🎯', 'gold', 75, '{"type": "perfect_game", "value": true}'),
('falta_master', 'maestria', 'Maestro de la Falta', 'Ganá 10 faltas envido', '🃏', 'silver', 30, '{"type": "falta_envidos_won", "value": 10}');

-- =================================================================
-- USEFUL QUERIES AND VIEWS
-- =================================================================

-- View for user rankings
CREATE VIEW user_rankings AS
SELECT 
  u.id,
  u.name,
  u.display_name,
  u.avatar_url,
  us.games_played,
  us.games_won,
  us.win_percentage,
  us.current_win_streak,
  us.rank_points,
  us.current_rank,
  ROW_NUMBER() OVER (ORDER BY us.rank_points DESC, us.games_won DESC) as calculated_rank
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE u.is_public = true
  AND us.games_played >= 3; -- Minimum games to appear in rankings

-- Function to calculate win percentage
CREATE OR REPLACE FUNCTION calculate_win_percentage(won INTEGER, total INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF total = 0 THEN
    RETURN 0.00;
  END IF;
  RETURN ROUND((won::DECIMAL / total::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================

-- User search indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name) WHERE name IS NOT NULL;
CREATE INDEX idx_users_public ON users(is_public) WHERE is_public = true;

-- Achievement indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- Friendship indexes
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Challenge indexes
CREATE INDEX idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_expires_at ON challenges(expires_at);

COMMENT ON TABLE users IS 'Core user profiles and authentication data';
COMMENT ON TABLE games IS 'Game history and real-time game state persistence';
COMMENT ON TABLE user_stats IS 'Aggregated user statistics for performance';
COMMENT ON TABLE achievements IS 'Achievement definitions and criteria';
COMMENT ON TABLE user_achievements IS 'User achievement unlocks and progress';
COMMENT ON TABLE friendships IS 'Friend relationships between users';
COMMENT ON TABLE challenges IS 'Game challenges between users';