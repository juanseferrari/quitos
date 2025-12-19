// services/statsCalculator.js - Motor de cálculo de estadísticas del truco
import { 
  USER_STATS_STRUCTURE, 
  GAME_STATS_STRUCTURE, 
  RIVALRY_STATS_STRUCTURE 
} from '../types/stats';

/**
 * Motor de cálculo de estadísticas para el truco argentino
 * Especializado en métricas adictivas y patrones de comportamiento
 */
export class StatsCalculator {
  
  /**
   * Calcular estadísticas de un juego individual
   * @param {Object} gameData - Datos del juego terminado
   * @param {string} userId - ID del usuario
   * @returns {Object} Estadísticas del juego
   */
  static calculateGameStats(gameData, userId) {
    const {
      puntosNos,
      puntosEllos,
      ganador,
      puntosTotales,
      fechaInicio,
      fechaFin,
      historial = []
    } = gameData;
    
    // Determinar si el usuario ganó (asumiendo que "nos" es el usuario)
    const isWin = ganador === 'nos';
    const pointsScored = puntosNos;
    const pointsConceded = puntosEllos;
    const pointDifference = pointsScored - pointsConceded;
    
    // Análisis de características del juego
    const isShutoutGiven = pointsConceded < 15;
    const isShutoutReceived = pointsScored < 15;
    const isCloseGame = Math.abs(pointDifference) <= 5;
    const isBlowout = Math.abs(pointDifference) >= 15;
    
    // Análisis de comeback/choke basado en historial
    const comebackAnalysis = this.analyzeComebackChoke(historial, isWin);
    
    // Análisis de liderazgo y pressure
    const leadershipAnalysis = this.analyzeLeadership(historial, puntosTotales);
    
    // Datos temporales
    const playedAt = new Date(fechaFin);
    const dayOfWeek = playedAt.getDay();
    const hourOfDay = playedAt.getHours();
    
    return {
      ...GAME_STATS_STRUCTURE,
      game_id: `game_${fechaInicio}_${userId}`,
      user_id: userId,
      
      // Resultado básico
      is_win: isWin,
      points_scored: pointsScored,
      points_conceded: pointsConceded,
      point_difference: pointDifference,
      total_points: puntosTotales,
      duration_ms: fechaFin - fechaInicio,
      
      // Características
      is_shutout_given: isShutoutGiven,
      is_shutout_received: isShutoutReceived,
      is_close_game: isCloseGame,
      is_blowout: isBlowout,
      is_comeback: comebackAnalysis.isComeback,
      is_choke: comebackAnalysis.isChoke,
      
      // Métricas de rendimiento
      max_lead: leadershipAnalysis.maxLead,
      max_deficit: leadershipAnalysis.maxDeficit,
      lead_changes: leadershipAnalysis.leadChanges,
      pressure_situations: leadershipAnalysis.pressureSituations,
      pressure_wins: leadershipAnalysis.pressureWins,
      
      // Temporal
      played_at: playedAt.toISOString(),
      day_of_week: dayOfWeek,
      hour_of_day: hourOfDay
    };
  }
  
  /**
   * Analizar comeback y choke basado en el historial de puntos
   */
  static analyzeComebackChoke(historial, isWin) {
    if (!historial || historial.length === 0) {
      return { isComeback: false, isChoke: false };
    }
    
    let wasEverBehind = false;
    let wasEverAhead = false;
    let maxDeficit = 0;
    let maxLead = 0;
    
    historial.forEach(move => {
      const deficit = move.puntosEllos - move.puntosNos;
      const lead = move.puntosNos - move.puntosEllos;
      
      if (deficit > 0) {
        wasEverBehind = true;
        maxDeficit = Math.max(maxDeficit, deficit);
      }
      
      if (lead > 0) {
        wasEverAhead = true;
        maxLead = Math.max(maxLead, lead);
      }
    });
    
    // Comeback: ganó habiendo estado atrás por 5+ puntos
    const isComeback = isWin && wasEverBehind && maxDeficit >= 5;
    
    // Choke: perdió habiendo estado adelante por 5+ puntos
    const isChoke = !isWin && wasEverAhead && maxLead >= 5;
    
    return { isComeback, isChoke };
  }
  
