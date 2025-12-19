// __tests__/stats-integration.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { StatsProvider } from '../contexts/StatsContext';
import { GameProvider } from '../contexts/GameContext';
import { useStats } from '../hooks/useStats';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Componente de prueba para stats
const StatsTestComponent = () => {
  const { 
    userStats, 
    isStatsAvailable, 
    recordGameFinished,
    isLoading 
  } = useStats();
  
  const simulateGame = () => {
    const gameData = {
      puntosNos: 30,
      puntosEllos: 25,
      ganador: 'nos',
      jugador1: 'Test Player',
      jugador2: 'Rival',
      puntosTotales: 30,
      fechaInicio: Date.now() - 600000,
      fechaFin: Date.now(),
      historial: []
    };
    
    recordGameFinished(gameData);
  };
  
  return (
    <div>
      <div data-testid="stats-available">{isStatsAvailable.toString()}</div>
      <div data-testid="games-played">{userStats.games_played}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <button onClick={simulateGame} data-testid="simulate-game">
        Simular Juego
      </button>
    </div>
  );
};

const createWrapper = () => ({ children }) => (
  <AuthProvider>
    <StatsProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </StatsProvider>
  </AuthProvider>
);

describe('Stats Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });
  
  test('should initialize stats system without errors', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <StatsTestComponent />
      </Wrapper>
    );
    
    // Verificar que el componente se renderiza
    expect(screen.getByTestId('stats-available')).toBeInTheDocument();
    expect(screen.getByTestId('games-played')).toBeInTheDocument();
  });
  
  test('should handle anonymous mode correctly', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <StatsTestComponent />
      </Wrapper>
    );
    
    // En modo anónimo, stats no están disponibles hasta autenticarse
    expect(screen.getByTestId('stats-available')).toHaveTextContent('false');
  });
  
  test('should provide recordGameFinished function', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <StatsTestComponent />
      </Wrapper>
    );
    
    const simulateButton = screen.getByTestId('simulate-game');
    expect(simulateButton).toBeInTheDocument();
    
    // No debería fallar al llamar recordGameFinished
    fireEvent.click(simulateButton);
    
    // En modo anónimo, no se registran stats pero no falla
    await waitFor(() => {
      expect(screen.getByTestId('games-played')).toHaveTextContent('0');
    });
  });
});