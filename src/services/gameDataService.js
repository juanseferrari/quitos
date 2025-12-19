// services/gameDataService.js - Service for managing game data in Supabase
import authService from './authService';
import { supabase } from '../config/supabase';

class GameDataService {
  constructor() {
    this.isConfigured = !!supabase;
  }

  // Save a completed game to Supabase
  async saveGame(gameData) {
    if (!this.isConfigured || authService.isMockMode()) {
      console.log('⚠️ Supabase not configured, skipping game save');
      return { success: false, reason: 'not_configured' };
    }

    try {
      // Get current user session
      const { session, user } = await authService.getSession();
      if (!session || !user) {
        throw new Error('User session not found');
      }

      // Transform game data to database format
      const dbGame = {
        user_id: user.id,
        player1_name: gameData.jugador1 || 'Nosotros',
        player2_name: gameData.jugador2 || 'Ellos',
        player1_score: gameData.puntosNos || 0,
        player2_score: gameData.puntosEllos || 0,
        total_points: gameData.puntosTotales || 30,
        winner: gameData.ganador === 'nos' ? 'player1' : 'player2',
        started_at: new Date(gameData.fechaInicio).toISOString(),
        finished_at: new Date(gameData.fechaFin).toISOString(),
        duration_minutes: Math.round((gameData.fechaFin - gameData.fechaInicio) / 60000),
        migrated_from_local: false
      };

      // Insert game
      const { data: insertedGame, error: gameError } = await supabase
        .from('games')
        .insert([dbGame])
        .select()
        .single();

      if (gameError) throw gameError;

      // Insert game moves if available
      if (gameData.historial && Array.isArray(gameData.historial)) {
        const dbMoves = gameData.historial.map((move, index) => ({
          game_id: insertedGame.id,
          move_number: index + 1,
          timestamp_in_game: move.timestamp - gameData.fechaInicio,
          team: move.equipo || 'player1',
          action: move.accion || '+',
          score_before: move.puntoAnterior || 0,
          score_after: move.puntoNuevo || 0,
          points_scored: (move.puntoNuevo || 0) - (move.puntoAnterior || 0)
        }));

        const { error: movesError } = await supabase
          .from('game_moves')
          .insert(dbMoves);

        if (movesError) {
          console.error('⚠️ Error saving moves:', movesError);
        }
      }

      console.log('✅ Game saved to Supabase:', insertedGame.id);
      return { success: true, gameId: insertedGame.id };

    } catch (error) {
      console.error('🔥 Error saving game:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's game statistics
  async getUserStats() {
    if (!this.isConfigured || authService.isMockMode()) {
      return null;
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) return null;

      // Get all games for user
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('finished_at', { ascending: false });

      if (error) throw error;

      if (!games || games.length === 0) {
        return {
          games_played: 0,
          games_won: 0,
          win_rate: 0,
          current_streak: 0,
          longest_win_streak: 0,
          avg_points_in_losses: 0,
          avg_opponent_points: 0,
          shutouts_given: 0,
          shutouts_received: 0,
          total_points_scored: 0,
          avg_game_duration: 0
        };
      }

      // Calculate statistics
      const stats = this.calculateStats(games);
      return stats;

    } catch (error) {
      console.error('🔥 Error getting user stats:', error);
      return null;
    }
  }

  // Get user's game history
  async getUserGames(limit = 50) {
    if (!this.isConfigured || authService.isMockMode()) {
      return [];
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) return [];

      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('finished_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return games || [];

    } catch (error) {
      console.error('🔥 Error getting user games:', error);
      return [];
    }
  }

  // Calculate statistics from games array
  calculateStats(games) {
    const totalGames = games.length;
    const gamesWon = games.filter(g => g.winner === 'player1').length;
    const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (const game of games) {
      if (game.winner === 'player1') {
        currentStreak++;
      } else {
        currentStreak--;
      }
      break; // Only look at most recent game for current streak
    }

    // Calculate longest win streak
    let longestWinStreak = 0;
    let currentWinStreak = 0;
    
    for (const game of games.slice().reverse()) { // Start from oldest
      if (game.winner === 'player1') {
        currentWinStreak++;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else {
        currentWinStreak = 0;
      }
    }

    // Calculate other stats
    const losses = games.filter(g => g.winner === 'player2');
    const avgPointsInLosses = losses.length > 0
      ? losses.reduce((sum, g) => sum + g.player1_score, 0) / losses.length
      : 0;

    const avgOpponentPoints = totalGames > 0
      ? games.reduce((sum, g) => sum + g.player2_score, 0) / totalGames
      : 0;

    const shutoutsGiven = games.filter(g => g.winner === 'player1' && g.player2_score === 0).length;
    const shutoutsReceived = games.filter(g => g.winner === 'player2' && g.player1_score === 0).length;

    const totalPointsScored = games.reduce((sum, g) => sum + g.player1_score, 0);
    const avgGameDuration = totalGames > 0
      ? games.reduce((sum, g) => sum + (g.duration_minutes || 0), 0) / totalGames
      : 0;

    return {
      games_played: totalGames,
      games_won: gamesWon,
      win_rate: winRate,
      current_streak: currentStreak,
      longest_win_streak: longestWinStreak,
      avg_points_in_losses: avgPointsInLosses,
      avg_opponent_points: avgOpponentPoints,
      shutouts_given: shutoutsGiven,
      shutouts_received: shutoutsReceived,
      total_points_scored: totalPointsScored,
      avg_game_duration: avgGameDuration
    };
  }

  // Check if user is authenticated and can use cloud features
  canUseCloudFeatures() {
    return this.isConfigured && !authService.isMockMode() && authService.isAuthenticated();
  }
}

// Create singleton instance
const gameDataService = new GameDataService();

export default gameDataService;