  /**
   * Analizar patrones de liderazgo y pressure
   */
  static analyzeLeadership(historial, puntosTotales) {
    if (!historial || historial.length === 0) {
      return {
        maxLead: 0,
        maxDeficit: 0,
        leadChanges: 0,
        pressureSituations: 0,
        pressureWins: 0
      };
    }
    
    let maxLead = 0;
    let maxDeficit = 0;
    let leadChanges = 0;
    let pressureSituations = 0;
    let pressureWins = 0;
    
    let lastLeader = null; // 'nos' | 'ellos' | 'tie'
    
    historial.forEach((move, index) => {
      const lead = move.puntosNos - move.puntosEllos;
      const deficit = move.puntosEllos - move.puntosNos;
      
      // Tracking de ventajas máximas
      if (lead > 0) {
        maxLead = Math.max(maxLead, lead);
      } else if (deficit > 0) {
        maxDeficit = Math.max(maxDeficit, deficit);
      }
      
      // Detectar cambios de liderazgo
      let currentLeader = 'tie';
      if (lead > 0) currentLeader = 'nos';
      else if (deficit > 0) currentLeader = 'ellos';
      
      if (lastLeader !== null && lastLeader !== currentLeader && currentLeader !== 'tie') {
        leadChanges++;
      }
      lastLeader = currentLeader;
      
      // Detectar situaciones de pressure (rival a 29 en juego de 30)
      const pressureThreshold = puntosTotales - 1;
      if (move.puntosEllos === pressureThreshold) {
        pressureSituations++;
        
        // Ver si ganamos desde esta situación
        const subsequentMoves = historial.slice(index + 1);
        const wonFromPressure = subsequentMoves.some(m => 
          m.puntosNos === puntosTotales && m.puntosEllos < puntosTotales
        );
        
        if (wonFromPressure) {
          pressureWins++;
        }
      }
    });
    
    return {
      maxLead,
      maxDeficit,
      leadChanges,
      pressureSituations,
      pressureWins
    };
  }
  
  /**
   * Actualizar estadísticas agregadas del usuario
   * @param {Object} currentStats - Estadísticas actuales
   * @param {Object} gameStats - Estadísticas del nuevo juego
   * @returns {Object} Estadísticas actualizadas
   */
  static updateUserStats(currentStats, gameStats) {
    const updated = { ...currentStats };
    
    // Básicas
    updated.games_played += 1;
    if (gameStats.is_win) {
      updated.games_won += 1;
    } else {
      updated.games_lost += 1;
    }
    updated.win_rate = (updated.games_won / updated.games_played * 100);
    
    // Actualizar racha actual
    if (gameStats.is_win) {
      if (updated.current_streak >= 0) {
        updated.current_streak += 1;
        updated.longest_win_streak = Math.max(updated.longest_win_streak, updated.current_streak);
      } else {
        updated.current_streak = 1; // Reset a victoria
      }
    } else {
      if (updated.current_streak <= 0) {
        updated.current_streak -= 1;
        updated.longest_lose_streak = Math.max(updated.longest_lose_streak, Math.abs(updated.current_streak));
      } else {
        updated.current_streak = -1; // Reset a derrota
      }
    }
    
    // Puntos
    updated.total_points_scored += gameStats.points_scored;
    updated.total_points_conceded += gameStats.points_conceded;
    updated.avg_points_per_game = updated.total_points_scored / updated.games_played;
    
    // Métricas avanzadas específicas del truco
    this.updateAdvancedTrucoStats(updated, gameStats);
    
    // Patrones temporales
    this.updateTemporalPatterns(updated, gameStats);
    
    // Patrones de dominancia
    this.updateDominancePatterns(updated, gameStats);
    
    updated.last_calculation_at = new Date().toISOString();
    
    return updated;
  }
  
