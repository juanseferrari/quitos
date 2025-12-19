// src/__tests__/useGame.test.js
import { renderHook, act } from '@testing-library/react';
import { GameProvider } from '../contexts/GameContext';
import { useGame } from '../hooks/useGame';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Provider wrapper for tests - creates a new instance each time
const createWrapper = () => {
  // Force a new provider instance by using a key based on random value
  const providerKey = Math.random().toString(36);
  return ({ children }) => (
    <GameProvider key={providerKey}>{children}</GameProvider>
  );
};

describe('useGame hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure localStorage is completely clean for each test
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });
  
  test('should provide initial game state', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.puntosNos).toBe(0);
    expect(result.current.puntosEllos).toBe(0);
    expect(result.current.ganador).toBe(null);
    expect(result.current.jugador1).toBe('Nosotros');
    expect(result.current.jugador2).toBe('Ellos');
    expect(result.current.puntosTotales).toBe(30);
    expect(result.current.historial).toEqual([]);
    expect(result.current.pantallaActual).toBe('inicio');
  });
  
  test('should sum points correctly', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    act(() => {
      result.current.sumarPunto('nos');
    });
    
    expect(result.current.puntosNos).toBe(1);
    expect(result.current.puntosEllos).toBe(0);
    expect(result.current.historial).toHaveLength(1);
    expect(result.current.historial[0].accion).toBe('+');
    expect(result.current.historial[0].equipo).toBe('nos');
  });
  
  test('should subtract points correctly', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Reset to ensure clean state
    act(() => {
      result.current.nuevoPartido();
    });
    
    // First add a point
    act(() => {
      result.current.sumarPunto('nos');
    });
    
    expect(result.current.puntosNos).toBe(1);
    
    // Then subtract it
    act(() => {
      result.current.restarPunto('nos');
    });
    
    expect(result.current.puntosNos).toBe(0);
    expect(result.current.historial).toHaveLength(2);
    expect(result.current.historial[0].accion).toBe('−');
  });
  
  test('should detect victory correctly', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Sum points until victory (30 points)
    act(() => {
      for (let i = 0; i < 30; i++) {
        result.current.sumarPunto('nos');
      }
    });
    
    expect(result.current.puntosNos).toBe(30);
    expect(result.current.ganador).toBe('nos');
    expect(result.current.hayGanador).toBe(true);
    expect(result.current.mostrarModalVictoria).toBe(true);
  });
  
  test('should handle falta envido correctly', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Set up scenario: nos=20, ellos=15, total=30
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.sumarPunto('nos');
      }
      for (let i = 0; i < 15; i++) {
        result.current.sumarPunto('ellos');
      }
    });
    
    const puntosAntesNos = result.current.puntosNos;
    const puntosAntesEllos = result.current.puntosEllos;
    
    // Calculate expected points for falta envido
    const puntosEsperados = result.current.calcularPuntosFalta('nos');
    expect(puntosEsperados).toBe(30 - puntosAntesEllos); // 30 - 15 = 15
    
    // Execute falta envido
    act(() => {
      result.current.faltaEnvido('nos');
    });
    
    // Should win the game (20 + 15 = 35, limited to 30)
    expect(result.current.puntosNos).toBe(30);
    expect(result.current.ganador).toBe('nos');
    expect(result.current.hayGanador).toBe(true);
  });
  
  test('should detect "al verde" state correctly', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Sum 29 points (al verde)
    act(() => {
      for (let i = 0; i < 29; i++) {
        result.current.sumarPunto('nos');
      }
    });
    
    expect(result.current.puntosNos).toBe(29);
    expect(result.current.nosAlVerde).toBe(true);
    expect(result.current.ellosAlVerde).toBe(false);
  });
  
  test('should start new game correctly', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Reset to ensure clean state
    act(() => {
      result.current.nuevoPartido();
    });
    
    // First, play a bit
    act(() => {
      result.current.sumarPunto('nos');
      result.current.sumarPunto('ellos');
    });
    
    expect(result.current.puntosNos).toBe(1);
    expect(result.current.puntosEllos).toBe(1);
    expect(result.current.historial).toHaveLength(2);
    
    // Start new game
    act(() => {
      result.current.nuevoPartido();
    });
    
    expect(result.current.puntosNos).toBe(0);
    expect(result.current.puntosEllos).toBe(0);
    expect(result.current.ganador).toBe(null);
    expect(result.current.historial).toEqual([]);
  });
  
  test('should start new game with custom configuration', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    const configuracion = {
      jugador1: 'Juan',
      jugador2: 'Carlos',
      puntosTotales: 24
    };
    
    act(() => {
      result.current.nuevoPartido(configuracion);
    });
    
    expect(result.current.jugador1).toBe('Juan');
    expect(result.current.jugador2).toBe('Carlos');
    expect(result.current.puntosTotales).toBe(24);
  });
  
  test('should update player names', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Reset to ensure clean state
    act(() => {
      result.current.nuevoPartido();
    });
    
    // Check initial state
    expect(result.current.jugador1).toBe('Nosotros');
    expect(result.current.jugador2).toBe('Ellos');
    
    // Update player 1 only
    act(() => {
      result.current.setJugador1('Nuevo Nombre 1');
    });
    
    expect(result.current.jugador1).toBe('Nuevo Nombre 1');
    expect(result.current.jugador2).toBe('Ellos'); // Should remain unchanged
    
    // Update player 2
    act(() => {
      result.current.setJugador2('Nuevo Nombre 2');
    });
    
    expect(result.current.jugador1).toBe('Nuevo Nombre 1');
    expect(result.current.jugador2).toBe('Nuevo Nombre 2');
  });
  
  test('should handle screen navigation', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.pantallaActual).toBe('inicio');
    
    act(() => {
      result.current.setPantallaActual('juego');
    });
    
    expect(result.current.pantallaActual).toBe('juego');
    
    act(() => {
      result.current.setPantallaActual('historial');
    });
    
    expect(result.current.pantallaActual).toBe('historial');
  });
  
  test('should handle modal states', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.mostrarModalFalta).toBe(false);
    
    act(() => {
      result.current.setMostrarModalFalta(true);
    });
    
    expect(result.current.mostrarModalFalta).toBe(true);
    
    act(() => {
      result.current.setMostrarModalFalta(false);
    });
    
    expect(result.current.mostrarModalFalta).toBe(false);
  });
  
  test('should provide utility functions', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Test getNombreJugador utility
    expect(result.current.utils.getNombreJugador('nos')).toBe('Nosotros');
    expect(result.current.utils.getNombreJugador('ellos')).toBe('Ellos');
    
    // Test getPuntos utility
    expect(result.current.utils.getPuntos('nos')).toBe(0);
    expect(result.current.utils.getPuntos('ellos')).toBe(0);
    
    // Add some points and test again
    act(() => {
      result.current.sumarPunto('nos');
      result.current.sumarPunto('ellos');
      result.current.sumarPunto('ellos');
    });
    
    expect(result.current.utils.getPuntos('nos')).toBe(1);
    expect(result.current.utils.getPuntos('ellos')).toBe(2);
  });
  
  test('should calculate game duration', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Reset to ensure clean state
    act(() => {
      result.current.nuevoPartido();
    });
    
    // Initially no duration since game hasn't started
    expect(result.current.utils.calcularDuracionPartida()).toBe(0);
    
    // Start game by adding a point
    act(() => {
      result.current.sumarPunto('nos');
    });
    
    // Now should have some duration
    const duration = result.current.utils.calcularDuracionPartida();
    expect(duration).toBeGreaterThan(0);
  });
  
  test('should not allow actions when there is a winner', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Reset to ensure clean state
    act(() => {
      result.current.nuevoPartido();
    });
    
    // Win the game
    act(() => {
      for (let i = 0; i < 30; i++) {
        result.current.sumarPunto('nos');
      }
    });
    
    expect(result.current.hayGanador).toBe(true);
    const historialLength = result.current.historial.length;
    
    // Try to add more points - should be ignored
    act(() => {
      result.current.sumarPunto('ellos');
    });
    
    expect(result.current.historial).toHaveLength(historialLength);
    expect(result.current.puntosEllos).toBe(0);
  });
  
  test('should allow subtracting points from winner to undo victory', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: createWrapper()
    });
    
    // Win the game
    act(() => {
      for (let i = 0; i < 30; i++) {
        result.current.sumarPunto('nos');
      }
    });
    
    expect(result.current.ganador).toBe('nos');
    expect(result.current.hayGanador).toBe(true);
    
    // Subtract point from winner (undo victory)
    act(() => {
      result.current.restarPunto('nos', true); // allowWithWinner = true
    });
    
    expect(result.current.puntosNos).toBe(29);
    expect(result.current.ganador).toBe(null);
    expect(result.current.hayGanador).toBe(false);
  });
});