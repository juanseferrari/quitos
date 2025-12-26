-- Migration 003: Sample data for testing friendships and matches
-- Run this in Supabase SQL Editor
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID from the users table

-- =================================================================
-- FRIENDSHIPS - Sample data
-- =================================================================

-- First, let's get some user IDs for reference
-- Run this query first to see existing users:
-- SELECT id, email, display_name, name FROM users ORDER BY created_at;

-- Example friendships (replace UUIDs with actual user IDs from your database)
-- Make sure to use the ID from the users table, not the auth_uid

-- Friendship 1: You with test user
INSERT INTO friendships (user_id, friend_id, status, created_at)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  (SELECT id FROM users WHERE display_name = 'test' LIMIT 1),
  'accepted',
  NOW() - INTERVAL '5 days'
) ON CONFLICT DO NOTHING;

-- Friendship 2: You with test2 user
INSERT INTO friendships (user_id, friend_id, status, created_at)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  (SELECT id FROM users WHERE display_name = 'test2' LIMIT 1),
  'accepted',
  NOW() - INTERVAL '3 days'
) ON CONFLICT DO NOTHING;

-- Friendship 3: You with test3 user
INSERT INTO friendships (user_id, friend_id, status, created_at)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  (SELECT id FROM users WHERE display_name = 'test3' LIMIT 1),
  'accepted',
  NOW() - INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- Friendship 4: Pending friendship request from someone
INSERT INTO friendships (user_id, friend_id, status, created_at)
VALUES (
  (SELECT id FROM users WHERE display_name = 'test2' LIMIT 1),
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  'pending',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT DO NOTHING;

-- =================================================================
-- MATCHES - Sample data
-- =================================================================

-- Match 1: You + test vs test2 + test3 (Victory)
INSERT INTO matches (
  created_by,
  team_nosotros_ids,
  team_ellos_ids,
  total_points,
  score_nosotros,
  score_ellos,
  winner,
  notes,
  game_data,
  started_at,
  finished_at,
  duration_minutes
)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test' LIMIT 1)
  ],
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'test2' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test3' LIMIT 1)
  ],
  30,
  30,
  24,
  'nosotros',
  'Partidazo! Ganamos por 6 puntos',
  '{"historial": [{"accion": "+", "equipo": "nos", "puntoAnterior": 0, "puntoNuevo": 1}], "puntosTotales": 54}'::jsonb,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '45 minutes',
  45
) ON CONFLICT DO NOTHING;

-- Match 2: You vs test (Loss)
INSERT INTO matches (
  created_by,
  team_nosotros_ids,
  team_ellos_ids,
  total_points,
  score_nosotros,
  score_ellos,
  winner,
  notes,
  game_data,
  started_at,
  finished_at,
  duration_minutes
)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  ARRAY[(SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1)],
  ARRAY[(SELECT id FROM users WHERE display_name = 'test' LIMIT 1)],
  30,
  28,
  30,
  'ellos',
  'Casi ganamos, falta envido nos mató',
  '{"historial": [{"accion": "falta_envido", "equipo": "ellos"}], "puntosTotales": 58}'::jsonb,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '35 minutes',
  35
) ON CONFLICT DO NOTHING;

-- Match 3: test + test2 vs test3 + you (Victory - you in team_ellos)
INSERT INTO matches (
  created_by,
  team_nosotros_ids,
  team_ellos_ids,
  total_points,
  score_nosotros,
  score_ellos,
  winner,
  notes,
  game_data,
  started_at,
  finished_at,
  duration_minutes
)
VALUES (
  (SELECT id FROM users WHERE display_name = 'test' LIMIT 1),
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'test' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test2' LIMIT 1)
  ],
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'test3' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1)
  ],
  30,
  26,
  30,
  'ellos',
  'Revancha épica',
  '{"historial": [], "puntosTotales": 56}'::jsonb,
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours' + INTERVAL '50 minutes',
  50
) ON CONFLICT DO NOTHING;

-- Match 4: Ongoing match (no winner yet)
INSERT INTO matches (
  created_by,
  team_nosotros_ids,
  team_ellos_ids,
  total_points,
  score_nosotros,
  score_ellos,
  winner,
  notes,
  game_data,
  started_at,
  finished_at,
  duration_minutes
)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test2' LIMIT 1)
  ],
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'test' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test3' LIMIT 1)
  ],
  30,
  18,
  15,
  NULL,
  NULL,
  '{"historial": [{"accion": "+", "equipo": "nos"}], "puntosTotales": 33}'::jsonb,
  NOW() - INTERVAL '10 minutes',
  NULL,
  NULL
) ON CONFLICT DO NOTHING;

-- Match 5: You + test3 vs test + test2 (Victory with falta envido)
INSERT INTO matches (
  created_by,
  team_nosotros_ids,
  team_ellos_ids,
  total_points,
  score_nosotros,
  score_ellos,
  winner,
  notes,
  game_data,
  started_at,
  finished_at,
  duration_minutes
)
VALUES (
  (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'juanseferrari' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test3' LIMIT 1)
  ],
  ARRAY[
    (SELECT id FROM users WHERE display_name = 'test' LIMIT 1),
    (SELECT id FROM users WHERE display_name = 'test2' LIMIT 1)
  ],
  30,
  30,
  18,
  'nosotros',
  'Falta envido en la última mano salvó el partido',
  '{"historial": [{"accion": "falta_envido", "equipo": "nos", "puntosGanados": 8}], "puntosTotales": 48}'::jsonb,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '1 hour 5 minutes',
  65
) ON CONFLICT DO NOTHING;

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check friendships
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ Sample data inserted successfully!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  - Friendships created: %', (SELECT COUNT(*) FROM friendships);
  RAISE NOTICE '  - Matches created: %', (SELECT COUNT(*) FROM matches);
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Run these queries to verify:';
  RAISE NOTICE '  - SELECT * FROM friendships ORDER BY created_at DESC;';
  RAISE NOTICE '  - SELECT * FROM matches ORDER BY created_at DESC;';
  RAISE NOTICE '';
END $$;