  /**
   * Actualizar métricas avanzadas específicas del truco argentino
   */
  static updateAdvancedTrucoStats(stats, gameStats) {
    // Promedio de puntos en derrotas - "qué tan cerca llegás"
    if (!gameStats.is_win) {
      const totalLossPoints = (stats.avg_points_in_losses * stats.games_lost) + gameStats.points_scored;
      const totalLosses = stats.games_lost + 1;
      stats.avg_points_in_losses = totalLossPoints / totalLosses;
    }
    
    // Promedio de puntos del rival - "a cuánto los dejás"
    const totalOpponentPoints = (stats.avg_opponent_points * (stats.games_played - 1)) + gameStats.points_conceded;
    stats.avg_opponent_points = totalOpponentPoints / stats.games_played;
    
    // Comebacks y chokes
    if (gameStats.is_comeback) stats.comeback_games += 1;
    if (gameStats.is_choke) stats.choke_games += 1;
    
    // Performance bajo pressure
    if (gameStats.pressure_situations > 0) {
      const totalPressureWins = stats.clutch_wins + gameStats.pressure_wins;
      const totalPressureSituations = gameStats.pressure_situations;
      // Simplificado: pressure_performance sería más complejo en implementación real
      stats.pressure_performance = (totalPressureWins / Math.max(totalPressureSituations, 1)) * 100;
      stats.clutch_wins += gameStats.pressure_wins;
    }
  }
  
  /**
   * Actualizar patrones temporales
   */
  static updateTemporalPatterns(stats, gameStats) {
    // Esto requeriría tracking histórico por día/hora
    // Para el MVP, simplemente registramos el último mejor día/hora
    if (gameStats.is_win) {
      stats.best_day_of_week = gameStats.day_of_week;
      stats.best_hour_of_day = gameStats.hour_of_day;
    } else {
      stats.worst_day_of_week = gameStats.day_of_week;
      stats.worst_hour_of_day = gameStats.hour_of_day;
    }
  }
  
  /**
   * Actualizar patrones de dominancia
   */
  static updateDominancePatterns(stats, gameStats) {
    if (gameStats.is_shutout_given) stats.shutouts_given += 1;
    if (gameStats.is_shutout_received) stats.shutouts_received += 1;
    if (gameStats.is_close_game) stats.close_games += 1;
    if (gameStats.is_blowout && gameStats.is_win) stats.blowout_wins += 1;
  }
  
