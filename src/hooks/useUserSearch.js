// src/hooks/useUserSearch.js
// Hook para búsqueda de usuarios y sugerencias de amigos
// Integrado con el sistema de autenticación existente

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { mockSocialService } from '../services/mockSocialService';

// Hook personalizado para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useUserSearch = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Configuración
  const api = mockSocialService; // TODO: Reemplazar con API real
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ========================================
  // FUNCIONES DE BÚSQUEDA
  // ========================================

  const searchUsers = useCallback(async (term, options = {}) => {
    if (!isAuthenticated) {
      setSearchResults([]);
      return;
    }

    // No buscar si el término está vacío
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.searchUsers(term, {
        limit: options.limit || 10,
        exclude_friends: options.exclude_friends !== false,
        location_radius: options.location_radius
      });
      
      setSearchResults(response.users);
      
      // Agregar al historial de búsqueda si hay resultados
      if (response.users.length > 0) {
        setSearchHistory(prev => {
          const newHistory = [term, ...prev.filter(h => h !== term)];
          return newHistory.slice(0, 10); // Mantener solo los últimos 10
        });
      }
      
      return response;
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.message || 'Error al buscar usuarios');
      setSearchResults([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  const loadSuggestions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setError(null);
      
      const response = await api.getFriendSuggestions();
      setSuggestions(response.suggestions);
      
      return response;
    } catch (err) {
      console.error('Error loading suggestions:', err);
      setError(err.message || 'Error al cargar sugerencias');
      throw err;
    }
  }, [isAuthenticated, api]);

  // ========================================
  // FUNCIONES DE FILTRADO AVANZADO
  // ========================================

  const searchByLocation = useCallback(async (city, province = null) => {
    if (!isAuthenticated) return [];

    try {
      setIsLoading(true);
      
      // Simular búsqueda por ubicación
      const response = await api.searchUsers(city, {
        location_radius: 50 // 50km radius
      });
      
      let results = response.users;
      
      // Filtrar por provincia si se especifica
      if (province) {
        results = results.filter(user => 
          user.province?.toLowerCase() === province.toLowerCase()
        );
      }
      
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Error searching by location:', err);
      setError(err.message || 'Error al buscar por ubicación');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  const searchBySkillLevel = useCallback(async (minWinRate, maxWinRate) => {
    if (!isAuthenticated) return [];

    try {
      setIsLoading(true);
      
      const response = await api.searchUsers('', { limit: 50 });
      
      const results = response.users.filter(user => 
        user.win_rate >= minWinRate && user.win_rate <= maxWinRate
      );
      
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Error searching by skill level:', err);
      setError(err.message || 'Error al buscar por nivel');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, api]);

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
  }, []);

  const refreshSuggestions = useCallback(async () => {
    await loadSuggestions();
  }, [loadSuggestions]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // ========================================
  // EFECTOS
  // ========================================

  // Buscar cuando el término cambie (con debounce)
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchUsers(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, searchUsers]);

  // Cargar sugerencias al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setSearchResults([]);
      setSearchHistory([]);
    }
  }, [isAuthenticated, loadSuggestions]);

  // ========================================
  // DATOS DERIVADOS
  // ========================================

  const searchData = useMemo(() => {
    // Filtrar usuarios bloqueados de los resultados
    const filteredResults = searchResults.filter(user => 
      user.relationship_status !== 'blocked'
    );

    // Categorizar sugerencias por razón
    const suggestionsByCategory = suggestions.reduce((acc, suggestion) => {
      let category = 'other';
      if (suggestion.reason.includes('amigos en común')) category = 'mutual_friends';
      else if (suggestion.reason.includes('nivel de juego')) category = 'skill_level';
      else if (suggestion.reason.includes('ciudad')) category = 'location';
      else if (suggestion.reason.includes('algoritmo')) category = 'algorithm';
      
      if (!acc[category]) acc[category] = [];
      acc[category].push(suggestion);
      return acc;
    }, {});

    // Estadísticas de búsqueda
    const searchStats = {
      total_results: filteredResults.length,
      online_results: filteredResults.filter(u => u.is_online).length,
      local_results: filteredResults.filter(u => u.city === user?.city).length,
      high_skill_results: filteredResults.filter(u => u.win_rate > 70).length
    };

    return {
      filteredResults,
      suggestionsByCategory,
      searchStats
    };
  }, [searchResults, suggestions, user?.city]);

  // ========================================
  // RETURN
  // ========================================

  return {
    // Estado de búsqueda
    searchTerm,
    setSearchTerm,
    searchResults: searchData.filteredResults,
    suggestions,
    isLoading,
    error,
    searchHistory,
    
    // Funciones de búsqueda
    searchUsers,
    searchByLocation,
    searchBySkillLevel,
    loadSuggestions,
    
    // Utilidades
    clearSearch,
    refreshSuggestions,
    clearHistory,
    
    // Datos derivados
    suggestionsByCategory: searchData.suggestionsByCategory,
    searchStats: searchData.searchStats,
    
    // Estados booleanos
    hasSearchTerm: searchTerm.length > 0,
    hasResults: searchData.filteredResults.length > 0,
    hasSuggestions: suggestions.length > 0,
    hasHistory: searchHistory.length > 0,
    isSearching: isLoading && searchTerm.length > 0,
    
    // Helpers de estado
    isEmpty: !isLoading && searchTerm.length > 0 && searchData.filteredResults.length === 0,
    isReady: !isLoading && isAuthenticated,
    
    // Filtros rápidos
    getOnlineUsers: () => searchData.filteredResults.filter(u => u.is_online),
    getLocalUsers: () => searchData.filteredResults.filter(u => u.city === user?.city),
    getHighSkillUsers: () => searchData.filteredResults.filter(u => u.win_rate > 70),
    
    // Sugerencias filtradas
    getMutualFriendsSuggestions: () => searchData.suggestionsByCategory.mutual_friends || [],
    getLocationSuggestions: () => searchData.suggestionsByCategory.location || [],
    getSkillSuggestions: () => searchData.suggestionsByCategory.skill_level || [],
    
    // Utilidades de usuario
    getUserById: (id) => searchData.filteredResults.find(u => u.id === id),
    isUserInResults: (userId) => searchData.filteredResults.some(u => u.id === userId),
    
    // Métricas
    getSearchResultsCount: () => searchData.filteredResults.length,
    getSuggestionsCount: () => suggestions.length,
    getSearchHistoryCount: () => searchHistory.length
  };
};