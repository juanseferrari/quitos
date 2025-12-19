// src/reducers/gameReducer.js
import { 
  GAME_ACTIONS, 
  PLAYERS, 
  HISTORY_ACTIONS, 
  INITIAL_GAME_STATE,
  createHistoryEntry,
  generateGameId,
  gameUtils 
} from '../types/gameTypes';

export const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.ADD_POINT: {
      const { player } = action.payload;
      
      // No permitir sumar puntos si hay ganador
      if (gameUtils.hasWinner(state)) {
        return state;
      }
      
      // No permitir superar el límite
      const currentPoints = player === PLAYERS.NOS ? state.game.puntosNos : state.game.puntosEllos;
      if (currentPoints >= state.game.puntosTotales) {
        return state;
      }
      
      const newPoints = currentPoints + 1;
      const historyEntry = createHistoryEntry(
        player,
        HISTORY_ACTIONS.ADD_POINT,
        currentPoints,
        newPoints
      );
      
      const newState = {
        ...state,
        game: {
          ...state.game,
          [player === PLAYERS.NOS ? 'puntosNos' : 'puntosEllos']: newPoints,
          historial: [historyEntry, ...state.game.historial],
          fechaInicio: state.game.fechaInicio || Date.now()
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: true,
          hasUnsavedChanges: true
        }
      };
      
      // Verificar victoria
      if (newPoints >= state.game.puntosTotales) {
        newState.game.ganador = player;
        newState.game.fechaFin = Date.now();
        newState.ui.mostrarModalVictoria = true;
        newState.meta.needsSync = true;
        
        // Actualizar estadísticas locales
        newState.localData = {
          ...state.localData,
          partidasJugadas: state.localData.partidasJugadas + 1,
          [player === PLAYERS.NOS ? 'victoriasNos' : 'victoriasEllos']: 
            state.localData[player === PLAYERS.NOS ? 'victoriasNos' : 'victoriasEllos'] + 1,
          historialCompleto: [
            ...state.localData.historialCompleto,
            {
              ...newState.game,
              completedAt: Date.now()
            }
          ]
        };
      }
      
      return newState;
    }
    
    case GAME_ACTIONS.SUBTRACT_POINT: {
      const { player } = action.payload;
      
      // No permitir restar si hay ganador (a menos que sea para deshacer victoria)
      if (gameUtils.hasWinner(state) && !action.payload.allowWithWinner) {
        return state;
      }
      
      const currentPoints = player === PLAYERS.NOS ? state.game.puntosNos : state.game.puntosEllos;
      if (currentPoints <= 0) {
        return state;
      }
      
      const newPoints = currentPoints - 1;
      const historyEntry = createHistoryEntry(
        player,
        HISTORY_ACTIONS.SUBTRACT_POINT,
        currentPoints,
        newPoints
      );
      
      const newState = {
        ...state,
        game: {
          ...state.game,
          [player === PLAYERS.NOS ? 'puntosNos' : 'puntosEllos']: newPoints,
          historial: [historyEntry, ...state.game.historial],
          ganador: null, // Limpiar ganador si se resta punto
          fechaFin: null
        },
        ui: {
          ...state.ui,
          mostrarModalVictoria: false
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: true,
          hasUnsavedChanges: true
        }
      };
      
      return newState;
    }
    
    case GAME_ACTIONS.FALTA_ENVIDO: {
      const { equipoGanador } = action.payload;
      
      // No permitir falta envido si hay ganador
      if (gameUtils.hasWinner(state)) {
        return state;
      }
      
      const puntosAGanar = gameUtils.calculateFaltaEnvidoPoints(state, equipoGanador);
      const currentPoints = equipoGanador === PLAYERS.NOS ? state.game.puntosNos : state.game.puntosEllos;
      const newPoints = Math.min(state.game.puntosTotales, currentPoints + puntosAGanar);
      
      const historyEntry = createHistoryEntry(
        equipoGanador,
        HISTORY_ACTIONS.FALTA_ENVIDO,
        currentPoints,
        newPoints
      );
      
      const newState = {
        ...state,
        game: {
          ...state.game,
          [equipoGanador === PLAYERS.NOS ? 'puntosNos' : 'puntosEllos']: newPoints,
          historial: [historyEntry, ...state.game.historial],
          fechaInicio: state.game.fechaInicio || Date.now()
        },
        ui: {
          ...state.ui,
          mostrarModalFalta: false
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: true,
          hasUnsavedChanges: true
        }
      };
      
      // Verificar victoria por falta envido
      if (newPoints >= state.game.puntosTotales) {
        newState.game.ganador = equipoGanador;
        newState.game.fechaFin = Date.now();
        newState.ui.mostrarModalVictoria = true;
        
        // Actualizar estadísticas locales
        newState.localData = {
          ...state.localData,
          partidasJugadas: state.localData.partidasJugadas + 1,
          [equipoGanador === PLAYERS.NOS ? 'victoriasNos' : 'victoriasEllos']: 
            state.localData[equipoGanador === PLAYERS.NOS ? 'victoriasNos' : 'victoriasEllos'] + 1,
          historialCompleto: [
            ...state.localData.historialCompleto,
            {
              ...newState.game,
              completedAt: Date.now()
            }
          ]
        };
      }
      
      return newState;
    }
    
    case GAME_ACTIONS.NEW_GAME: {
      const { configuracion = {} } = action.payload || {};
      
      return {
        ...state,
        game: {
          ...INITIAL_GAME_STATE.game,
          id: generateGameId(),
          jugador1: configuracion.jugador1 || state.game.jugador1 || 'Nosotros',
          jugador2: configuracion.jugador2 || state.game.jugador2 || 'Ellos',
          puntosTotales: configuracion.puntosTotales || state.game.puntosTotales || 30,
          fechaInicio: null, // Se setea cuando se suma el primer punto
          fechaFin: null
        },
        ui: {
          ...state.ui,
          mostrarModalFalta: false,
          mostrarModalVictoria: false,
          error: null
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: true,
          hasUnsavedChanges: false,
          gameRecordedInStats: false // Reset flag para nuevo juego
        }
      };
    }
    
    case GAME_ACTIONS.RESTORE_GAME: {
      const { savedGame } = action.payload;
      
      return {
        ...state,
        game: {
          ...state.game,
          ...savedGame,
          id: savedGame.id || generateGameId()
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: false,
          hasUnsavedChanges: false
        }
      };
    }
    
    case GAME_ACTIONS.CLEAR_WINNER: {
      return {
        ...state,
        game: {
          ...state.game,
          ganador: null,
          fechaFin: null
        },
        ui: {
          ...state.ui,
          mostrarModalVictoria: false
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now()
        }
      };
    }
    
    case GAME_ACTIONS.SET_PLAYER_NAMES: {
      const { jugador1, jugador2 } = action.payload;
      
      return {
        ...state,
        game: {
          ...state.game,
          jugador1: jugador1 || state.game.jugador1,
          jugador2: jugador2 || state.game.jugador2
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: true
        }
      };
    }
    
    case GAME_ACTIONS.SET_TOTAL_POINTS: {
      const { puntosTotales } = action.payload;
      
      return {
        ...state,
        game: {
          ...state.game,
          puntosTotales: puntosTotales
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now(),
          needsSync: true
        }
      };
    }
    
    case GAME_ACTIONS.SET_SCREEN: {
      const { screen } = action.payload;
      
      return {
        ...state,
        ui: {
          ...state.ui,
          pantallaActual: screen
        },
        meta: {
          ...state.meta,
          lastUpdated: Date.now()
        }
      };
    }
    
    case GAME_ACTIONS.TOGGLE_MODAL_FALTA: {
      const { show } = action.payload || {};
      
      return {
        ...state,
        ui: {
          ...state.ui,
          mostrarModalFalta: show !== undefined ? show : !state.ui.mostrarModalFalta
        }
      };
    }
    
    case GAME_ACTIONS.TOGGLE_MODAL_VICTORIA: {
      const { show } = action.payload || {};

      return {
        ...state,
        ui: {
          ...state.ui,
          mostrarModalVictoria: show !== undefined ? show : !state.ui.mostrarModalVictoria
        }
      };
    }

    case GAME_ACTIONS.TOGGLE_MODAL_REINICIAR: {
      const { show } = action.payload || {};

      return {
        ...state,
        ui: {
          ...state.ui,
          mostrarModalReiniciar: show !== undefined ? show : !state.ui.mostrarModalReiniciar
        }
      };
    }

    case GAME_ACTIONS.MARK_FOR_SYNC: {
      return {
        ...state,
        meta: {
          ...state.meta,
          needsSync: true,
          lastUpdated: Date.now()
        }
      };
    }
    
    case GAME_ACTIONS.SYNC_COMPLETED: {
      return {
        ...state,
        meta: {
          ...state.meta,
          needsSync: false,
          hasUnsavedChanges: false,
          lastUpdated: Date.now()
        }
      };
    }
    
    case GAME_ACTIONS.SET_ONLINE_STATUS: {
      const { isOnline } = action.payload;
      
      return {
        ...state,
        meta: {
          ...state.meta,
          isOnline
        }
      };
    }
    
    case GAME_ACTIONS.MARK_GAME_RECORDED: {
      return {
        ...state,
        meta: { 
          ...state.meta, 
          gameRecordedInStats: true 
        }
      };
    }
    
    // Preparado para Fase 1 - Auth
    case GAME_ACTIONS.SET_USER: {
      const { user } = action.payload;
      
      return {
        ...state,
        user: {
          ...state.user,
          ...user,
          isAuthenticated: !!user?.id
        },
        meta: {
          ...state.meta,
          needsSync: true,
          lastUpdated: Date.now()
        }
      };
    }
    
    case GAME_ACTIONS.LOGOUT: {
      return {
        ...state,
        user: {
          ...INITIAL_GAME_STATE.user
        },
        meta: {
          ...state.meta,
          needsSync: false,
          lastUpdated: Date.now()
        }
      };
    }
    
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
};

