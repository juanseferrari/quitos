// src/__tests__/gameReducer.test.js
import { gameReducer, gameActions } from '../reducers/gameReducer';
import { INITIAL_GAME_STATE, PLAYERS } from '../types/gameTypes';

describe('gameReducer', () => {
  let initialState;
  
  beforeEach(() => {
    initialState = { ...INITIAL_GAME_STATE };
  });
  
  describe('ADD_POINT action', () => {
    test('should add point to correct player', () => {
      const action = gameActions.addPoint(PLAYERS.NOS);
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.puntosNos).toBe(1);
      expect(newState.game.puntosEllos).toBe(0);
      expect(newState.game.historial).toHaveLength(1);
      expect(newState.meta.needsSync).toBe(true);
      expect(newState.meta.hasUnsavedChanges).toBe(true);
    });
    
    test('should not allow adding points when there is a winner', () => {
      const stateWithWinner = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 30,
          ganador: PLAYERS.NOS
        }
      };
      
      const action = gameActions.addPoint(PLAYERS.ELLOS);
      const newState = gameReducer(stateWithWinner, action);
      
      expect(newState.game.puntosEllos).toBe(0);
      expect(newState).toEqual(stateWithWinner);
    });
    
    test('should detect victory when reaching total points', () => {
      const stateNearVictory = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 29,
          puntosTotales: 30
        }
      };
      
      const action = gameActions.addPoint(PLAYERS.NOS);
      const newState = gameReducer(stateNearVictory, action);
      
      expect(newState.game.puntosNos).toBe(30);
      expect(newState.game.ganador).toBe(PLAYERS.NOS);
      expect(newState.game.fechaFin).toBeTruthy();
      expect(newState.ui.mostrarModalVictoria).toBe(true);
      expect(newState.localData.partidasJugadas).toBe(1);
      expect(newState.localData.victoriasNos).toBe(1);
    });
    
    test('should not allow exceeding total points', () => {
      const stateAtLimit = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 30,
          puntosTotales: 30
        }
      };
      
      const action = gameActions.addPoint(PLAYERS.NOS);
      const newState = gameReducer(stateAtLimit, action);
      
      expect(newState.game.puntosNos).toBe(30);
      expect(newState).toEqual(stateAtLimit);
    });
    
    test('should set fechaInicio on first point', () => {
      const action = gameActions.addPoint(PLAYERS.NOS);
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.fechaInicio).toBeTruthy();
      expect(typeof newState.game.fechaInicio).toBe('number');
    });
  });
  
  describe('SUBTRACT_POINT action', () => {
    test('should subtract point from correct player', () => {
      const stateWithPoints = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 5,
          puntosEllos: 3
        }
      };
      
      const action = gameActions.subtractPoint(PLAYERS.NOS);
      const newState = gameReducer(stateWithPoints, action);
      
      expect(newState.game.puntosNos).toBe(4);
      expect(newState.game.puntosEllos).toBe(3);
      expect(newState.game.historial).toHaveLength(1);
      expect(newState.meta.needsSync).toBe(true);
    });
    
    test('should not allow negative points', () => {
      const action = gameActions.subtractPoint(PLAYERS.NOS);
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.puntosNos).toBe(0);
      expect(newState).toEqual(initialState);
    });
    
    test('should clear winner when subtracting point', () => {
      const stateWithWinner = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 30,
          ganador: PLAYERS.NOS,
          fechaFin: Date.now()
        },
        ui: {
          ...initialState.ui,
          mostrarModalVictoria: true
        }
      };
      
      const action = gameActions.subtractPoint(PLAYERS.NOS, true); // allowWithWinner
      const newState = gameReducer(stateWithWinner, action);
      
      expect(newState.game.puntosNos).toBe(29);
      expect(newState.game.ganador).toBe(null);
      expect(newState.game.fechaFin).toBe(null);
      expect(newState.ui.mostrarModalVictoria).toBe(false);
    });
  });
  
  describe('FALTA_ENVIDO action', () => {
    test('should calculate correct points for falta envido', () => {
      const stateForFalta = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 20,
          puntosEllos: 15,
          puntosTotales: 30
        }
      };
      
      const action = gameActions.faltaEnvido(PLAYERS.NOS);
      const newState = gameReducer(stateForFalta, action);
      
      // Nosotros gana: 30 - 15 (puntos de ellos) = 15 puntos
      expect(newState.game.puntosNos).toBe(30); // 20 + 10 = 30 (pero limitado a puntosTotales)
      expect(newState.game.ganador).toBe(PLAYERS.NOS);
      expect(newState.ui.mostrarModalFalta).toBe(false);
    });
    
    test('should win game if falta envido reaches total points', () => {
      const stateForFalta = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 25,
          puntosEllos: 20,
          puntosTotales: 30
        }
      };
      
      const action = gameActions.faltaEnvido(PLAYERS.NOS);
      const newState = gameReducer(stateForFalta, action);
      
      // Nosotros gana: 30 - 20 = 10 puntos → 25 + 10 = 35, limitado a 30
      expect(newState.game.puntosNos).toBe(30);
      expect(newState.game.ganador).toBe(PLAYERS.NOS);
      expect(newState.game.fechaFin).toBeTruthy();
      expect(newState.localData.partidasJugadas).toBe(1);
    });
    
    test('should not allow falta envido when there is a winner', () => {
      const stateWithWinner = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 30,
          ganador: PLAYERS.NOS
        }
      };
      
      const action = gameActions.faltaEnvido(PLAYERS.ELLOS);
      const newState = gameReducer(stateWithWinner, action);
      
      expect(newState).toEqual(stateWithWinner);
    });
  });
  
  describe('NEW_GAME action', () => {
    test('should reset game to initial state', () => {
      const stateInProgress = {
        ...initialState,
        game: {
          ...initialState.game,
          puntosNos: 15,
          puntosEllos: 12,
          ganador: PLAYERS.NOS,
          historial: [{ id: '1', accion: '+' }]
        }
      };
      
      const action = gameActions.newGame();
      const newState = gameReducer(stateInProgress, action);
      
      expect(newState.game.puntosNos).toBe(0);
      expect(newState.game.puntosEllos).toBe(0);
      expect(newState.game.ganador).toBe(null);
      expect(newState.game.historial).toEqual([]);
      expect(newState.game.id).toBeTruthy();
      expect(newState.meta.needsSync).toBe(true);
      expect(newState.meta.hasUnsavedChanges).toBe(false);
    });
    
    test('should apply configuration when provided', () => {
      const configuracion = {
        jugador1: 'Juan',
        jugador2: 'Carlos',
        puntosTotales: 24
      };
      
      const action = gameActions.newGame(configuracion);
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.jugador1).toBe('Juan');
      expect(newState.game.jugador2).toBe('Carlos');
      expect(newState.game.puntosTotales).toBe(24);
    });
  });
  
  describe('RESTORE_GAME action', () => {
    test('should restore saved game state', () => {
      const savedGame = {
        id: 'saved-game-123',
        puntosNos: 18,
        puntosEllos: 22,
        jugador1: 'Test1',
        jugador2: 'Test2',
        puntosTotales: 30,
        historial: [
          { id: '1', accion: '+', equipo: 'nos' },
          { id: '2', accion: '+', equipo: 'ellos' }
        ]
      };
      
      const action = gameActions.restoreGame(savedGame);
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.id).toBe('saved-game-123');
      expect(newState.game.puntosNos).toBe(18);
      expect(newState.game.puntosEllos).toBe(22);
      expect(newState.game.jugador1).toBe('Test1');
      expect(newState.game.jugador2).toBe('Test2');
      expect(newState.game.historial).toHaveLength(2);
      expect(newState.meta.needsSync).toBe(false);
    });
  });
  
  describe('SET_PLAYER_NAMES action', () => {
    test('should update player names', () => {
      const action = gameActions.setPlayerNames('Nuevo1', 'Nuevo2');
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.jugador1).toBe('Nuevo1');
      expect(newState.game.jugador2).toBe('Nuevo2');
      expect(newState.meta.needsSync).toBe(true);
    });
    
    test('should keep existing name if new one is null', () => {
      const action = gameActions.setPlayerNames(null, 'Nuevo2');
      const newState = gameReducer(initialState, action);
      
      expect(newState.game.jugador1).toBe('Nosotros'); // Original value
      expect(newState.game.jugador2).toBe('Nuevo2');
    });
  });
  
  describe('UI actions', () => {
    test('should toggle modal falta', () => {
      const action = gameActions.toggleModalFalta(true);
      const newState = gameReducer(initialState, action);
      
      expect(newState.ui.mostrarModalFalta).toBe(true);
    });
    
    test('should set screen', () => {
      const action = gameActions.setScreen('historial');
      const newState = gameReducer(initialState, action);
      
      expect(newState.ui.pantallaActual).toBe('historial');
    });
  });
  
  describe('Unknown action', () => {
    test('should return unchanged state for unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION', payload: {} };
      const newState = gameReducer(initialState, unknownAction);
      
      expect(newState).toEqual(initialState);
    });
  });
});