// services/mockStatsService.js - Mock service para estadísticas
import { 
  USER_STATS_STRUCTURE, 
  RIVALRY_STATS_STRUCTURE,
  STAT_PERIODS 
} from '../types/stats';
import { StatsCalculator } from './statsCalculator';

class MockStatsService {
  constructor() {
    this.userStats = new Map();
    this.gameStats = [];
    this.rivalries = new Map();
    this.temporalAggregations = new Map();
    this.delay = 100; // Simular latencia reducida para mejor UX
    
    // Datos de prueba pre-cargados solo para usuario mock
    this.initializeMockData();
  }
  
  // Limpiar stats para usuario específico (para testing)
  clearUserStats(userId) {
    console.log('🧹 Limpiando estadísticas para usuario:', userId);
    this.userStats.delete(userId);
    // También limpiar gameStats del usuario
    this.gameStats = this.gameStats.filter(game => game.user_id !== userId);
  }
  
  initializeMockData() {
    // Usuario de prueba con estadísticas interesantes
    const mockUserId = 'mock-user-1';
    this.userStats.set(mockUserId, {
      ...USER_STATS_STRUCTURE,
      games_played: 47,
      games_won: 32,
      games_lost: 15,
      win_rate: 68.09,
      current_streak: 4,
      longest_win_streak: 8,
      longest_lose_streak: 3,
      total_points_scored: 1289,
      total_points_conceded: 983,
      avg_points_per_game: 27.4,
      avg_points_in_losses: 23.8,
      avg_opponent_points: 20.9,
      comeback_games: 7,
      choke_games: 3,
      pressure_performance: 72.5,
      clutch_wins: 12,
      best_day_of_week: 6, // Sábado
      best_hour_of_day: 21, // 9 PM
      worst_day_of_week: 1, // Lunes
      worst_hour_of_day: 8, // 8 AM
      shutouts_given: 9,
      shutouts_received: 2,
      close_games: 14,
      blowout_wins: 11,
      stats_version: 1,
      last_calculation_at: new Date().toISOString()
    });
    
    // Rivalidad de ejemplo
    const rivalryKey = `${mockUserId}_rival-user-1`;
    this.rivalries.set(rivalryKey, {
      ...RIVALRY_STATS_STRUCTURE,
      user1_id: mockUserId,
      user2_id: 'rival-user-1',
      user1_name: 'Tú',
      user2_name: 'Juan Carlos',
      user1_wins: 8,
      user2_wins: 5,
      total_games: 13,
      user1_win_rate: 61.54,
      current_streak_holder: 'user1',
      current_streak_length: 2,
      longest_streak_holder: 'user1',
      longest_streak_length: 4,
      user1_total_points: 341,
      user2_total_points: 298,
      user1_avg_points: 26.2,
      user2_avg_points: 22.9,
      close_games: 4,
      blowouts: 3,
      shutouts: 2,
      avg_game_duration: 1847000, // ~31 minutos
      first_game_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_game_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      games_this_month: 3,
      most_common_total_points: 30,
      user1_comeback_wins: 2,
      user2_comeback_wins: 1
    });
  }
  
  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
  
  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId) {
    await this.simulateDelay();
    
    const stats = this.userStats.get(userId);
    if (!stats) {
      // Retornar stats iniciales para usuario nuevo
      return {
        ...USER_STATS_STRUCTURE,
        user_id: userId,
        last_calculation_at: new Date().toISOString()
      };
    }
    
    return { ...stats, user_id: userId };
  }
  
  /**
   * Actualizar estadísticas con un nuevo juego
   */
  async updateStatsWithGame(userId, gameData) {
    await this.simulateDelay();
    
    try {
      console.log('🔥 MockStatsService: Procesando juego para usuario:', userId, gameData);
      
      // Calcular estadísticas del juego
      const gameStats = StatsCalculator.calculateGameStats(gameData, userId);
      console.log('🔥 Game stats calculadas:', gameStats);
      
      // Verificar si el juego ya fue procesado para evitar duplicados
      const existingGame = this.gameStats.find(g => g.game_id === gameStats.game_id);
      if (existingGame) {
        console.warn('⚠️ Juego ya procesado, evitando duplicado:', gameStats.game_id);
        return {
          success: false,
          reason: 'duplicate_game',
          message: 'Este juego ya fue procesado anteriormente'
        };
      }
      
      // Guardar estadísticas del juego
      this.gameStats.push(gameStats);
      
      // Obtener estadísticas actuales del usuario
      let currentStats = this.userStats.get(userId);
      
      // Para usuarios reales, empezar desde cero si no tienen datos previos
      if (!currentStats) {
        if (userId !== 'mock-user-1' && userId !== 'anonymous_user') {
          console.log('🔥 Inicializando stats desde cero para usuario real:', userId);
          currentStats = { ...USER_STATS_STRUCTURE, user_id: userId };
        } else {
          currentStats = { ...USER_STATS_STRUCTURE, user_id: userId };
        }
      }
      
      console.log('🔥 Stats actuales del usuario:', currentStats.games_played);
      
      // Actualizar estadísticas agregadas
      const updatedStats = StatsCalculator.updateUserStats(currentStats, gameStats);
      console.log('🔥 Stats actualizadas:', updatedStats.games_played);
      
      // Guardar estadísticas actualizadas
      this.userStats.set(userId, updatedStats);
      console.log('🔥 Stats guardadas en Map para usuario:', userId);
      
      // Generar insights
      const insights = StatsCalculator.generateTrucoInsights(updatedStats);
      
      console.log('🔥 MockStatsService: Estadísticas finales', {
        userId,
        gamesPlayed: updatedStats.games_played,
        winRate: updatedStats.win_rate,
        insights: insights.length
      });
      
      return {
        success: true,
        gameStats,
        userStats: updatedStats,
        insights,
        message: 'Estadísticas actualizadas exitosamente (mock)'
      };
      
    } catch (error) {
      console.error('Error updating stats:', error);
      throw new Error('Error calculando estadísticas: ' + error.message);
    }
  }
  
  /**
   * Obtener estadísticas de rivalidad
   */
  async getRivalryStats(user1Id, user2Id) {
    await this.simulateDelay();
    
    const rivalryKey = `${user1Id}_${user2Id}`;
    const reverseKey = `${user2Id}_${user1Id}`;
    
    let rivalry = this.rivalries.get(rivalryKey) || this.rivalries.get(reverseKey);
    
    if (!rivalry) {
      // Crear rivalidad vacía
      rivalry = {
        ...RIVALRY_STATS_STRUCTURE,
        user1_id: user1Id,
        user2_id: user2Id,
        user1_name: 'Tú',
        user2_name: 'Rival'
      };
    }
    
    return rivalry;
  }
  
  /**
   * Obtener rankings locales (mock)
   */
  async getLocalRankings(city = 'Córdoba', limit = 10) {
    await this.simulateDelay();
    
    // Mock de ranking local
    const mockRankings = [
      { rank: 1, username: 'El_Macho_Truco', win_rate: 84.2, games_played: 156, current_streak: 12 },
      { rank: 2, username: 'TrucoKing2024', win_rate: 81.7, games_played: 203, current_streak: 7 },
      { rank: 3, username: 'Tú', win_rate: 68.1, games_played: 47, current_streak: 4 },
      { rank: 4, username: 'CarlosElGrande', win_rate: 67.3, games_played: 89, current_streak: -2 },
      { rank: 5, username: 'TrucoMaster', win_rate: 65.8, games_played: 134, current_streak: 1 }
    ];
    
    return {
      city,
      rankings: mockRankings.slice(0, limit),
      user_rank: 3,
      total_players: 1247
    };
  }
  
  /**
   * Obtener agregaciones temporales
   */
  async getTemporalAggregations(userId, period = STAT_PERIODS.MONTHLY, limit = 12) {
    await this.simulateDelay();
    
    // Mock de agregaciones mensuales
    const now = new Date();
    const aggregations = [];
    
    for (let i = 0; i < limit; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const gamesPlayed = Math.floor(Math.random() * 15) + 3;
      const winRate = 50 + Math.random() * 40; // 50-90%
      
      aggregations.push({
        period_start: date.toISOString().split('T')[0],
        period_end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0],
        games_played: gamesPlayed,
        games_won: Math.floor(gamesPlayed * (winRate / 100)),
        win_rate: winRate,
        avg_points_per_game: 25 + Math.random() * 8, // 25-33
        comeback_games: Math.floor(Math.random() * 3),
        clutch_wins: Math.floor(Math.random() * 4)
      });
    }
    
    return aggregations.reverse(); // Más reciente primero
  }
  
  /**
   * Obtener insights personalizados
   */
  async getPersonalizedInsights(userId) {
    await this.simulateDelay();
    
    const userStats = await this.getUserStats(userId);
    const insights = StatsCalculator.generateTrucoInsights(userStats);
    
    // Agregar algunos insights específicos de mock
    insights.push({
      type: 'temporal',
      title: '🌙 BÚHO NOCTURNO',
      message: 'Rendís 23% mejor después de las 9 PM',
      intensity: 'medium'
    });
    
    insights.push({
      type: 'social',
      title: '👑 CAMINO AL TRONO',
      message: 'Estás a 8 victorias del top 3 local en Córdoba',
      intensity: 'low'
    });
    
    return insights;
  }
  
  /**
   * Obtener progreso hacia objetivos
   */
  async getProgressToGoals(userId) {
    await this.simulateDelay();
    
    const userStats = await this.getUserStats(userId);
    
    return {
      next_achievement: {
        name: 'Centurión del Truco',
        description: '100 victorias totales',
        progress: userStats.games_won,
        target: 100,
        percentage: (userStats.games_won / 100) * 100
      },
      ranking_progress: {
        current_rank: 3,
        next_rank: 2,
        games_needed: 8,
        win_rate_needed: 75.0
      },
      streak_goal: {
        current: userStats.current_streak,
        target: 10,
        needed: Math.max(0, 10 - userStats.current_streak)
      }
    };
  }
  
  /**
   * Simular sincronización con backend
   */
  async syncWithBackend(userId) {
    await this.simulateDelay();
    
    console.log(`Mock: Sincronizando estadísticas del usuario ${userId} con backend...`);
    
    return {
      success: true,
      synced_games: this.gameStats.length,
      last_sync: new Date().toISOString(),
      message: 'Sincronización completa (mock)'
    };
  }
}

export const mockStatsService = new MockStatsService();