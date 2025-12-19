import { render, screen } from '@testing-library/react';
import App from './App';

// Mock localStorage para tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

test('renders onboarding slide by default', () => {
  render(<App />);
  
  // Debería mostrar el onboarding en el primer uso
  const titleElement = screen.getByText(/Nunca más olvides/i);
  expect(titleElement).toBeInTheDocument();
  
  const nextButton = screen.getByText(/SIGUIENTE/i);
  expect(nextButton).toBeInTheDocument();
});
