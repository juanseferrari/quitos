// src/hooks/useAchievementNotifications.js
// Hook especializado para gestión de notificaciones de logros
// Incluye animaciones cinematográficas y efectos premium

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAchievements } from './useAchievements';

export const useAchievementNotifications = () => {
  const { 
    recentUnlocks, 
    pendingNotifications, 
    showNotifications,
    dismissNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setShowNotifications
  } = useAchievements();
  
  // Estado de animaciones
  const [activeNotification, setActiveNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [animationState, setAnimationState] = useState('idle'); // idle, entering, showing, exiting
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Referencias para control de tiempo
  const notificationTimeoutRef = useRef(null);
  const queueProcessorRef = useRef(null);
  
  // Configuración de animaciones
  const NOTIFICATION_DURATION = 4000; // 4 segundos
  const QUEUE_DELAY = 1000; // 1 segundo entre notificaciones
  const ANIMATION_DURATION = 500; // 0.5 segundos para enter/exit

  // ========================================
  // FUNCIONES DE GESTIÓN DE COLA
  // ========================================

  const addToQueue = useCallback((notification) => {
    setNotificationQueue(prev => [...prev, notification]);
  }, []);

  const processQueue = useCallback(() => {
    if (queueProcessorRef.current) {
      clearTimeout(queueProcessorRef.current);
    }
    
    queueProcessorRef.current = setTimeout(() => {
      setNotificationQueue(prev => {
        if (prev.length === 0 || activeNotification) return prev;
        
        const [next, ...remaining] = prev;
        setActiveNotification(next);
        setAnimationState('entering');
        
        return remaining;
      });
    }, QUEUE_DELAY);
  }, [activeNotification]);

  // ========================================
  // FUNCIONES DE ANIMACIÓN
  // ========================================

  const showNotification = useCallback((notification) => {
    // Limpiar timeout anterior si existe
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Configurar la notificación activa
    setActiveNotification(notification);
    setAnimationState('entering');
    
    // Reproducir sonido si está habilitado
    if (soundEnabled) {
      playNotificationSound(notification.tier);
    }
    
    // Transición a estado "showing"
    setTimeout(() => {
      setAnimationState('showing');
    }, ANIMATION_DURATION);
    
    // Auto-hide después del tiempo configurado
    notificationTimeoutRef.current = setTimeout(() => {
      hideNotification();
    }, NOTIFICATION_DURATION);
  }, [soundEnabled]);

  const hideNotification = useCallback(() => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setAnimationState('exiting');
    
    setTimeout(() => {
      setActiveNotification(null);
      setAnimationState('idle');
      processQueue(); // Procesar siguiente en cola
    }, ANIMATION_DURATION);
  }, [processQueue]);

  const forceHideNotification = useCallback(() => {
    if (activeNotification) {
      markNotificationAsRead(activeNotification.id);
      hideNotification();
    }
  }, [activeNotification, markNotificationAsRead, hideNotification]);

  // ========================================
  // FUNCIONES DE SONIDO
  // ========================================

  const playNotificationSound = useCallback((tier) => {
    if (!soundEnabled) return;
    
    try {
      // Crear contexto de audio si no existe
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Sonidos diferentes según tier del logro
      const frequencies = {
        bronze: [523.25, 659.25], // C5, E5
        silver: [659.25, 783.99], // E5, G5
        gold: [783.99, 987.77], // G5, B5
        platinum: [987.77, 1174.66], // B5, D6
        legendary: [1174.66, 1396.91, 1568] // D6, F6, G6
      };
      
      const notes = frequencies[tier] || frequencies.bronze;
      
      // Reproducir secuencia de notas
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.4);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.4);
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [soundEnabled]);

  // ========================================
  // FUNCIONES DE CONFIGURACIÓN
  // ========================================

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const testNotification = useCallback((tier = 'gold') => {
    const testNotification = {
      id: `test-${Date.now()}`,
      key: 'test_achievement',
      name: 'Logro de Prueba',
      description: 'Esta es una notificación de prueba del sistema',
      tier,
      badge_icon: '🏆',
      points_reward: 100,
      timestamp: new Date().toISOString()
    };
    
    showNotification(testNotification);
  }, [showNotification]);

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const getNotificationStyle = useCallback(() => {
    const baseClasses = [
      'fixed top-4 right-4 z-50',
      'max-w-sm w-full',
      'bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]',
      'border border-[#D4A574] border-opacity-30',
      'rounded-lg p-4',
      'shadow-2xl',
      'transform transition-all duration-500 ease-in-out'
    ];
    
    switch (animationState) {
      case 'entering':
        return [...baseClasses, 'translate-x-full opacity-0 scale-95'].join(' ');
      case 'showing':
        return [...baseClasses, 'translate-x-0 opacity-100 scale-100'].join(' ');
      case 'exiting':
        return [...baseClasses, 'translate-x-full opacity-0 scale-95'].join(' ');
      default:
        return [...baseClasses, 'translate-x-full opacity-0'].join(' ');
    }
  }, [animationState]);

  const getTierEffects = useCallback((tier) => {
    const effects = {
      bronze: {
        glow: 'shadow-[0_0_20px_rgba(205,127,50,0.5)]',
        border: 'border-[#CD7F32]',
        gradient: 'from-[#CD7F32] to-[#A0522D]',
        particles: '✨'
      },
      silver: {
        glow: 'shadow-[0_0_25px_rgba(192,192,192,0.6)]',
        border: 'border-[#C0C0C0]',
        gradient: 'from-[#C0C0C0] to-[#A9A9A9]',
        particles: '⭐'
      },
      gold: {
        glow: 'shadow-[0_0_30px_rgba(212,165,116,0.7)]',
        border: 'border-[#D4A574]',
        gradient: 'from-[#D4A574] to-[#C59660]',
        particles: '🌟'
      },
      platinum: {
        glow: 'shadow-[0_0_35px_rgba(229,228,226,0.8)]',
        border: 'border-[#E5E4E2]',
        gradient: 'from-[#E5E4E2] to-[#D3D3D3]',
        particles: '💫'
      },
      legendary: {
        glow: 'shadow-[0_0_40px_rgba(184,134,11,0.9)]',
        border: 'border-[#B8860B]',
        gradient: 'from-[#B8860B] to-[#DAA520]',
        particles: '✨💫⭐🌟'
      }
    };
    
    return effects[tier] || effects.bronze;
  }, []);

  const formatTimeAgo = useCallback((timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Ahora mismo';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)}d`;
  }, []);

  // ========================================
  // EFECTOS
  // ========================================

  // Procesar nuevas notificaciones
  useEffect(() => {
    if (pendingNotifications.length > 0) {
      pendingNotifications.forEach(notification => {
        addToQueue(notification);
        markNotificationAsRead(notification.id);
      });
    }
  }, [pendingNotifications, addToQueue, markNotificationAsRead]);

  // Procesar cola cuando está inactiva
  useEffect(() => {
    if (!activeNotification && notificationQueue.length > 0) {
      processQueue();
    }
  }, [activeNotification, notificationQueue.length, processQueue]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (queueProcessorRef.current) {
        clearTimeout(queueProcessorRef.current);
      }
    };
  }, []);

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado actual
    activeNotification,
    notificationQueue,
    animationState,
    soundEnabled,
    
    // Funciones de control
    showNotification,
    hideNotification,
    forceHideNotification,
    toggleSound,
    testNotification,
    
    // Funciones de utilidad
    getNotificationStyle,
    getTierEffects,
    formatTimeAgo,
    
    // Estados derivados
    hasActiveNotification: activeNotification !== null,
    queueLength: notificationQueue.length,
    isAnimating: animationState !== 'idle',
    
    // Datos para UI
    recentUnlocks: recentUnlocks.slice(0, 5), // Últimos 5 para panel
    showNotifications,
    setShowNotifications,
    
    // Acciones del panel
    dismissNotification,
    markAllNotificationsAsRead,
    
    // Configuración
    NOTIFICATION_DURATION,
    ANIMATION_DURATION,
    
    // Helpers para componentes
    NotificationContainer: ({ children }) => (
      <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
        <div className="p-4">
          {children}
        </div>
      </div>
    ),
    
    NotificationPanel: ({ isOpen, onClose }) => (
      <div className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className={`absolute top-0 right-0 h-full w-80 bg-[#1a1a1a] shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 border-b border-[#D4A574] border-opacity-30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#D4A574]">🏆 Logros Recientes</h2>
              <button onClick={onClose} className="text-[#F5DEB3] hover:text-[#D4A574]">
                ✕
              </button>
            </div>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            {recentUnlocks.length === 0 ? (
              <div className="p-8 text-center text-[#F5DEB3] opacity-70">
                No hay logros recientes
              </div>
            ) : (
              recentUnlocks.map((unlock) => (
                <div key={unlock.id} className="p-4 border-b border-[#D4A574] border-opacity-10">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{unlock.badge_icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#F5DEB3]">{unlock.name}</h3>
                      <p className="text-sm text-[#F5DEB3] opacity-80">{unlock.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-[#D4A574]">+{unlock.points_reward} puntos</span>
                        <span className="text-xs text-[#F5DEB3] opacity-60">
                          {formatTimeAgo(unlock.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  };
};