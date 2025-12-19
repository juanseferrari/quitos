// src/hooks/useAchievements.js
// Hook principal para gestión del sistema de logros
// Integrado con el sistema de juego existente y diseñado para el tema cinematográfico

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useGame } from './useGame';
import { mockAchievementsService } from '../services/mockAchievementsService';

export const useAchievements = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Estado principal
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState(new Map());
  const [userProgress, setUserProgress] = useState(new Map());
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado de notificaciones
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Referencias para performance
  const verificationTimeoutRef = useRef(null);
  const lastVerificationRef = useRef(0);
  
  // Configuración
  const api = mockAchievementsService;
  const VERIFICATION_COOLDOWN = 1000; // 1 segundo para evitar spam

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const loadAchievements = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [achievementsData, categoriesData] = await Promise.all([
        api.getAchievements(),
        api.getCategories()
      ]);
      
      setAchievements(achievementsData.achievements);
      setCategories(categoriesData.categories);
      
      return achievementsData;
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err.message || 'Error al cargar logros');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  const loadUserAchievements = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setError(null);
      
      const response = await api.getUserAchievements(user.id);
      
      // Convertir a Map para acceso rápido
      const userAchievementsMap = new Map();
      const userProgressMap = new Map();
      
      // Verificar que user_achievements existe y es un array
      if (response.user_achievements && Array.isArray(response.user_achievements)) {
        response.user_achievements.forEach(achievement => {
          userAchievementsMap.set(achievement.achievement_key, achievement);
        });
      }
      
      // Verificar que progress existe y es un array
      if (response.progress && Array.isArray(response.progress)) {
        response.progress.forEach(progress => {
          userProgressMap.set(progress.achievement_key, progress);
        });
      }
      
      setUserAchievements(userAchievementsMap);
      setUserProgress(userProgressMap);
      
      return response;
    } catch (err) {
      console.error('Error loading user achievements:', err);
      setError(err.message || 'Error al cargar progreso de logros');
      throw err;
    }
  }, [isAuthenticated, user?.id, api]);

  // ========================================
  // FUNCIONES DE VERIFICACIÓN DE LOGROS
  // ========================================

  const verifyAchievements = useCallback(async (gameData = null, options = {}) => {
    if (!isAuthenticated || !user?.id) return;
    
    // Control de cooldown para evitar verificaciones excesivas
    const now = Date.now();
    if (now - lastVerificationRef.current < VERIFICATION_COOLDOWN && !options.force) {
      return;
    }
    lastVerificationRef.current = now;
    
    // Cancelar verificación anterior si está pendiente
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }
    
    try {
      setError(null);
      
      // Usar datos del juego actual o valores por defecto
      const dataToVerify = gameData || {
        user_id: user.id,
        games_won: 0,
        games_lost: 0,
        current_streak: 0,
        best_streak: 0,
        last_game: null,
        game_timestamp: new Date().toISOString()
      };
      
      const response = await api.checkAchievementProgress(user.id, dataToVerify);
      
      // Procesar nuevos logros desbloqueados
      if (response.newly_unlocked && response.newly_unlocked.length > 0) {
        const newUnlocks = response.newly_unlocked.map(achievement => ({
          ...achievement,
          timestamp: new Date().toISOString(),
          id: `unlock-${achievement.key}-${Date.now()}`
        }));
        
        setRecentUnlocks(prev => [...newUnlocks, ...prev].slice(0, 10));
        setPendingNotifications(prev => [...prev, ...newUnlocks]);
        
        // Auto-mostrar notificaciones si hay logros nuevos
        if (newUnlocks.length > 0) {
          setShowNotifications(true);
        }
      }
      
      // Actualizar progreso del usuario
      if (response.updated_progress && Array.isArray(response.updated_progress)) {
        const updatedProgressMap = new Map(userProgress);
        response.updated_progress.forEach(progress => {
          updatedProgressMap.set(progress.achievement_key, progress);
        });
        setUserProgress(updatedProgressMap);
      }
      
      // Actualizar logros del usuario
      if (response.user_achievements && Array.isArray(response.user_achievements)) {
        const updatedAchievementsMap = new Map(userAchievements);
        response.user_achievements.forEach(achievement => {
          updatedAchievementsMap.set(achievement.achievement_key, achievement);
        });
        setUserAchievements(updatedAchievementsMap);
      }
      
      return response;
    } catch (err) {
      console.error('Error verifying achievements:', err);
      setError(err.message || 'Error al verificar logros');
      throw err;
    }
  }, [isAuthenticated, user?.id, userProgress, userAchievements, api]);

  const verifyAchievementsByCategory = useCallback(async (category, gameData) => {
    if (!isAuthenticated) return;
    
    const categoryAchievements = achievements.filter(a => a.category === category);
    const response = await api.checkSpecificAchievements(
      user.id, 
      categoryAchievements.map(a => a.key), 
      gameData
    );
    
    return response;
  }, [isAuthenticated, achievements, user?.id, api]);

  // ========================================
  // FUNCIONES DE GESTIÓN DE NOTIFICACIONES
  // ========================================

  const markNotificationAsRead = useCallback((notificationId) => {
    setPendingNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setPendingNotifications([]);
  }, []);

  const dismissNotification = useCallback((achievementKey) => {
    setRecentUnlocks(prev => 
      prev.filter(unlock => unlock.key !== achievementKey)
    );
    markNotificationAsRead(`unlock-${achievementKey}`);
  }, [markNotificationAsRead]);

  const toggleNotificationsPanel = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  // ========================================
  // FUNCIONES DE UTILIDADES
  // ========================================

  const getAchievementByKey = useCallback((key) => {
    return achievements.find(a => a.key === key);
  }, [achievements]);

  const getUserAchievementByKey = useCallback((key) => {
    return userAchievements.get(key);
  }, [userAchievements]);

  const getProgressByKey = useCallback((key) => {
    return userProgress.get(key);
  }, [userProgress]);

  const isAchievementUnlocked = useCallback((key) => {
    const userAchievement = userAchievements.get(key);
    return userAchievement && userAchievement.is_unlocked;
  }, [userAchievements]);

  const getAchievementProgress = useCallback((key) => {
    const progress = userProgress.get(key);
    const achievement = getAchievementByKey(key);
    
    if (!achievement || !progress) return null;
    
    const target = achievement.unlock_conditions.value;
    const current = progress.current_progress;
    const percentage = Math.min((current / target) * 100, 100);
    
    return {
      current,
      target,
      percentage,
      remaining: Math.max(target - current, 0),
      is_complete: percentage >= 100
    };
  }, [userProgress, getAchievementByKey]);

  const getAchievementsByCategory = useCallback((category) => {
    return achievements.filter(a => a.category === category);
  }, [achievements]);

  const getCategoryProgress = useCallback((category) => {
    const categoryAchievements = getAchievementsByCategory(category);
    const unlockedCount = categoryAchievements.filter(a => isAchievementUnlocked(a.key)).length;
    
    return {
      total: categoryAchievements.length,
      unlocked: unlockedCount,
      percentage: categoryAchievements.length > 0 ? (unlockedCount / categoryAchievements.length) * 100 : 0,
      remaining: categoryAchievements.length - unlockedCount
    };
  }, [getAchievementsByCategory, isAchievementUnlocked]);

  // ========================================
  // FUNCIONES DE BÚSQUEDA Y FILTRADO
  // ========================================

  const searchAchievements = useCallback((query) => {
    if (!query) return achievements;
    
    const normalizedQuery = query.toLowerCase();
    return achievements.filter(a => 
      a.name.toLowerCase().includes(normalizedQuery) ||
      a.description.toLowerCase().includes(normalizedQuery) ||
      a.category.toLowerCase().includes(normalizedQuery)
    );
  }, [achievements]);

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => isAchievementUnlocked(a.key));
  }, [achievements, isAchievementUnlocked]);

  const getLockedAchievements = useCallback(() => {
    return achievements.filter(a => !isAchievementUnlocked(a.key));
  }, [achievements, isAchievementUnlocked]);

  const getInProgressAchievements = useCallback(() => {
    return achievements.filter(a => {
      const progress = getAchievementProgress(a.key);
      return progress && progress.current > 0 && !progress.is_complete;
    });
  }, [achievements, getAchievementProgress]);

  const getNearCompletionAchievements = useCallback((threshold = 80) => {
    return achievements.filter(a => {
      const progress = getAchievementProgress(a.key);
      return progress && progress.percentage >= threshold && !progress.is_complete;
    });
  }, [achievements, getAchievementProgress]);

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated) {
      loadAchievements();
      loadUserAchievements();
    } else {
      // Limpiar datos cuando no hay autenticación
      setAchievements([]);
      setUserAchievements(new Map());
      setUserProgress(new Map());
      setCategories([]);
      setRecentUnlocks([]);
      setPendingNotifications([]);
      setError(null);
    }
  }, [isAuthenticated, loadAchievements, loadUserAchievements]);

  // Auto-verificación deshabilitada por ahora
  // Los logros se verifican manualmente cuando se llama a verifyAchievements
  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  // ========================================
  // DATOS DERIVADOS
  // ========================================

  const stats = {
    total_achievements: achievements.length,
    unlocked_achievements: getUnlockedAchievements().length,
    locked_achievements: getLockedAchievements().length,
    in_progress_achievements: getInProgressAchievements().length,
    near_completion_achievements: getNearCompletionAchievements().length,
    completion_percentage: achievements.length > 0 ? (getUnlockedAchievements().length / achievements.length) * 100 : 0,
    recent_unlocks_count: recentUnlocks.length,
    pending_notifications_count: pendingNotifications.length,
    categories_count: categories.length
  };

  const categoryStats = categories.map(category => ({
    ...category,
    progress: getCategoryProgress(category.id)
  }));

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado principal
    achievements,
    userAchievements,
    userProgress,
    categories,
    isLoading,
    error,
    
    // Notificaciones
    recentUnlocks,
    pendingNotifications,
    showNotifications,
    
    // Funciones de carga
    loadAchievements,
    loadUserAchievements,
    
    // Funciones de verificación
    verifyAchievements,
    verifyAchievementsByCategory,
    
    // Gestión de notificaciones
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    toggleNotificationsPanel,
    setShowNotifications,
    
    // Utilidades
    getAchievementByKey,
    getUserAchievementByKey,
    getProgressByKey,
    isAchievementUnlocked,
    getAchievementProgress,
    getAchievementsByCategory,
    getCategoryProgress,
    
    // Búsqueda y filtrado
    searchAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getInProgressAchievements,
    getNearCompletionAchievements,
    
    // Estadísticas
    stats,
    categoryStats,
    
    // Estados booleanos
    hasAchievements: achievements.length > 0,
    hasUnlockedAchievements: getUnlockedAchievements().length > 0,
    hasRecentUnlocks: recentUnlocks.length > 0,
    hasPendingNotifications: pendingNotifications.length > 0,
    hasCategories: categories.length > 0,
    isVerifying: verificationTimeoutRef.current !== null,
    
    // Helpers para UI
    getAchievementTierColor: (tier) => {
      const colors = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#D4A574',
        platinum: '#E5E4E2',
        legendary: '#B8860B'
      };
      return colors[tier] || colors.bronze;
    },
    
    getCategoryColor: (categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      return category?.color_hex || '#D4A574';
    },
    
    formatProgress: (current, target) => {
      return `${current.toLocaleString()} / ${target.toLocaleString()}`;
    },
    
    getProgressBarWidth: (key) => {
      const progress = getAchievementProgress(key);
      return progress ? Math.min(progress.percentage, 100) : 0;
    }
  };
};