// Action creators
export const gameActions = {
  addPoint: (player) => ({
    type: GAME_ACTIONS.ADD_POINT,
    payload: { player, timestamp: Date.now() }
  }),
  
  subtractPoint: (player, allowWithWinner = false) => ({
    type: GAME_ACTIONS.SUBTRACT_POINT,
    payload: { player, allowWithWinner, timestamp: Date.now() }
  }),
  
  faltaEnvido: (equipoGanador) => ({
    type: GAME_ACTIONS.FALTA_ENVIDO,
    payload: { equipoGanador, timestamp: Date.now() }
  }),
  
  newGame: (configuracion) => ({
    type: GAME_ACTIONS.NEW_GAME,
    payload: { configuracion, timestamp: Date.now() }
  }),
  
  restoreGame: (savedGame) => ({
    type: GAME_ACTIONS.RESTORE_GAME,
    payload: { savedGame, timestamp: Date.now() }
  }),
  
  clearWinner: () => ({
    type: GAME_ACTIONS.CLEAR_WINNER,
    payload: { timestamp: Date.now() }
  }),
  
  setPlayerNames: (jugador1, jugador2) => ({
    type: GAME_ACTIONS.SET_PLAYER_NAMES,
    payload: { jugador1, jugador2, timestamp: Date.now() }
  }),
  
  setTotalPoints: (puntosTotales) => ({
    type: GAME_ACTIONS.SET_TOTAL_POINTS,
    payload: { puntosTotales, timestamp: Date.now() }
  }),
  
  setScreen: (screen) => ({
    type: GAME_ACTIONS.SET_SCREEN,
    payload: { screen, timestamp: Date.now() }
  }),
  
  toggleModalFalta: (show) => ({
    type: GAME_ACTIONS.TOGGLE_MODAL_FALTA,
    payload: { show, timestamp: Date.now() }
  }),
  
  toggleModalVictoria: (show) => ({
    type: GAME_ACTIONS.TOGGLE_MODAL_VICTORIA,
    payload: { show, timestamp: Date.now() }
  }),

  toggleModalReiniciar: (show) => ({
    type: GAME_ACTIONS.TOGGLE_MODAL_REINICIAR,
    payload: { show, timestamp: Date.now() }
  }),

  markForSync: () => ({
    type: GAME_ACTIONS.MARK_FOR_SYNC,
    payload: { timestamp: Date.now() }
  }),
  
  syncCompleted: () => ({
    type: GAME_ACTIONS.SYNC_COMPLETED,
    payload: { timestamp: Date.now() }
  }),
  
  setOnlineStatus: (isOnline) => ({
    type: GAME_ACTIONS.SET_ONLINE_STATUS,
    payload: { isOnline, timestamp: Date.now() }
  }),
  
  markGameRecorded: () => ({
    type: GAME_ACTIONS.MARK_GAME_RECORDED,
    payload: { timestamp: Date.now() }
  }),
  
  setUser: (user) => ({
    type: GAME_ACTIONS.SET_USER,
    payload: { user, timestamp: Date.now() }
  }),
  
  logout: () => ({
    type: GAME_ACTIONS.LOGOUT,
    payload: { timestamp: Date.now() }
  })
};