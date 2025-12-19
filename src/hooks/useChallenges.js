// src/hooks/useChallenges.js
// Hook para gestión del sistema de desafíos
// Integrado con el sistema de juego existente

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useStats } from './useStats';
import { mockSocialService } from '../services/mockSocialService';

export const useChallenges = () => {
  const { user, isAuthenticated } = useAuth();
  const { userStats, rivalries } = useStats();
  
  // Estado de desafíos
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingChallenge, setSendingChallenge] = useState(null);

  // Configuración
  const api = mockSocialService; // TODO: Reemplazar con API real

  // ========================================
  // FUNCIONES DE CARGA DE DESAFÍOS
  // ========================================

  const loadChallenges = useCallback(async (options = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getChallenges({
        status: options.status || 'pending',
        type: options.type || 'received'
      });
      
      setChallenges(response.challenges);
      return response;
    } catch (err) {
      console.error('Error loading challenges:', err);
      setError(err.message || 'Error al cargar desafíos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  // ========================================
  // FUNCIONES DE ENVÍO DE DESAFÍOS
  // ========================================

  const sendChallenge = useCallback(async (targetUserId, options = {}) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para enviar desafíos');
    }

    try {
      setSendingChallenge(targetUserId);
      setError(null);
      
      const {
        type = 'friendly',
        message = '',
        context = null
      } = options;
      
      // Obtener contexto de la rivalidad si existe
      const rivalry = rivalries.find(r => r.rival.id === targetUserId);
      let challengeContext = context;
      
      if (!challengeContext && rivalry) {
        challengeContext = {
          last_game: rivalry.lastGame ? {
            result: rivalry.lastGame.won ? 'won' : 'lost',
            score: `${rivalry.lastGame.puntosNos}-${rivalry.lastGame.puntosEllos}`,
            description: rivalry.lastGame.won ? 'Victoria' : 'Derrota'
          } : null,
          head_to_head: {
            record: `${rivalry.ganadas}-${rivalry.perdidas}`,
            winner: rivalry.dominancia > 0 ? 'you' : rivalry.dominancia < 0 ? 'opponent' : 'tie',
            win_rate: rivalry.winRate
          }
        };
      }
      
      const response = await api.sendChallenge(targetUserId, type, message);
      
      // Actualizar lista de desafíos
      await loadChallenges({ type: 'sent' });
      
      return response;
    } catch (err) {
      console.error('Error sending challenge:', err);
      setError(err.message || 'Error al enviar desafío');
      throw err;
    } finally {
      setSendingChallenge(null);
    }
  }, [isAuthenticated, api, rivalries, loadChallenges]);

  const sendRevengeChallenge = useCallback(async (targetUserId, lastGameResult) => {
    const message = lastGameResult.won 
      ? 'Te toca perder de nuevo' 
      : 'Esta vez te gano';
    
    return sendChallenge(targetUserId, {
      type: 'revenge',
      message,
      context: {
        last_game: lastGameResult,
        motivation: lastGameResult.won ? 'domination' : 'revenge'
      }
    });
  }, [sendChallenge]);

  const sendFriendlyChallenge = useCallback(async (targetUserId, message = '¿Jugamos una partida?') => {
    return sendChallenge(targetUserId, {
      type: 'friendly',
      message
    });
  }, [sendChallenge]);

  const sendRankingChallenge = useCallback(async (targetUserId, rankingContext) => {
    const message = `¡Desafío por el ranking ${rankingContext.location}!`;
    
    return sendChallenge(targetUserId, {
      type: 'ranking',
      message,
      context: {
        ranking: rankingContext
      }
    });
  }, [sendChallenge]);

  // ========================================
  // FUNCIONES DE RESPUESTA A DESAFÍOS
  // ========================================

  const respondToChallenge = useCallback(async (challengeId, action, message = '') => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para responder desafíos');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.respondToChallenge(challengeId, action, message);
      
      // Actualizar lista de desafíos
      await loadChallenges();
      
      return response;
    } catch (err) {
      console.error('Error responding to challenge:', err);
      setError(err.message || 'Error al responder desafío');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api, loadChallenges]);

  const acceptChallenge = useCallback(async (challengeId, message = '¡Acepto el desafío!') => {
    return respondToChallenge(challengeId, 'accept', message);
  }, [respondToChallenge]);

  const rejectChallenge = useCallback(async (challengeId, message = 'No puedo jugar ahora') => {
    return respondToChallenge(challengeId, 'reject', message);
  }, [respondToChallenge]);

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const refreshChallenges = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      await Promise.all([
        loadChallenges({ type: 'received' }),
        loadChallenges({ type: 'sent' })
      ]);
    } catch (err) {
      console.error('Error refreshing challenges:', err);
    }
  }, [isAuthenticated, loadChallenges]);

  const getChallengeById = useCallback((challengeId) => {
    return challenges.find(c => c.id === challengeId);
  }, [challenges]);

  const getChallengesFromUser = useCallback((userId) => {
    return challenges.filter(c => c.challenger.id === userId);
  }, [challenges]);

  const getChallengesForUser = useCallback((userId) => {
    return challenges.filter(c => c.challenged_user?.id === userId);
  }, [challenges]);

  // ========================================
  // GENERADORES DE CONTEXTO
  // ========================================

  const generateChallengeContext = useCallback((targetUserId, challengeType) => {
    const rivalry = rivalries.find(r => r.rival.id === targetUserId);
    
    if (!rivalry) {
      return {
        type: 'first_time',
        message: 'Primera vez que juegan juntos'
      };
    }

    const contexts = {
      revenge: {
        won_last: rivalry.lastGame?.won ? 
          `Te gané ${rivalry.lastGame.puntosNos}-${rivalry.lastGame.puntosEllos}` :
          `Me ganaste ${rivalry.lastGame.puntosEllos}-${rivalry.lastGame.puntosNos}`,
        dominance: rivalry.dominancia > 0 ? 
          `Te domino ${rivalry.ganadas}-${rivalry.perdidas}` :
          `Me dominás ${rivalry.perdidas}-${rivalry.ganadas}`,
        streak: rivalry.racha > 0 ? 
          `Llevo ${rivalry.racha} victorias seguidas` :
          `Llevás ${Math.abs(rivalry.racha)} victorias seguidas`
      },
      friendly: {
        balanced: rivalry.dominancia === 0 ? 
          `Estamos ${rivalry.ganadas}-${rivalry.perdidas}` : null,
        fun: 'Hora de una partida divertida'
      },
      ranking: {
        climb: 'Subamos juntos en el ranking',
        competitive: 'A ver quién sube más alto'
      }
    };

    return contexts[challengeType] || contexts.friendly;
  }, [rivalries]);

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar desafíos iniciales
  useEffect(() => {
    if (isAuthenticated) {
      loadChallenges();
    } else {
      setChallenges([]);
      setError(null);
    }
  }, [isAuthenticated, loadChallenges]);

  // ========================================
  // DATOS DERIVADOS
  // ========================================

  const challengeStats = {
    total: challenges.length,
    received: challenges.filter(c => c.type === 'received').length,
    sent: challenges.filter(c => c.type === 'sent').length,
    pending: challenges.filter(c => c.status === 'pending').length,
    accepted: challenges.filter(c => c.status === 'accepted').length,
    rejected: challenges.filter(c => c.status === 'rejected').length,
    by_type: {
      revenge: challenges.filter(c => c.challenge_details?.type === 'revenge').length,
      friendly: challenges.filter(c => c.challenge_details?.type === 'friendly').length,
      ranking: challenges.filter(c => c.challenge_details?.type === 'ranking').length
    }
  };

  const pendingChallenges = challenges.filter(c => c.status === 'pending');
  const receivedChallenges = challenges.filter(c => c.type === 'received');
  const sentChallenges = challenges.filter(c => c.type === 'sent');

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado principal
    challenges,
    isLoading,
    error,
    sendingChallenge,
    
    // Funciones de carga
    loadChallenges,
    refreshChallenges,
    
    // Funciones de envío
    sendChallenge,
    sendRevengeChallenge,
    sendFriendlyChallenge,
    sendRankingChallenge,
    
    // Funciones de respuesta
    respondToChallenge,
    acceptChallenge,
    rejectChallenge,
    
    // Utilidades
    getChallengeById,
    getChallengesFromUser,
    getChallengesForUser,
    generateChallengeContext,
    
    // Datos derivados
    challengeStats,
    pendingChallenges,
    receivedChallenges,
    sentChallenges,
    
    // Estados booleanos
    hasChallenges: challenges.length > 0,
    hasPendingChallenges: pendingChallenges.length > 0,
    hasReceivedChallenges: receivedChallenges.length > 0,
    hasSentChallenges: sentChallenges.length > 0,
    isSendingChallenge: sendingChallenge !== null,
    
    // Helpers
    canSendChallengeTo: (userId) => {
      // No se puede enviar desafío a sí mismo
      if (userId === user?.id) return false;
      
      // Verificar si ya hay un desafío pendiente
      const existingChallenge = challenges.find(c => 
        c.challenged_user?.id === userId && 
        c.status === 'pending'
      );
      
      return !existingChallenge;
    },
    
    hasChallengePendingWith: (userId) => {
      return challenges.some(c => 
        (c.challenger.id === userId || c.challenged_user?.id === userId) &&
        c.status === 'pending'
      );
    },
    
    // Filtros rápidos
    getRevengeOpportunities: () => {
      return rivalries.filter(r => 
        r.lastGame && !r.lastGame.won && // Perdimos el último juego
        !challenges.some(c => c.challenged_user?.id === r.rival.id && c.status === 'pending')
      );
    },
    
    getDominationOpportunities: () => {
      return rivalries.filter(r => 
        r.dominancia > 0 && r.racha > 2 && // Dominamos y tenemos racha
        !challenges.some(c => c.challenged_user?.id === r.rival.id && c.status === 'pending')
      );
    }
  };
};