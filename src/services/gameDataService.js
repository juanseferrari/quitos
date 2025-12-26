// services/gameDataService.js - Service for managing game data in Supabase
import authService from './authService';
import { supabase } from '../config/supabase';

class GameDataService {
  constructor() {
    this.isConfigured = !!supabase;
  }

  // Save a completed game to Supabase
  async saveGame(gameData) {
    console.log('🔍 [saveGame] Starting save process...');
    console.log('🔍 [saveGame] isConfigured:', this.isConfigured);
    console.log('🔍 [saveGame] isMockMode:', authService.isMockMode());
    console.log('🔍 [saveGame] Raw gameData received:', JSON.stringify(gameData, null, 2));

    if (!this.isConfigured || authService.isMockMode()) {
      console.log('⚠️ Supabase not configured, skipping game save');
      return { success: false, reason: 'not_configured' };
    }

    try {
      // Get current user profile (works with devImpersonate)
      const userProfile = await authService.getUserProfile();
      console.log('🔍 [saveGame] User profile:', userProfile);

      if (!userProfile) {
        console.warn('⚠️ No user profile found, skipping game save');
        return { success: false, reason: 'no_user_profile' };
      }

      console.log('💾 Saving match for user:', userProfile.id);

      // Extract team IDs from gameData (Equipos2 mode)
      const teamNosotrosIds = gameData.teamNosotros && gameData.teamNosotros.length > 0
        ? gameData.teamNosotros.map(player => player.id)
        : [userProfile.id]; // Fallback to current user if no team data

      const teamEllosIds = gameData.teamEllos && gameData.teamEllos.length > 0
        ? gameData.teamEllos.map(player => player.id)
        : []; // Empty array if no opponent team

      console.log('👥 Team Nosotros IDs:', teamNosotrosIds);
      console.log('👥 Team Ellos IDs:', teamEllosIds);

      // Transform game data to matches table format
      const dbMatch = {
        created_by: userProfile.id,
        team_nosotros_ids: teamNosotrosIds,
        team_ellos_ids: teamEllosIds,
        score_nosotros: gameData.puntosNos || 0,
        score_ellos: gameData.puntosEllos || 0,
        total_points: gameData.puntosTotales || 30,
        winner: gameData.ganador === 'nos' ? 'nosotros' : 'ellos',
        started_at: new Date(gameData.fechaInicio).toISOString(),
        finished_at: new Date(gameData.fechaFin).toISOString(),
        duration_minutes: Math.round((gameData.fechaFin - gameData.fechaInicio) / 60000),
        notas: gameData.notas || null,
        game_data: {
          jugador1: gameData.jugador1 || 'Nosotros',
          jugador2: gameData.jugador2 || 'Ellos',
          historial: gameData.historial || [],
          teamNosotros: gameData.teamNosotros || [],
          teamEllos: gameData.teamEllos || []
        }
      };

      console.log('🔍 [saveGame] Transformed dbMatch object:', JSON.stringify(dbMatch, null, 2));

      // Insert match
      console.log('🔍 [saveGame] Calling Supabase insert...');
      const { data: insertedMatch, error: matchError } = await supabase
        .from('matches')
        .insert([dbMatch])
        .select()
        .single();

      console.log('🔍 [saveGame] Supabase response - data:', insertedMatch);
      console.log('🔍 [saveGame] Supabase response - error:', matchError);

      if (matchError) {
        console.error('❌ [saveGame] Match error details:', {
          message: matchError.message,
          details: matchError.details,
          hint: matchError.hint,
          code: matchError.code
        });
        throw matchError;
      }

      console.log('✅ Match saved to Supabase:', insertedMatch.id);
      console.log('✅ Full inserted match:', JSON.stringify(insertedMatch, null, 2));
      return { success: true, gameId: insertedMatch.id, matchId: insertedMatch.id };

    } catch (error) {
      console.error('🔥 Error saving game:', error);
      console.error('🔥 Error stack:', error.stack);
      console.error('🔥 Error details:', {
        message: error.message,
        name: error.name,
        code: error.code
      });
      return { success: false, error: error.message };
    }
  }

