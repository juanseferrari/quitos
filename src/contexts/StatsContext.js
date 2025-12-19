// contexts/StatsContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STATS_STATES, USER_STATS_STRUCTURE } from '../types/stats';
import { mockStatsService } from '../services/mockStatsService';
import { useAuthContext } from './AuthContext';

const StatsContext = createContext();

const initialStatsState = {
  // Estado de las estadísticas
  userStats: { ...USER_STATS_STRUCTURE },
  gameStats: [],
  rivalries: [],
  rankings: {
    local: [],
    regional: [],
    national: []
  },
  temporalAggregations: [],
  insights: [],
  
  // Estado de la aplicación
  app: {
    state: STATS_STATES.IDLE,
    isLoading: false,
    isCalculating: false,
    isSyncing: false,
    error: null,
    lastSync: null,
    needsCalculation: false
  },
  
  // Configuración
  settings: {
    autoCalculate: true,
    autoSync: true,
    cacheEnabled: true,
    insightsEnabled: true
  },
  
  // Cache local
  cache: {
    lastCalculation: null,
    lastFetch: null,
    expiresAt: null
  }
};

const statsReducer = (state, action) => {
  switch (action.type) {
    case 'STATS_LOADING':
      return {
        ...state,
        app: { 
          ...state.app, 
          state: STATS_STATES.LOADING,
          isLoading: true, 
          error: null 
        }
      };
      
    case 'STATS_CALCULATING':
      return {
        ...state,
        app: { 
          ...state.app, 
          state: STATS_STATES.CALCULATING,
          isCalculating: true, 
          error: null 
        }
      };
      
    case 'STATS_SYNCING':
      return {
        ...state,
        app: { 
          ...state.app, 
          state: STATS_STATES.SYNCING,
          isSyncing: true, 
          error: null 
        }
      };
      
    case 'STATS_SUCCESS':
      return {
        ...state,
        userStats: action.payload.userStats || state.userStats,
        app: {
          ...state.app,
          state: STATS_STATES.IDLE,
          isLoading: false,
          isCalculating: false,
          isSyncing: false,
          error: null,
          needsCalculation: false
        },
        cache: {
          ...state.cache,
          lastCalculation: Date.now(),
          lastFetch: Date.now(),
          expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutos
        }
      };
      
    case 'GAME_STATS_UPDATED':
      return {
        ...state,
        userStats: action.payload.userStats,
        gameStats: [...state.gameStats, action.payload.gameStats],
        insights: action.payload.insights || state.insights,
        app: {
          ...state.app,
          state: STATS_STATES.IDLE,
          isCalculating: false,
          error: null
        }
      };
      
    case 'RANKINGS_LOADED':
      return {
        ...state,
        rankings: {
          ...state.rankings,
          [action.payload.type]: action.payload.rankings
        },
        app: {
          ...state.app,
          isLoading: false
        }
      };
      
    case 'INSIGHTS_LOADED':
      return {
        ...state,
        insights: action.payload.insights,
        app: {
          ...state.app,
          isLoading: false
        }
      };
      
    case 'TEMPORAL_AGGREGATIONS_LOADED':
      return {
        ...state,
        temporalAggregations: action.payload.aggregations,
        app: {
          ...state.app,
          isLoading: false
        }
      };
      
    case 'RIVALRY_LOADED':
      return {
        ...state,
        rivalries: [
          ...state.rivalries.filter(r => 
            !(r.user1_id === action.payload.user1_id && r.user2_id === action.payload.user2_id) &&
            !(r.user1_id === action.payload.user2_id && r.user2_id === action.payload.user1_id)
          ),
          action.payload
        ]
      };
      
    case 'STATS_ERROR':
      return {
        ...state,
        app: {
          ...state.app,
          state: STATS_STATES.ERROR,
          isLoading: false,
          isCalculating: false,
          isSyncing: false,
          error: action.payload.error
        }
      };
      
    case 'CLEAR_STATS':
      return {
        ...initialStatsState,
        settings: state.settings // Mantener configuración
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    case 'MARK_NEEDS_CALCULATION':
      return {
        ...state,
        app: {
          ...state.app,
          needsCalculation: true
        }
      };
      
    case 'SYNC_COMPLETE':
      return {
        ...state,
        app: {
          ...state.app,
          state: STATS_STATES.IDLE,
          isSyncing: false,
          lastSync: action.payload.timestamp
        }
      };
      
    default:
      console.warn(`Unknown stats action type: ${action.type}`);
      return state;
  }
};

export const StatsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(statsReducer, initialStatsState);
  const { state: authState } = useAuthContext();
  
  // Usar mock service por ahora (fácil de cambiar después)
  const statsService = mockStatsService;
  
  // Inicialización de estadísticas cuando el usuario está autenticado
  useEffect(() => {
    if (authState.session.isAuthenticated && authState.user.id) {
      console.log('📊 Inicializando estadísticas para usuario autenticado:', authState.user.id);
      initializeUserStats(authState.user.id);
    } else if (authState.session.isAnonymous) {
      // Para usuarios anónimos, inicializar stats locales
      console.log('📊 Inicializando estadísticas para usuario anónimo');
      initializeUserStats('anonymous_user');
    }
  }, [authState.session.isAuthenticated, authState.user.id]);
  
  // Auto-sincronización periódica para usuarios autenticados
  useEffect(() => {
    if (state.settings.autoSync && authState.session.isAuthenticated) {
      const syncInterval = setInterval(() => {
        if (state.app.needsCalculation) {
          syncStatsWithBackend();
        }
      }, 5 * 60 * 1000); // Cada 5 minutos
      
      return () => clearInterval(syncInterval);
    }
  }, [state.settings.autoSync, authState.session.isAuthenticated, state.app.needsCalculation]);
  
  const initializeUserStats = async (userId) => {
    try {
      dispatch({ type: 'STATS_LOADING' });
      
      // Para usuarios reales, limpiar estadísticas previas si existen
      if (userId !== 'mock-user-1' && userId !== 'anonymous_user') {
        console.log('🧹 Limpiando estadísticas previas para usuario real:', userId);
        statsService.clearUserStats(userId);
      }
      
      // Cargar estadísticas del usuario
      const userStats = await statsService.getUserStats(userId);
      
      dispatch({
        type: 'STATS_SUCCESS',
        payload: { userStats }
      });
      
      // Cargar insights si están habilitados
      if (state.settings.insightsEnabled) {
        loadInsights(userId);
      }
      
    } catch (error) {
      console.error('Error initializing user stats:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
    }
  };
  
  const updateStatsWithGame = async (gameData) => {
    try {
      dispatch({ type: 'STATS_CALCULATING' });
      
      // Usar ID apropiado según el estado de autenticación
      const userId = authState.session.isAuthenticated ? authState.user.id : 'anonymous_user';
      
      console.log('📊 StatsContext: Actualizando estadísticas para usuario:', userId, {
        isAuthenticated: authState.session.isAuthenticated,
        gameData: {
          ganador: gameData.ganador,
          puntos: `${gameData.puntosNos}-${gameData.puntosEllos}`
        }
      });
      
      console.log('📊 StatsContext: Llamando a statsService.updateStatsWithGame...');
      // Siempre usar mockStatsService para calcular estadísticas
      // (independientemente de si es autenticado o no)
      const result = await statsService.updateStatsWithGame(userId, gameData);
      console.log('📊 StatsContext: statsService completado, resultado:', result);
      
      dispatch({
        type: 'GAME_STATS_UPDATED',
        payload: {
          userStats: result.userStats,
          gameStats: result.gameStats,
          insights: result.insights
        }
      });
      
      console.log('📊 Estadísticas actualizadas:', {
        gamesPlayed: result.userStats.games_played,
        winRate: result.userStats.win_rate,
        insights: result.insights.length,
        isStatsAvailable: result.userStats.games_played > 0
      });
      
      return result;
      
    } catch (error) {
      console.error('Error updating stats with game:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
      throw error;
    }
  };
  
  const loadRankings = async (type = 'local', city = 'Córdoba') => {
    if (!authState.session.isAuthenticated) return;
    
    try {
      dispatch({ type: 'STATS_LOADING' });
      
      const rankings = await statsService.getLocalRankings(city);
      
      dispatch({
        type: 'RANKINGS_LOADED',
        payload: {
          type,
          rankings: rankings.rankings
        }
      });
      
      return rankings;
      
    } catch (error) {
      console.error('Error loading rankings:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
    }
  };
  
  const loadRivalryStats = async (opponentId, opponentName = 'Rival') => {
    if (!authState.session.isAuthenticated) return;
    
    try {
      const rivalry = await statsService.getRivalryStats(authState.user.id, opponentId);
      rivalry.user2_name = opponentName; // Actualizar nombre del rival
      
      dispatch({
        type: 'RIVALRY_LOADED',
        payload: rivalry
      });
      
      return rivalry;
      
    } catch (error) {
      console.error('Error loading rivalry stats:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
    }
  };
  
  const loadTemporalAggregations = async (period = 'monthly', limit = 12) => {
    if (!authState.session.isAuthenticated) return;
    
    try {
      dispatch({ type: 'STATS_LOADING' });
      
      const aggregations = await statsService.getTemporalAggregations(
        authState.user.id, 
        period, 
        limit
      );
      
      dispatch({
        type: 'TEMPORAL_AGGREGATIONS_LOADED',
        payload: { aggregations }
      });
      
      return aggregations;
      
    } catch (error) {
      console.error('Error loading temporal aggregations:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
    }
  };
  
  const loadInsights = async (userId = null) => {
    const targetUserId = userId || authState.user.id;
    if (!targetUserId) return;
    
    try {
      const insights = await statsService.getPersonalizedInsights(targetUserId);
      
      dispatch({
        type: 'INSIGHTS_LOADED',
        payload: { insights }
      });
      
      return insights;
      
    } catch (error) {
      console.error('Error loading insights:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
    }
  };
  
  const syncStatsWithBackend = async () => {
    if (!authState.session.isAuthenticated) return;
    
    try {
      dispatch({ type: 'STATS_SYNCING' });
      
      const result = await statsService.syncWithBackend(authState.user.id);
      
      dispatch({
        type: 'SYNC_COMPLETE',
        payload: { timestamp: Date.now() }
      });
      
      return result;
      
    } catch (error) {
      console.error('Error syncing stats:', error);
      dispatch({ 
        type: 'STATS_ERROR', 
        payload: { error: error.message } 
      });
    }
  };
  
  const clearStatsCache = () => {
    dispatch({ type: 'CLEAR_STATS' });
  };
  
  const updateSettings = (newSettings) => {
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: newSettings 
    });
  };
  
  // Utilidades derivadas
  const isStatsAvailable = state.userStats.games_played > 0; // Disponible para usuarios autenticados y anónimos
  console.log('📊 isStatsAvailable check:', { 
    gamesPlayed: state.userStats.games_played, 
    isStatsAvailable,
    userId: authState.user.id || 'anonymous'
  });
  const hasRecentStats = state.cache.lastFetch && (Date.now() - state.cache.lastFetch) < 300000; // 5 min
  const isInsightWorthy = state.userStats.games_played >= 3; // Mínimo para insights significativos
  
  return (
    <StatsContext.Provider value={{
      // Estado
      state,
      userStats: state.userStats,
      gameStats: state.gameStats,
      rankings: state.rankings,
      insights: state.insights,
      rivalries: state.rivalries,
      temporalAggregations: state.temporalAggregations,
      
      // Estados de la app
      isLoading: state.app.isLoading,
      isCalculating: state.app.isCalculating,
      isSyncing: state.app.isSyncing,
      error: state.app.error,
      needsCalculation: state.app.needsCalculation,
      
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
      isAuthenticated: authState.session.isAuthenticated
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStatsContext = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStatsContext must be used within StatsProvider');
  }
  return context;
};