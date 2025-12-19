// src/hooks/useRankings.js
// Hook para gestión de rankings y leaderboards
// Integrado con el sistema de estadísticas existente

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useStats } from './useStats';
import { mockSocialService } from '../services/mockSocialService';

export const useRankings = () => {
  const { user, isAuthenticated } = useAuth();
  const { userStats } = useStats();
  
  // Estado de rankings
  const [rankings, setRankings] = useState({});
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('cordoba');

  // Configuración
  const api = mockSocialService; // TODO: Reemplazar con API real

  // Ubicaciones disponibles
  const availableLocations = [
    { id: 'cordoba', name: 'Córdoba', type: 'local' },
    { id: 'buenos-aires', name: 'Buenos Aires', type: 'local' },
    { id: 'rosario', name: 'Rosario', type: 'local' },
    { id: 'argentina', name: 'Argentina', type: 'national' }
  ];

  // ========================================
  // FUNCIONES DE CARGA DE RANKINGS
  // ========================================

  const loadRanking = useCallback(async (location, options = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getRanking(location, {
        limit: options.limit || 20,
        include_user: options.include_user !== false
      });
      
      // Actualizar rankings en estado
      setRankings(prev => ({
        ...prev,
        [location]: response
      }));
      
      return response;
    } catch (err) {
      console.error(`Error loading ranking for ${location}:`, err);
      setError(err.message || 'Error al cargar ranking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  const loadUserProgress = useCallback(async (userId = null) => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      
      const targetUserId = userId || user?.id;
      const response = await api.getUserRankingProgress(targetUserId);
      
      setUserProgress(response);
      return response;
    } catch (err) {
      console.error('Error loading user progress:', err);
      setError(err.message || 'Error al cargar progreso');
      throw err;
    }
  }, [isAuthenticated, api, user?.id]);

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const refreshRankings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      // Cargar rankings principales
      const locationPromises = availableLocations.map(location => 
        loadRanking(location.id).catch(err => {
          console.warn(`Failed to load ranking for ${location.id}:`, err);
          return null;
        })
      );
      
      // Cargar progreso del usuario
      const progressPromise = loadUserProgress().catch(err => {
        console.warn('Failed to load user progress:', err);
        return null;
      });
      
      await Promise.all([...locationPromises, progressPromise]);
    } catch (err) {
      console.error('Error refreshing rankings:', err);
      setError('Error al actualizar rankings');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadRanking, loadUserProgress]);

  const getRankingForLocation = useCallback((location) => {
    return rankings[location] || null;
  }, [rankings]);

  const getUserRankInLocation = useCallback((location) => {
    const ranking = rankings[location];
    if (!ranking || !ranking.user_position) return null;
    
    return {
      rank: ranking.user_position.rank,
      total_players: ranking.user_position.total_players,
      progress_percentage: ((ranking.user_position.total_players - ranking.user_position.rank) / ranking.user_position.total_players) * 100
    };
  }, [rankings]);

  // ========================================
  // FUNCIONES DE ANÁLISIS
  // ========================================

  const getBestRanking = useCallback(() => {
    if (!userProgress?.current_rankings) return null;
    
    return userProgress.current_rankings.reduce((best, current) => {
      const currentPercentage = current.progress_percentage;
      const bestPercentage = best?.progress_percentage || 0;
      
      return currentPercentage > bestPercentage ? current : best;
    }, null);
  }, [userProgress]);

  const getWorstRanking = useCallback(() => {
    if (!userProgress?.current_rankings) return null;
    
    return userProgress.current_rankings.reduce((worst, current) => {
      const currentPercentage = current.progress_percentage;
      const worstPercentage = worst?.progress_percentage || 100;
      
      return currentPercentage < worstPercentage ? current : worst;
    }, null);
  }, [userProgress]);

  const getNextMilestone = useCallback(() => {
    if (!userProgress?.climbing_analysis?.next_milestone) return null;
    
    return userProgress.climbing_analysis.next_milestone;
  }, [userProgress]);

  const getClimbingSpeed = useCallback(() => {
    if (!userProgress?.climbing_analysis?.fastest_climb) return null;
    
    const climb = userProgress.climbing_analysis.fastest_climb;
    const positionsPerDay = climb.positions_gained / climb.period_days;
    
    return {
      ...climb,
      positions_per_day: positionsPerDay,
      estimated_days_to_top: climb.positions_gained > 0 ? Math.ceil(10 / positionsPerDay) : null
    };
  }, [userProgress]);

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar rankings iniciales
  useEffect(() => {
    if (isAuthenticated) {
      // Cargar ranking de la ubicación seleccionada
      loadRanking(selectedLocation);
      // Cargar progreso del usuario
      loadUserProgress();
    } else {
      // Limpiar datos cuando no hay autenticación
      setRankings({});
      setUserProgress(null);
      setError(null);
    }
  }, [isAuthenticated, selectedLocation, loadRanking, loadUserProgress]);

  // ========================================
  // DATOS DERIVADOS
  // ========================================

  const currentRanking = rankings[selectedLocation];
  const currentUserRank = getUserRankInLocation(selectedLocation);
  const bestRanking = getBestRanking();
  const worstRanking = getWorstRanking();
  const nextMilestone = getNextMilestone();
  const climbingSpeed = getClimbingSpeed();

  // Estadísticas del usuario actual
  const userRankingStats = {
    total_locations: availableLocations.length,
    loaded_locations: Object.keys(rankings).length,
    best_rank: bestRanking?.rank || null,
    worst_rank: worstRanking?.rank || null,
    average_progress: userProgress?.current_rankings?.reduce((sum, r) => sum + r.progress_percentage, 0) / (userProgress?.current_rankings?.length || 1) || 0
  };

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado principal
    rankings,
    userProgress,
    isLoading,
    error,
    
    // Ubicación seleccionada
    selectedLocation,
    setSelectedLocation,
    availableLocations,
    
    // Datos del ranking actual
    currentRanking,
    currentUserRank,
    
    // Funciones de carga
    loadRanking,
    loadUserProgress,
    refreshRankings,
    
    // Análisis de progreso
    bestRanking,
    worstRanking,
    nextMilestone,
    climbingSpeed,
    
    // Utilidades
    getRankingForLocation,
    getUserRankInLocation,
    
    // Estadísticas generales
    userRankingStats,
    
    // Estados booleanos
    hasRankings: Object.keys(rankings).length > 0,
    hasUserProgress: userProgress !== null,
    isInTop10: currentUserRank?.rank <= 10,
    isInTop100: currentUserRank?.rank <= 100,
    
    // Helpers
    getLocationName: (locationId) => availableLocations.find(l => l.id === locationId)?.name || locationId,
    getLocationType: (locationId) => availableLocations.find(l => l.id === locationId)?.type || 'local',
    
    // Comparaciones
    isRankingBetterThan: (location1, location2) => {
      const rank1 = getUserRankInLocation(location1);
      const rank2 = getUserRankInLocation(location2);
      return rank1 && rank2 && rank1.progress_percentage > rank2.progress_percentage;
    },
    
    // Predicciones
    estimatedTimeToRank: (targetRank) => {
      if (!climbingSpeed || !currentUserRank) return null;
      
      const positionsNeeded = Math.max(0, currentUserRank.rank - targetRank);
      const daysNeeded = Math.ceil(positionsNeeded / climbingSpeed.positions_per_day);
      
      return {
        positions_needed: positionsNeeded,
        days_needed: daysNeeded,
        estimated_date: new Date(Date.now() + (daysNeeded * 24 * 60 * 60 * 1000))
      };
    }
  };
};