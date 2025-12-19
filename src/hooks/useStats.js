// hooks/useStats.js
import { useStatsContext } from '../contexts/StatsContext';
import { useAuth } from './useAuth';
import gameDataService from '../services/gameDataService';

export const useStats = () => {
  const {
    // Estado
    userStats,
    gameStats,
    rankings,
    insights,
    rivalries,
    temporalAggregations,
    
    // Estados de la app
    isLoading,
    isCalculating,
    isSyncing,
    error,
    needsCalculation,
    
    // Acciones
    updateStatsWithGame,
    loadRankings,
    loadRivalryStats,
    loadTemporalAggregations,
    loadInsights,
    syncStatsWithBackend,
    clearStatsCache,
    updateSettings,
    
    // Utilidades
    isStatsAvailable,
    hasRecentStats,
    isInsightWorthy,
    isAuthenticated
  } = useStatsContext();
  
  // Función simplificada para registrar un juego terminado
  const recordGameFinished = async (gameData) => {
    if (!gameData || !gameData.ganador) {
      console.warn('📊 Datos del juego incompletos, no se pueden calcular estadísticas');
      return null;
    }
    
    try {
      console.log('📊 Calculando estadísticas para:', {
        ganador: gameData.ganador,
        puntos: `${gameData.puntosNos}-${gameData.puntosEllos}`,
        isAuthenticated
      });
      
      // TEMPORALMENTE DESHABILITADO - Priorizar estadísticas sobre guardado en nube
      console.log('⚠️ Guardado en Supabase temporalmente deshabilitado para debug');
      
      // Si está autenticado, guardar en Supabase (no bloquear si falla)
      // if (isAuthenticated && gameDataService.canUseCloudFeatures()) {
      //   console.log('☁️ Guardando juego en la nube...');
      //   try {
      //     const saveResult = await gameDataService.saveGame(gameData);
      //     if (saveResult.success) {
      //       console.log('✅ Juego guardado en Supabase:', saveResult.gameId);
      //     } else {
      //       console.warn('⚠️ No se pudo guardar en la nube:', saveResult.reason);
      //     }
      //   } catch (cloudError) {
      //     console.error('❌ Error guardando en la nube (continuando con stats):', cloudError);
      //   }
      // }
      
      console.log('📊 Llamando a updateStatsWithGame...');
      const result = await updateStatsWithGame(gameData);
      console.log('📊 updateStatsWithGame completado, resultado:', result);
      
      console.log('📊 Estadísticas actualizadas:', {
        gamesPlayed: result?.userStats?.games_played || 0,
        insights: result?.insights?.length || 0
      });
      
      return result;
    } catch (error) {
      console.error('📊 Error calculando estadísticas:', error);
      return null;
    }
  };
  
  // Obtener stats específicas de rendimiento
  const getPerformanceStats = () => {
    if (!isStatsAvailable) return null;
    
    return {
      winRate: userStats.win_rate,
      currentStreak: userStats.current_streak,
      longestWinStreak: userStats.longest_win_streak,
      avgPointsPerGame: userStats.avg_points_per_game,
      dominanceRatio: userStats.shutouts_given / Math.max(userStats.shutouts_received, 1),
      clutchPerformance: userStats.pressure_performance,
      comebackRate: (userStats.comeback_games / userStats.games_played) * 100
    };
  };
  
  // Obtener rivalidad específica
  const getRivalry = (opponentName) => {
    return rivalries.find(r => 
      r.user1_name === opponentName || r.user2_name === opponentName
    );
  };
  
  // Verificar si necesita mostrar insights
  const shouldShowInsights = () => {
    return isInsightWorthy && insights.length > 0 && !isLoading;
  };
  
  // Obtener insight más relevante
  const getTopInsight = () => {
    if (!shouldShowInsights()) return null;
    
    // Priorizar por intensidad: high > medium > low
    const highIntensity = insights.filter(i => i.intensity === 'high');
    if (highIntensity.length > 0) return highIntensity[0];
    
    const mediumIntensity = insights.filter(i => i.intensity === 'medium');
    if (mediumIntensity.length > 0) return mediumIntensity[0];
    
    return insights[0];
  };
  
  // Función para generar resumen rápido de progreso
  const getProgressSummary = () => {
    if (!isStatsAvailable) {
      return {
        gamesPlayed: 0,
        level: 'Novato',
        nextMilestone: 'Jugá tu primer partido'
      };
    }
    
    const { games_played, games_won, win_rate } = userStats;
    
    // Determinar "nivel" basado en partidos jugados y win rate
    let level = 'Novato';
    if (games_played >= 100 && win_rate >= 70) level = 'Maestro';
    else if (games_played >= 50 && win_rate >= 60) level = 'Experto';
    else if (games_played >= 20 && win_rate >= 50) level = 'Intermedio';
    else if (games_played >= 5) level = 'Principiante';
    
    // Próximo hito
    let nextMilestone = '';
    if (games_played < 5) nextMilestone = `${5 - games_played} partidos para Principiante`;
    else if (games_played < 20) nextMilestone = `${20 - games_played} partidos para Intermedio`;
    else if (games_played < 50) nextMilestone = `${50 - games_played} partidos para Experto`;
    else if (games_played < 100) nextMilestone = `${100 - games_played} partidos para Maestro`;
    else nextMilestone = '¡Eres un Maestro del Truco!';
    
    return {
      gamesPlayed: games_played,
      gamesWon: games_won,
      winRate: win_rate,
      level,
      nextMilestone,
      currentStreak: userStats.current_streak
    };
  };
  
  // Funciones específicas para insights del truco
  const getTrucoInsights = () => {
    return {
      // Insights de dominancia
      isDominator: userStats.win_rate > 70,
      isShutoutMaster: userStats.shutouts_given > userStats.shutouts_received * 2,
      isClutchPlayer: userStats.pressure_performance > 60,
      isComebackKing: userStats.comeback_games > userStats.games_played * 0.15,
      
      // Patrones temporales
      bestTime: {
        day: getDayName(userStats.best_day_of_week),
        hour: formatHour(userStats.best_hour_of_day)
      },
      worstTime: {
        day: getDayName(userStats.worst_day_of_week),
        hour: formatHour(userStats.worst_hour_of_day)
      },
      
      // Métricas específicas
      shutoutRatio: userStats.shutouts_given / Math.max(userStats.shutouts_received, 1),
      averageMargin: userStats.avg_points_per_game - userStats.avg_opponent_points,
      comebackRate: (userStats.comeback_games / Math.max(userStats.games_played, 1)) * 100
    };
  };
  
  return {
    // Estado básico
    userStats,
    gameStats,
    rankings,
    insights,
    rivalries,
    temporalAggregations,
    
    // Estados de la app
    isLoading,
    isCalculating,
    isSyncing,
    error,
    needsCalculation,
    
    // Acciones principales
    recordGameFinished,
    loadRankings,
    loadRivalryStats,
    loadInsights,
    syncStatsWithBackend,
    
    // Utilidades de datos
    getPerformanceStats,
    getRivalry,
    getProgressSummary,
    getTrucoInsights,
    
    // Utilidades de UI
    shouldShowInsights,
    getTopInsight,
    
    // Estados derivados
    isStatsAvailable,
    hasRecentStats,
    isInsightWorthy,
    isAuthenticated
  };
};

// Helpers
const getDayName = (dayNumber) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber] || 'Desconocido';
};

const formatHour = (hour) => {
  if (hour === null || hour === undefined) return 'Desconocido';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${suffix}`;
};