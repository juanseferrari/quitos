// src/types/gameTypes.js

// Tipos de acciones del reducer
export const GAME_ACTIONS = {
  // Acciones del juego
  ADD_POINT: 'ADD_POINT',
  SUBTRACT_POINT: 'SUBTRACT_POINT',
  FALTA_ENVIDO: 'FALTA_ENVIDO',
  
  // Control del juego
  NEW_GAME: 'NEW_GAME',
  END_GAME: 'END_GAME',
  RESTORE_GAME: 'RESTORE_GAME',
  CLEAR_WINNER: 'CLEAR_WINNER',
  
  // Configuración
  SET_PLAYER_NAMES: 'SET_PLAYER_NAMES',
  SET_TOTAL_POINTS: 'SET_TOTAL_POINTS',
  
  // UI
  SET_SCREEN: 'SET_SCREEN',
  TOGGLE_MODAL_FALTA: 'TOGGLE_MODAL_FALTA',
  TOGGLE_MODAL_VICTORIA: 'TOGGLE_MODAL_VICTORIA',
  TOGGLE_MODAL_REINICIAR: 'TOGGLE_MODAL_REINICIAR',
  
  // Metadata
  MARK_FOR_SYNC: 'MARK_FOR_SYNC',
  SYNC_COMPLETED: 'SYNC_COMPLETED',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  MARK_GAME_RECORDED: 'MARK_GAME_RECORDED',
  
  // User/Auth (preparado para Fase 1)
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT'
};

// Pantallas de la aplicación
export const SCREENS = {
  INICIO: 'inicio',
  JUEGO: 'juego',
  HISTORIAL: 'historial'
};

// Tipos de jugadores
export const PLAYERS = {
  NOS: 'nos',
  ELLOS: 'ellos'
};

// Tipos de acciones en el historial
export const HISTORY_ACTIONS = {
  ADD_POINT: '+',
  SUBTRACT_POINT: '−',
  FALTA_ENVIDO: 'Falta Envido'
};

// Estado inicial del juego
export const INITIAL_GAME_STATE = {
  // Datos del juego actual
  game: {
    id: null,
    puntosNos: 0,
    puntosEllos: 0,
    jugador1: 'Nosotros',
    jugador2: 'Ellos',
    puntosTotales: 30,
    ganador: null,
    fechaInicio: null,
    fechaFin: null,
    historial: []
  },
  
  // Configuración de UI
  ui: {
    pantallaActual: SCREENS.INICIO,
    mostrarModalFalta: false,
    mostrarModalVictoria: false,
    mostrarModalReiniciar: false,
    loading: false,
    error: null
  },
  
  // Datos de usuario (preparado para auth)
  user: {
    id: null,
    isAuthenticated: false,
    profile: null,
    preferences: {
      defaultPoints: 30,
      sounds: true,
      haptics: true,
      theme: 'rey-del-truco'
    }
  },
  
  // Datos locales (sin auth)
  localData: {
    partidasJugadas: 0,
    victoriasNos: 0,
    victoriasEllos: 0,
    historialCompleto: [],
    configuracionGuardada: null
  },
  
  // Metadata del estado
  meta: {
    version: '1.0.0',
    lastUpdated: Date.now(),
    needsSync: false,
    isOnline: navigator.onLine || true,
    hasUnsavedChanges: false,
    gameRecordedInStats: false
  }
};

// Generador de IDs únicos
export const generateGameId = () => `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generador de entradas de historial
export const createHistoryEntry = (equipo, accion, puntoAnterior, puntoNuevo) => {
  const ahora = new Date();
  return {
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    equipo,
    accion,
    puntoAnterior,
    puntoNuevo,
    hora: ahora.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }),
    timestamp: ahora.getTime()
  };
};

// Validadores de estado
export const validateGameState = (state) => {
  const errors = [];
  
  // Validar puntos
  if (state.game.puntosNos < 0 || state.game.puntosEllos < 0) {
    errors.push('Los puntos no pueden ser negativos');
  }
  
  if (state.game.puntosNos > state.game.puntosTotales || state.game.puntosEllos > state.game.puntosTotales) {
    errors.push('Los puntos no pueden exceder el total');
  }
  
  // Validar nombres
  if (!state.game.jugador1.trim() || !state.game.jugador2.trim()) {
    errors.push('Los nombres de jugadores no pueden estar vacíos');
  }
  
  // Validar historial
  if (!Array.isArray(state.game.historial)) {
    errors.push('El historial debe ser un array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utilidades de juego
export const gameUtils = {
  // Verificar si hay ganador
  hasWinner: (state) => {
    return state.game.puntosNos >= state.game.puntosTotales || 
           state.game.puntosEllos >= state.game.puntosTotales;
  },
  
  // Obtener el ganador
  getWinner: (state) => {
    if (state.game.puntosNos >= state.game.puntosTotales) return PLAYERS.NOS;
    if (state.game.puntosEllos >= state.game.puntosTotales) return PLAYERS.ELLOS;
    return null;
  },
  
  // Verificar si la partida está en progreso
  isGameInProgress: (state) => {
    return state.game.puntosNos > 0 || state.game.puntosEllos > 0 || state.game.historial.length > 0;
  },
  
  // Calcular puntos de falta envido
  calculateFaltaEnvidoPoints: (state, equipoGanador) => {
    if (equipoGanador === PLAYERS.NOS) {
      return state.game.puntosTotales - state.game.puntosEllos;
    } else {
      return state.game.puntosTotales - state.game.puntosNos;
    }
  },
  
  // Verificar si falta envido gana el partido
  faltaEnvidoWinsGame: (state, equipoGanador) => {
    const puntosActuales = equipoGanador === PLAYERS.NOS ? state.game.puntosNos : state.game.puntosEllos;
    const puntosAGanar = gameUtils.calculateFaltaEnvidoPoints(state, equipoGanador);
    return puntosActuales + puntosAGanar >= state.game.puntosTotales;
  },
  
  // Verificar si el jugador está "al verde" (29 puntos)
  isAlVerde: (puntos, puntosTotales) => {
    return puntos === puntosTotales - 1;
  }
};