  /**
   * Calcular estadísticas de rivalidad entre dos jugadores
   * @param {Array} gamesHistory - Historial de juegos entre los jugadores
   * @param {string} user1Id 
   * @param {string} user2Id 
   * @returns {Object} Estadísticas de rivalidad
   */
  static calculateRivalryStats(gamesHistory, user1Id, user2Id) {
    if (!gamesHistory || gamesHistory.length === 0) {
      return {
        ...RIVALRY_STATS_STRUCTURE,
        user1_id: user1Id,
        user2_id: user2Id
      };
    }
    
    const stats = { ...RIVALRY_STATS_STRUCTURE };
    stats.user1_id = user1Id;
    stats.user2_id = user2Id;
    stats.total_games = gamesHistory.length;
    
    let user1Points = 0;
    let user2Points = 0;
    let closeGames = 0;
    let blowouts = 0;
    let shutouts = 0;
    let totalDuration = 0;
    
    let currentStreakHolder = null;
    let currentStreakLength = 0;
    let longestStreakHolder = null;
    let longestStreakLength = 0;
    
    // Analizar cada juego
    gamesHistory.forEach((game, index) => {
      const user1Won = game.ganador === 'user1'; // Adaptar según estructura
      
      if (user1Won) {
        stats.user1_wins += 1;
        user1Points += game.puntosNos || 0;
        user2Points += game.puntosEllos || 0;
      } else {
        stats.user2_wins += 1;
        user1Points += game.puntosEllos || 0;
        user2Points += game.puntosNos || 0;
      }
      
      // Análisis de características
      const pointDiff = Math.abs((game.puntosNos || 0) - (game.puntosEllos || 0));
      if (pointDiff <= 5) closeGames++;
      if (pointDiff >= 15) blowouts++;
      if (Math.min(game.puntosNos || 0, game.puntosEllos || 0) < 15) shutouts++;
      
      totalDuration += (game.fechaFin - game.fechaInicio) || 0;
      
      // Tracking de rachas
      const winner = user1Won ? 'user1' : 'user2';
      if (currentStreakHolder === winner) {
        currentStreakLength++;
      } else {
        currentStreakHolder = winner;
        currentStreakLength = 1;
      }
      
      if (currentStreakLength > longestStreakLength) {
        longestStreakLength = currentStreakLength;
        longestStreakHolder = currentStreakHolder;
      }
    });
    
    // Calcular métricas finales
    stats.user1_win_rate = (stats.user1_wins / stats.total_games) * 100;
    stats.user1_total_points = user1Points;
    stats.user2_total_points = user2Points;
    stats.user1_avg_points = user1Points / stats.total_games;
    stats.user2_avg_points = user2Points / stats.total_games;
    
    stats.close_games = closeGames;
    stats.blowouts = blowouts;
    stats.shutouts = shutouts;
    stats.avg_game_duration = totalDuration / stats.total_games;
    
    stats.current_streak_holder = currentStreakHolder;
    stats.current_streak_length = currentStreakLength;
    stats.longest_streak_holder = longestStreakHolder;
    stats.longest_streak_length = longestStreakLength;
    
    // Temporal
    if (gamesHistory.length > 0) {
      stats.first_game_at = new Date(gamesHistory[0].fechaInicio).toISOString();
      stats.last_game_at = new Date(gamesHistory[gamesHistory.length - 1].fechaFin).toISOString();
      
      // Juegos este mes
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      stats.games_this_month = gamesHistory.filter(game => 
        new Date(game.fechaFin) >= thisMonth
      ).length;
    }
    
    return stats;
  }
  
  /**
   * Generar insights adictivos basados en las estadísticas
   * @param {Object} userStats 
   * @returns {Array} Array de insights
   */
  static generateTrucoInsights(userStats) {
    const insights = [];
    
    // Insights de rendimiento
    if (userStats.win_rate > 70) {
      insights.push({
        type: 'dominance',
        title: '🔥 DOMINANCIA TOTAL',
        message: `${userStats.win_rate.toFixed(1)}% de victorias. ¡Sos una máquina!`,
        intensity: 'high'
      });
    }
    
    // Insights de rachas
    if (userStats.current_streak > 5) {
      insights.push({
        type: 'streak',
        title: '⚡ RACHA IMPARABLE',
        message: `${userStats.current_streak} victorias seguidas. ¡No te pueden parar!`,
        intensity: 'high'
      });
    }
    
    // Insights de comeback
    if (userStats.comeback_games > 0) {
      const comebackRate = (userStats.comeback_games / userStats.games_played) * 100;
      insights.push({
        type: 'comeback',
        title: '💪 GUERRERO MENTAL',
        message: `${comebackRate.toFixed(1)}% de tus victorias fueron remontadas épicas`,
        intensity: 'medium'
      });
    }
    
    // Insights de dominancia específicos del truco
    if (userStats.shutouts_given > userStats.shutouts_received * 2) {
      insights.push({
        type: 'shutout',
        title: '🛌 MÁQUINA DE DORMIR',
        message: `Dejaste ${userStats.shutouts_given} rivales durmiendo afuera`,
        intensity: 'medium'
      });
    }
    
    // Insights de pressure
    if (userStats.pressure_performance > 60) {
      insights.push({
        type: 'clutch',
        title: '💎 CLUTCH MASTER',
        message: `${userStats.pressure_performance.toFixed(1)}% de éxito bajo pressure`,
        intensity: 'high'
      });
    }
    
    return insights;
  }
}