  // Get user's match statistics
  async getUserStats() {
    if (!this.isConfigured || authService.isMockMode()) {
      return null;
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) return null;

      // Get all matches where user participated
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .contains('team_nosotros_ids', [userProfile.id])
        .order('finished_at', { ascending: false });

      if (error) throw error;

      if (!matches || matches.length === 0) {
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
      const stats = this.calculateStats(matches);
      return stats;

    } catch (error) {
      console.error('🔥 Error getting user stats:', error);
      return null;
    }
  }

  // Get user's match history
  async getUserGames(limit = 50) {
    if (!this.isConfigured || authService.isMockMode()) {
      return [];
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) return [];

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .contains('team_nosotros_ids', [userProfile.id])
        .order('finished_at', { ascending: false})
        .limit(limit);

      if (error) throw error;

      return matches || [];

    } catch (error) {
      console.error('🔥 Error getting user matches:', error);
      return [];
    }
  }

  // Calculate statistics from matches array
  calculateStats(matches) {
    const totalGames = matches.length;
    const gamesWon = matches.filter(m => m.winner === 'nosotros').length;
    const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (const match of matches) {
      if (match.winner === 'nosotros') {
        currentStreak++;
      } else {
        currentStreak--;
      }
      break; // Only look at most recent match for current streak
    }

    // Calculate longest win streak
    let longestWinStreak = 0;
    let currentWinStreak = 0;

    for (const match of matches.slice().reverse()) { // Start from oldest
      if (match.winner === 'nosotros') {
        currentWinStreak++;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else {
        currentWinStreak = 0;
      }
    }

    // Calculate other stats
    const losses = matches.filter(m => m.winner === 'ellos');
    const avgPointsInLosses = losses.length > 0
      ? losses.reduce((sum, m) => sum + (m.score_nosotros || 0), 0) / losses.length
      : 0;

    const avgOpponentPoints = totalGames > 0
      ? matches.reduce((sum, m) => sum + (m.score_ellos || 0), 0) / totalGames
      : 0;

    const shutoutsGiven = matches.filter(m => m.winner === 'nosotros' && m.score_ellos === 0).length;
    const shutoutsReceived = matches.filter(m => m.winner === 'ellos' && m.score_nosotros === 0).length;

    const totalPointsScored = matches.reduce((sum, m) => sum + (m.score_nosotros || 0), 0);
    const avgGameDuration = totalGames > 0
      ? matches.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / totalGames
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

  // Update match notes
  async updateMatchNotes(matchId, notas) {
    console.log('📝 [updateMatchNotes] Starting update...');
    console.log('📝 [updateMatchNotes] matchId:', matchId);
    console.log('📝 [updateMatchNotes] notas:', notas);

    if (!this.isConfigured || authService.isMockMode()) {
      console.log('⚠️ Supabase not configured, skipping match update');
      return { success: false, reason: 'not_configured' };
    }

    if (!matchId) {
      console.warn('⚠️ No matchId provided');
      return { success: false, reason: 'no_match_id' };
    }

    try {
      const userProfile = await authService.getUserProfile();
      if (!userProfile) {
        console.warn('⚠️ No user profile found');
        return { success: false, reason: 'no_user_profile' };
      }

      console.log('📝 Updating match notes for matchId:', matchId);

      const { data: updatedMatch, error: updateError } = await supabase
        .from('matches')
        .update({ notas: notas || null })
        .eq('id', matchId)
        .eq('created_by', userProfile.id) // Security: only update own matches
        .select()
        .single();

      console.log('📝 [updateMatchNotes] Supabase response - data:', updatedMatch);
      console.log('📝 [updateMatchNotes] Supabase response - error:', updateError);

      if (updateError) {
        console.error('❌ [updateMatchNotes] Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      console.log('✅ Match notes updated:', updatedMatch.id);
      return { success: true, matchId: updatedMatch.id };

    } catch (error) {
      console.error('🔥 Error updating match notes:', error);
      console.error('🔥 Error details:', {
        message: error.message,
        name: error.name,
        code: error.code
      });
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated and can use cloud features
  canUseCloudFeatures() {
    return this.isConfigured && !authService.isMockMode() && authService.isAuthenticated();
  }
}

// Create singleton instance
const gameDataService = new GameDataService();

export default gameDataService;