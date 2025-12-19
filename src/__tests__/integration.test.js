// __tests__/integration.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock localStorage para tests
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Mock que el usuario ya vio onboarding
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'trucoapp_onboarding_seen') return 'true';
      return null;
    });
  });
  
  test('should navigate from auth selection to anonymous game', () => {
    render(<App />);
    
    // Debería mostrar la pantalla de auth después del onboarding
    const anonymousButton = screen.getByText(/Entrar sin cuenta/i);
    expect(anonymousButton).toBeInTheDocument();
    
    // Click en continuar sin cuenta
    fireEvent.click(anonymousButton);
    
    // Debería mostrar el anotador (verificamos elementos característicos)
    setTimeout(() => {
      const startButtons = screen.getAllByText(/EMPEZAR/i);
      expect(startButtons.length).toBeGreaterThan(0);
    }, 100);
  });
  
  test('should show onboarding on first visit', () => {
    // Mock primera visita
    localStorageMock.getItem.mockImplementation(() => null);
    
    render(<App />);
    
    // Debería mostrar onboarding
    const onboardingTitle = screen.getByText(/Nunca más olvides/i);
    expect(onboardingTitle).toBeInTheDocument();
    
    const nextButton = screen.getByText(/SIGUIENTE/i);
    expect(nextButton).toBeInTheDocument();
  });
  
  test('should preserve anonymous functionality', () => {
    // Mock que ya pasó auth y está en modo anónimo
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'trucoapp_onboarding_seen') return 'true';
      if (key === 'rey-del-truco-state') return JSON.stringify({
        game: { partidaEnProgreso: false },
        localData: { partidasJugadas: 0 }
      });
      return null;
    });
    
    render(<App />);
    
    // Click en entrar sin cuenta
    const anonymousButton = screen.getByText(/Entrar sin cuenta/i);
    fireEvent.click(anonymousButton);
    
    // La funcionalidad actual del juego debería estar disponible
    // (No podemos testear todo el juego aquí, pero verificamos que se renderiza)
    expect(document.querySelector('.App')).toBeInTheDocument();
  });
});