// src/hooks/useFriends.js
// Hook para gestión del sistema de amigos
// Integrado con el contexto de autenticación existente

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { mockSocialService } from '../services/mockSocialService';

export const useFriends = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Estado del sistema de amigos
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Configuración del servicio
  const api = mockSocialService; // TODO: Reemplazar con API real cuando esté disponible

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const loadFriends = useCallback(async (options = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getFriends(options);
      setFriends(response.friends);
      
      return response;
    } catch (err) {
      console.error('Error loading friends:', err);
      setError(err.message || 'Error al cargar amigos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  const loadFriendRequests = useCallback(async (options = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      
      const response = await api.getFriendRequests(options);
      setFriendRequests(response.requests);
      
      return response;
    } catch (err) {
      console.error('Error loading friend requests:', err);
      setError(err.message || 'Error al cargar solicitudes');
      throw err;
    }
  }, [isAuthenticated, api]);

  // ========================================
  // ACCIONES DE AMIGOS
  // ========================================

  const sendFriendRequest = useCallback(async (userId, message = '') => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para enviar solicitudes');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.sendFriendRequest(userId, message);
      
      // Actualizar solicitudes después de enviar
      await loadFriendRequests();
      
      return response;
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError(err.message || 'Error al enviar solicitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api, loadFriendRequests]);

  const respondToRequest = useCallback(async (requestId, action, message = '') => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para responder solicitudes');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.respondToFriendRequest(requestId, action, message);
      
      // Actualizar solicitudes después de responder
      await loadFriendRequests();
      
      // Si se aceptó, actualizar lista de amigos
      if (action === 'accept') {
        await loadFriends();
      }
      
      return response;
    } catch (err) {
      console.error('Error responding to friend request:', err);
      setError(err.message || 'Error al responder solicitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api, loadFriendRequests, loadFriends]);

  const removeFriend = useCallback(async (friendId) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para eliminar amigos');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.removeFriend(friendId);
      
      // Actualizar lista de amigos optimísticamente
      setFriends(prev => prev.filter(f => f.id !== friendId));
      
      return response;
    } catch (err) {
      console.error('Error removing friend:', err);
      setError(err.message || 'Error al eliminar amigo');
      
      // Recargar amigos en caso de error
      await loadFriends();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api, loadFriends]);

  const blockUser = useCallback(async (userId, reason = '') => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para bloquear usuarios');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.blockUser(userId, reason);
      
      // Actualizar lista de amigos optimísticamente
      setFriends(prev => prev.filter(f => f.id !== userId));
      
      return response;
    } catch (err) {
      console.error('Error blocking user:', err);
      setError(err.message || 'Error al bloquear usuario');
      
      // Recargar amigos en caso de error
      await loadFriends();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api, loadFriends]);

  // ========================================
  // FUNCIONES DE BÚSQUEDA
  // ========================================

  const searchFriends = useCallback(async (searchTerm, options = {}) => {
    if (!isAuthenticated) return [];
    
    try {
      const response = await loadFriends({
        search: searchTerm,
        ...options
      });
      return response.friends;
    } catch (err) {
      console.error('Error searching friends:', err);
      return [];
    }
  }, [isAuthenticated, loadFriends]);

  // ========================================
  // FUNCIONES DE REFRESH
  // ========================================

  const refreshFriends = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setRefreshing(true);
      await Promise.all([
        loadFriends(),
        loadFriendRequests()
      ]);
    } catch (err) {
      console.error('Error refreshing friends data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, loadFriends, loadFriendRequests]);

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar datos iniciales cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      loadFriends();
      loadFriendRequests();
    } else {
      // Limpiar datos cuando el usuario cierra sesión
      setFriends([]);
      setFriendRequests([]);
      setError(null);
    }
  }, [isAuthenticated, loadFriends, loadFriendRequests]);

  // ========================================
  // DATOS DERIVADOS
  // ========================================

  const friendsData = {
    // Contadores básicos
    totalFriends: friends.length,
    onlineFriends: friends.filter(f => f.is_online).length,
    offlineFriends: friends.filter(f => !f.is_online).length,
    
    // Solicitudes
    pendingRequestsCount: friendRequests.filter(r => r.type === 'received').length,
    sentRequestsCount: friendRequests.filter(r => r.type === 'sent').length,
    
    // Amigos por ciudad (útil para rankings locales)
    friendsByCity: friends.reduce((acc, friend) => {
      const city = friend.city || 'Sin especificar';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {}),
    
    // Rivales frecuentes (amigos con los que se han jugado más partidos)
    frequentRivals: friends
      .filter(f => f.games_played_together > 5)
      .sort((a, b) => b.games_played_together - a.games_played_together)
      .slice(0, 5),
    
    // Mejores amigos (mejor ratio head-to-head)
    bestRivals: friends
      .filter(f => f.head_to_head && f.head_to_head.wins > f.head_to_head.losses)
      .sort((a, b) => {
        const aRatio = a.head_to_head.wins / (a.head_to_head.wins + a.head_to_head.losses);
        const bRatio = b.head_to_head.wins / (b.head_to_head.wins + b.head_to_head.losses);
        return bRatio - aRatio;
      })
      .slice(0, 5)
  };

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado
    friends,
    friendRequests,
    isLoading,
    error,
    refreshing,
    
    // Acciones principales
    sendFriendRequest,
    respondToRequest,
    removeFriend,
    blockUser,
    
    // Búsqueda
    searchFriends,
    
    // Utilidades
    refreshFriends,
    loadFriends,
    loadFriendRequests,
    
    // Datos derivados
    ...friendsData,
    
    // Helpers
    getFriendById: (id) => friends.find(f => f.id === id),
    isFriend: (userId) => friends.some(f => f.id === userId),
    hasRequestFrom: (userId) => friendRequests.some(r => r.user.id === userId && r.type === 'received'),
    hasSentRequestTo: (userId) => friendRequests.some(r => r.user.id === userId && r.type === 'sent'),
    
    // Estado de UI
    isEmpty: friends.length === 0,
    hasRequests: friendRequests.length > 0,
    isReady: !isLoading && isAuthenticated
  };
};