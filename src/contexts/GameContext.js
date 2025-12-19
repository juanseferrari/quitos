// src/contexts/GameContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { gameReducer, gameActions } from '../reducers/gameReducer';
import { INITIAL_GAME_STATE, validateGameState } from '../types/gameTypes';

// Crear el contexto
const GameContext = createContext();

// Provider del contexto
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);
  
  // Efecto para detectar cambios en línea/fuera de línea
  useEffect(() => {
    const handleOnline = () => dispatch(gameActions.setOnlineStatus(true));
    const handleOffline = () => dispatch(gameActions.setOnlineStatus(false));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online status
    dispatch(gameActions.setOnlineStatus(navigator.onLine));
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Efecto para cargar estado inicial desde localStorage
  useEffect(() => {
    loadInitialState();
  }, []);
  
  // Función para cargar estado inicial
  const loadInitialState = async () => {
    try {
      const saved = localStorage.getItem('rey-del-truco-state');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Verificar que los datos son válidos y la partida no es muy antigua (24 horas)
        const isRecent = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        
        if (data.game && isRecent && !data.game.ganador) {
          // Validar integridad de datos
          const validation = validateGameState(data);
          
          if (validation.isValid) {
            dispatch(gameActions.restoreGame(data.game));
          } else {
            console.warn('Invalid saved game data:', validation.errors);
            localStorage.removeItem('rey-del-truco-state');
          }
        } else {
          // Datos muy antiguos o partida terminada
          localStorage.removeItem('rey-del-truco-state');
        }
      }
    } catch (error) {
      console.error('Error loading initial state:', error);
      localStorage.removeItem('rey-del-truco-state');
    }
  };
  
  // Función para guardar estado en localStorage
  const saveState = useCallback((gameState) => {
    try {
      // Solo guardar si hay una partida en progreso (no terminada)
      if (!gameState.game.ganador && 
          (gameState.game.puntosNos > 0 || 
           gameState.game.puntosEllos > 0 || 
           gameState.game.historial.length > 0)) {
        
        const dataToSave = {
          game: gameState.game,
          localData: gameState.localData,
          timestamp: Date.now(),
          version: gameState.meta.version
        };
        
        localStorage.setItem('rey-del-truco-state', JSON.stringify(dataToSave));
      } else {
        // Limpiar si la partida terminó
        localStorage.removeItem('rey-del-truco-state');
      }
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, []);
  
  // Efecto para auto-guardar cuando cambie el estado
  useEffect(() => {
    if (state.meta.needsSync) {
      saveState(state);
      dispatch(gameActions.syncCompleted());
    }
  }, [state.meta.needsSync, state, saveState]);
  
  // Función para limpiar datos guardados
  const clearSavedGame = useCallback(() => {
    localStorage.removeItem('rey-del-truco-state');
  }, []);
  
  // Función para verificar si hay partida guardada
  const hasSavedGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('rey-del-truco-state');
      if (saved) {
        const data = JSON.parse(saved);
        const isRecent = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        return data.game && isRecent && !data.game.ganador;
      }
    } catch (error) {
      console.error('Error checking saved game:', error);
    }
    return false;
  }, []);
  
  // Función para obtener partida guardada
  const getSavedGame = useCallback(() => {
    try {
      const saved = localStorage.getItem('rey-del-truco-state');
      if (saved) {
        const data = JSON.parse(saved);
        const isRecent = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        
        if (data.game && isRecent && !data.game.ganador) {
          const validation = validateGameState(data);
          if (validation.isValid) {
            return data;
          }
        }
      }
    } catch (error) {
      console.error('Error getting saved game:', error);
    }
    return null;
  }, []);
  
  // Función para resetear completamente el estado
  const resetState = useCallback(() => {
    clearSavedGame();
    dispatch(gameActions.newGame());
  }, [clearSavedGame]);
  
  // Función de debug para desarrollo
  const debugState = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Current Game State:', {
        game: state.game,
        ui: state.ui,
        user: state.user,
        localData: state.localData,
        meta: state.meta
      });
      
      const validation = validateGameState(state);
      console.log('State Validation:', validation);
    }
    
    return state;
  }, [state]);
  
  // Valor del contexto
  const contextValue = {
    // Estado
    state,
    dispatch,
    
    // Helpers
    saveState,
    clearSavedGame,
    hasSavedGame,
    getSavedGame,
    resetState,
    debugState,
    
    // Acciones comunes (para conveniencia)
    actions: gameActions
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Hook para usar el contexto
export const useGameContext = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  
  return context;
};

// Export del contexto para casos especiales
export { GameContext };