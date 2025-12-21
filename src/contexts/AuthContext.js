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

  // DEV HELPERS - Solo disponibles en localhost
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Helper para login mock desde la consola
      window.devLogin = (email = 'dev@test.com', name = 'Dev User') => {
        console.log('🔧 DEV: Logging in as mock user...');
        const mockUser = {
          id: 'dev-user-' + Date.now(),
          email,
          name,
          username: email.split('@')[0],
          avatar: null,
          provider: 'dev',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: mockUser,
            token: 'dev-token-' + Date.now(),
            refreshToken: 'dev-refresh-' + Date.now(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });

        localStorage.setItem('trucoapp_had_auth', 'true');
        console.log('✅ DEV: Logged in as', email);
        return mockUser;
      };

      // Helper para logout desde la consola
      window.devLogout = () => {
        console.log('🔧 DEV: Logging out...');
        dispatch({ type: 'LOGOUT' });
        console.log('✅ DEV: Logged out');
      };

      // Helper para ver el estado actual
      window.devAuthState = () => {
        console.log('🔧 DEV: Current auth state:', {
          isAuthenticated: state.session.isAuthenticated,
          isAnonymous: state.session.isAnonymous,
          user: state.user,
          appState: state.app.state
        });
        return state;
      };

      // Mostrar instrucciones en consola
      console.log('🔧 DEV HELPERS disponibles:');
      console.log('   window.devLogin("email@test.com", "Nombre") - Login mock');
      console.log('   window.devLogout() - Logout');
      console.log('   window.devAuthState() - Ver estado actual');
    }
  }, [state]);
  
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

  // Listener para authService real (Supabase OAuth) - ÚNICO manejador de auth para Supabase
  useEffect(() => {
    if (!authService.isMockMode() && authService.supabase) {
      console.log('🔄 AuthContext: Setting up Supabase auth listener');

      // Marcar que estamos cargando
      dispatch({ type: 'AUTH_LOADING' });

      let isProcessing = false;
      let initTimeout = null;

      // Setup auth state change listener
      const { data: { subscription } } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 AuthContext detected auth change:', event, session?.user?.email || 'no session');

        // Clear init timeout since we got an event
        if (initTimeout) {
          clearTimeout(initTimeout);
          initTimeout = null;
        }

        // Prevent double processing
        if (isProcessing) {
          console.log('⏳ Already processing, skipping...');
          return;
        }

        // SIGNED_IN or TOKEN_REFRESHED with a valid session
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          isProcessing = true;
          console.log(`✅ Processing ${event} for:`, session.user.email);

          try {
            const userEmail = session.user.email || '';
            const emailUsername = userEmail.includes('@') ? userEmail.split('@')[0] : 'Usuario';

            const payload = {
              user: {
                id: session.user.id,
                email: userEmail,
                name: session.user.user_metadata?.full_name || emailUsername,
                username: null,
                avatar: session.user.user_metadata?.avatar_url || null,
                provider: session.user.app_metadata?.provider || AUTH_PROVIDERS.GOOGLE,
                createdAt: session.user.created_at,
                lastLoginAt: new Date().toISOString()
              },
              session: session,
              token: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: new Date(Date.now() + (session.expires_in || 3600) * 1000).toISOString()
            };

            console.log('📤 Dispatching AUTH_SUCCESS for:', payload.user.email);
            dispatch({ type: 'AUTH_SUCCESS', payload });
            localStorage.setItem('trucoapp_had_auth', 'true');

            // Background profile creation for new sign ins
            if (event === 'SIGNED_IN') {
              setTimeout(async () => {
                try {
                  await authService.ensureUserProfile(session.user);
                } catch (e) {
                  console.warn('⚠️ Profile creation failed:', e.message);
                }
              }, 100);
            }

          } catch (error) {
            console.error('🔥 Error processing auth:', error);
            dispatch({ type: 'SET_ANONYMOUS' });
          } finally {
            isProcessing = false;
          }
        }
        // INITIAL_SESSION without a user = not logged in
        else if (event === 'INITIAL_SESSION' && !session?.user) {
          console.log('ℹ️ No existing session');
          dispatch({ type: 'SET_ANONYMOUS' });
        }
        // SIGNED_OUT
        else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out');
          dispatch({ type: 'LOGOUT' });
        }
        // TOKEN_REFRESHED without session = refresh failed, clear invalid session
        else if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('⚠️ Token refresh failed, clearing invalid session');
          clearInvalidSession();
          dispatch({ type: 'SET_ANONYMOUS' });
        }
      });

      // Helper to clear corrupted/invalid session data
      const clearInvalidSession = () => {
        console.log('🧹 Clearing invalid session data from localStorage');
        // Clear all possible Supabase session keys
        const keysToRemove = [
          'rey-del-truco-auth',
          'sb-pmymvwpgjacrkbimccao-auth-token',
          'supabase.auth.token',
          'trucoapp_token',
          'trucoapp_refresh_token'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
      };

      // Check for existing session on mount with error handling
      const checkSession = async () => {
        // Small delay to let the listener set up
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          const { data: { session }, error } = await authService.supabase.auth.getSession();

          // Handle refresh token errors (400 Bad Request)
          if (error) {
            console.error('🔥 Session check error:', error.message);
            // If refresh token is invalid, clear everything and go anonymous
            if (error.message?.includes('Invalid') ||
                error.message?.includes('expired') ||
                error.status === 400) {
              console.log('🔄 Invalid/expired session, clearing and going anonymous');
              clearInvalidSession();
              // Force sign out to clear Supabase internal state
              try {
                await authService.supabase.auth.signOut();
              } catch (e) {
                // Ignore signout errors
              }
            }
            dispatch({ type: 'SET_ANONYMOUS' });
            return;
          }

          if (session?.user) {
            console.log('✅ Found existing session on mount:', session.user.email);
            // The onAuthStateChange should have already handled this via INITIAL_SESSION
            // But if not, we'll dispatch here as fallback
          } else {
            console.log('ℹ️ No session on mount');
            // Listener should handle this, but set anonymous as fallback
            dispatch({ type: 'SET_ANONYMOUS' });
          }
        } catch (error) {
          console.error('🔥 Session check exception:', error);
          clearInvalidSession();
          dispatch({ type: 'SET_ANONYMOUS' });
        }
      };

      checkSession();

      // Safety timeout - if no auth event received in 5 seconds, go anonymous
      // This handles cases where Supabase gets stuck (network issues, invalid tokens, etc)
      initTimeout = setTimeout(() => {
        console.log('⏱️ Auth init timeout - no event received, checking session state');
        authService.supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error || !session?.user) {
            console.log('⏱️ Timeout: No valid session, going anonymous');
            clearInvalidSession();
            dispatch({ type: 'SET_ANONYMOUS' });
          }
        }).catch(() => {
          dispatch({ type: 'SET_ANONYMOUS' });
        });
      }, 5000);

      return () => {
        console.log('🧹 Cleaning up auth listener');
        if (initTimeout) clearTimeout(initTimeout);
        subscription?.unsubscribe();
      };
    }
  }, []);
  
  const initializeAuth = async () => {
    // Si Supabase está configurado, el listener de arriba maneja todo
    // Esta función solo maneja el mock service
    if (!authService.isMockMode()) {
      console.log('ℹ️ initializeAuth: Supabase mode - listener handles auth');
      return; // El listener de Supabase maneja la autenticación
    }

    try {
      console.log('🔄 initializeAuth: Mock mode - checking token');
      dispatch({ type: 'AUTH_LOADING' });

      // Verificar token existente del mock service
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