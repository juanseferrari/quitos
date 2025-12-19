// __tests__/auth.test.js
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';

// Mock del servicio
const createWrapper = () => ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  test('should start in anonymous mode by default', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.isAnonymous).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user.id).toBe(null);
  });
  
  test('should sign in with email successfully', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAnonymous).toBe(false);
    expect(result.current.user.email).toBe('test@example.com');
  });
  
  test('should handle sign in errors', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    await act(async () => {
      try {
        await result.current.signInWithEmail('wrong@email.com', 'wrongpassword');
      } catch (error) {
        // Expected to fail
      }
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
  
  test('should continue as anonymous', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });
    
    act(() => {
      result.current.continueAsAnonymous();
    });
    
    expect(result.current.isAnonymous).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });
});