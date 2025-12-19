// types/stats.js - Tipos para el motor de estadísticas

export const STAT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly', 
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ALL_TIME: 'all_time'
};

export const GAME_TYPES = {
  INDIVIDUAL: '1v1',
  DUPLA: '2v2',
  TRIO: '3v3'
};

// Estructura de estadísticas de usuario
export const USER_STATS_STRUCTURE = {
  // Básicas
  games_played: 0,
  games_won: 0,
  games_lost: 0,
  win_rate: 0.00,
  
  // Rachas
  current_streak: 0,
  longest_win_streak: 0,
  longest_lose_streak: 0,
  
  // Puntos
  total_points_scored: 0,
  total_points_conceded: 0,
  avg_points_per_game: 0.00,
  
  // Métricas avanzadas (según UX flow)
  avg_points_in_losses: 0.00, // "qué tan cerca llegás"
  avg_opponent_points: 0.00,   // "a cuánto los dejás"
  comeback_games: 0,           // victorias desde atrás
  choke_games: 0,              // derrotas desde adelante
  pressure_performance: 0.00,  // % victoria cuando rival está a 29
  clutch_wins: 0,              // victorias en pressure
  
  // Patrones temporales  
  best_day_of_week: null,      // 0-6 (domingo=0)
  best_hour_of_day: null,      // 0-23
  worst_day_of_week: null,
  worst_hour_of_day: null,
  
  // Patrones de dominancia
  shutouts_given: 0,           // "dormiste afuera" (<15 puntos)
  shutouts_received: 0,        // "te durmieron"
  close_games: 0,              // partidos cerrados (25-30 puntos)
  blowout_wins: 0,             // goleadas propinadas (30-10 o menos)
  
  // Oponentes
  favorite_victim: null,       // oponente más dominado
  kryptonite: null,           // "tu papá del truco"
  most_played_opponent: null,  // rival más frecuente
  
  // Meta
  stats_version: 1,
  last_calculation_at: null
};

// Estructura de estadísticas de rivalidad
export const RIVALRY_STATS_STRUCTURE = {
  // Identificación
  user1_id: null,
  user2_id: null,
  user1_name: '',
  user2_name: '',
  
  // Estadísticas head-to-head
  user1_wins: 0,
  user2_wins: 0,
  total_games: 0,
  user1_win_rate: 0.00,
  
  // Rachas actuales
  current_streak_holder: null, // 'user1' | 'user2' | null
  current_streak_length: 0,
  longest_streak_holder: null,
  longest_streak_length: 0,
  
  // Puntos históricos
  user1_total_points: 0,
  user2_total_points: 0,
  user1_avg_points: 0.00,
  user2_avg_points: 0.00,
  
  // Características de los juegos
  close_games: 0,              // diferencia <= 5
  blowouts: 0,                 // diferencia >= 15
  shutouts: 0,                 // alguno < 15
  avg_game_duration: 0,        // ms
  
  // Temporal
  first_game_at: null,
  last_game_at: null,
  games_this_month: 0,
  
  // Contexto
  most_common_total_points: 30, // 16, 24, 30
  user1_comeback_wins: 0,       // victorias desde atrás
  user2_comeback_wins: 0
};

// Estructura de estadísticas de juego individual
export const GAME_STATS_STRUCTURE = {
  game_id: null,
  user_id: null,
  
  // Resultado básico
  is_win: false,
  points_scored: 0,
  points_conceded: 0,
  point_difference: 0,
  total_points: 30,
  duration_ms: 0,
  
  // Características del juego
  is_shutout_given: false,     // oponente < 15
  is_shutout_received: false,  // usuario < 15
  is_close_game: false,        // diff <= 5
  is_blowout: false,           // diff >= 15
  is_comeback: false,          // ganó desde atrás
  is_choke: false,             // perdió desde adelante
  
  // Métricas de rendimiento
  max_lead: 0,                 // máxima ventaja
  max_deficit: 0,              // máximo déficit
  lead_changes: 0,             // cambios de liderazgo
  pressure_situations: 0,      // veces que opp estuvo a 29
  pressure_wins: 0,            // victorias en pressure
  
  // Temporal
  played_at: null,
  day_of_week: 0,              // 0-6
  hour_of_day: 0               // 0-23
};

// Estructura de agregaciones temporales
export const TEMPORAL_AGGREGATION = {
  user_id: null,
  period_type: STAT_PERIODS.DAILY,
  period_start: null,
  period_end: null,
  
  // Stats básicas agregadas
  games_played: 0,
  games_won: 0,
  win_rate: 0.00,
  
  // Puntos agregados
  total_points_scored: 0,
  total_points_conceded: 0,
  avg_points_per_game: 0.00,
  
  // Performance agregada
  comeback_games: 0,
  clutch_wins: 0,
  blowout_wins: 0
};

// Estados para el context
export const STATS_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  CALCULATING: 'calculating',
  ERROR: 'error',
  SYNCING: 'syncing'
};