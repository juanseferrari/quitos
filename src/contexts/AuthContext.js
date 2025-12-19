// contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { USER_STATES, AUTH_PROVIDERS } from '../types/auth';
import { mockAuthService } from '../services/mockAuthService';
import authService from '../services/authService';

const AuthContext = createContext();

const initialAuthState = {
  // Estado del usuario
  user: {
    id: null,
    email: null,
    name: null,
    username: null,
    avatar: null,
    city: null,
    provider: AUTH_PROVIDERS.ANONYMOUS,
    createdAt: null,
    lastLoginAt: null
  },
  
  // Estado de la sesión
  session: {
    isAuthenticated: false,
    isAnonymous: true,
    token: localStorage.getItem('trucoapp_token'),
    refreshToken: localStorage.getItem('trucoapp_refresh_token'),
    expiresAt: null,
    lastSync: null
  },
  
  // Estado de la aplicación
  app: {
    state: USER_STATES.ANONYMOUS,
    isLoading: false,
    error: null,
    migrationStatus: null,
    hasLocalData: false,
    needsSync: false,
    isOnline: navigator.onLine
  },
  
  // Configuración
  preferences: {
    syncEnabled: true,
    notificationsEnabled: false,
    darkMode: false,
    allowAnalytics: true
  }
};

const parseTokenExpiry = (token) => {
  try {
    // Mock token format: mock_token_userId_timestamp
    const parts = token.split('_');
    const timestamp = parseInt(parts[parts.length - 1]);
    return timestamp + (24 * 60 * 60 * 1000); // +24 horas
  } catch {
    return Date.now() + (24 * 60 * 60 * 1000);
  }
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        app: { ...state.app, isLoading: true, error: null }
      };
      
    case 'AUTH_SUCCESS':
      // Prevent duplicate AUTH_SUCCESS processing
      if (state.session.isAuthenticated && state.user.id === action.payload.user.id) {
        console.log('⚠️ AUTH_SUCCESS: Already authenticated, skipping duplicate');
        return state;
      }
      
      console.log('🔥 AUTH_SUCCESS reducer called with payload:', action.payload.user.email);
      const newState = {
        ...state,
        user: action.payload.user,
        session: {
          ...state.session,
          isAuthenticated: true,
          isAnonymous: false,
          token: action.payload.token,
          refreshToken: action.payload.refreshToken,
          expiresAt: action.payload.expiresAt
        },
        app: {
          ...state.app,
          state: USER_STATES.AUTHENTICATED,
          isLoading: false,
          error: null
        }
      };
      console.log('✅ AUTH_SUCCESS completed for:', newState.user.email);
      return newState;
      
    case 'AUTH_ERROR':
      return {
        ...state,
        app: {
          ...state.app,
          isLoading: false,
          error: action.payload.error
        }
      };
      
    case 'LOGOUT':
      console.log('🔥 LOGOUT reducer called');
      // Limpiar tokens pero mantener historial de autenticación
      localStorage.removeItem('trucoapp_token');
      localStorage.removeItem('trucoapp_refresh_token');
      // Note: No removemos 'trucoapp_had_auth' para mejorar UX en futuros logins
      
      const logoutState = {
        ...initialAuthState,
        preferences: state.preferences // Mantener preferencias
      };
      console.log('🔥 LOGOUT new state:', {
        isAuthenticated: logoutState.session.isAuthenticated,
        isAnonymous: logoutState.session.isAnonymous,
        appState: logoutState.app.state
      });
      return logoutState;
      
    case 'SET_ANONYMOUS':
      return {
        ...state,
        app: {
          ...state.app,
          state: USER_STATES.ANONYMOUS,
          isLoading: false
        }
      };
      
    case 'START_MIGRATION':
      return {
        ...state,
        app: {
          ...state.app,
          state: USER_STATES.MIGRATING,
          migrationStatus: 'starting'
        }
      };
      
    case 'MIGRATION_COMPLETE':
      return {
        ...state,
        app: {
          ...state.app,
          state: USER_STATES.AUTHENTICATED,
          migrationStatus: 'completed',
          needsSync: false
        }
      };
      
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
      
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        app: {
          ...state.app,
          isOnline: action.payload
        }
      };
      
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  
  // Usar authService real si está configurado, sino mockAuthService
  const api = authService.isMockMode() ? mockAuthService : authService;
  
  // Inicialización
  useEffect(() => {
    initializeAuth();
    
    // Monitor network status
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listener para authService real (Supabase OAuth)
  useEffect(() => {
    if (!authService.isMockMode() && authService.supabase) {
      console.log('🔄 AuthContext: Setting up Supabase auth listener');
      
      let isProcessing = false; // Prevent double processing
      
      const { data: { subscription } } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 AuthContext detected auth change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user && !isProcessing) {
          isProcessing = true;
          console.log('✅ Processing authentication (single instance)');
          
          try {
            // Check if already authenticated to prevent duplicate processing
            if (state.session.isAuthenticated && state.user.id === session.user.id) {
              console.log('⚠️ Already authenticated, skipping duplicate processing');
              isProcessing = false;
              return;
            }
            
            const payload = {
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                username: null,
                avatar: session.user.user_metadata?.avatar_url || null,
                provider: AUTH_PROVIDERS.GOOGLE,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              },
              session: session,
              token: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: new Date(Date.now() + (session.expires_in || 3600) * 1000).toISOString()
            };
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: payload
            });
            
            // Mark that user has been authenticated for future OAuth attempts
            localStorage.setItem('trucoapp_had_auth', 'true');
            
            console.log('✅ AUTH_SUCCESS dispatch completed');
            
            // Check for local data migration after successful auth
            const hasLocalData = () => {
              const gameState = localStorage.getItem('rey-del-truco-state');
              if (gameState) {
                const data = JSON.parse(gameState);
                return data.localData?.partidasJugadas > 0;
              }
              return false;
            };
            
            if (hasLocalData()) {
              console.log('🔄 Starting local data migration...');
              const { startDataMigration } = await import('../services/dataMigration');
              await startDataMigration(session.user.id);
            }
            
            // Create profile in background (non-blocking)
            setTimeout(async () => {
              try {
                await authService.ensureUserProfile(session.user);
                console.log('✅ Background profile creation completed');
              } catch (profileError) {
                console.error('⚠️ Background profile creation failed:', profileError);
              }
            }, 100);
            
          } catch (error) {
            console.error('🔥 Error in auth state change handler:', error);
          } finally {
            isProcessing = false;
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out via Supabase');
          isProcessing = false;
          dispatch({ type: 'LOGOUT' });
        }
      });
      
      return () => {
        console.log('🧹 Cleaning up Supabase auth listener');
        subscription?.unsubscribe();
      };
    }
  }, [state.session.isAuthenticated, state.user.id]); // Add dependencies to prevent stale closure
  
  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Verificar token existente
      const token = localStorage.getItem('trucoapp_token');
      if (token) {
        try {
          const user = await api.verifyToken(token);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token,
              refreshToken: localStorage.getItem('trucoapp_refresh_token'),
              expiresAt: parseTokenExpiry(token)
            }
          });
          return;
        } catch (error) {
          // Token inválido, limpiar
          localStorage.removeItem('trucoapp_token');
          localStorage.removeItem('trucoapp_refresh_token');
        }
      }
      
      // Usuario anónimo por defecto
      dispatch({ type: 'SET_ANONYMOUS' });
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'AUTH_ERROR', payload: { error: error.message } });
    }
  };
  
  return (
    <AuthContext.Provider value={{ state, dispatch, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};