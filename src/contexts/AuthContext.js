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

  // Listener para authService real (Supabase OAuth) - ÚNICO manejador de auth para Supabase
  useEffect(() => {
    if (!authService.isMockMode() && authService.supabase) {
      console.log('🔄 AuthContext: Setting up Supabase auth listener');

      // Marcar que estamos cargando
      dispatch({ type: 'AUTH_LOADING' });

      let isProcessing = false; // Prevent double processing
      let initialCheckDone = false; // Track if we've done the initial check

      const { data: { subscription } } = authService.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 AuthContext detected auth change:', event, session?.user?.email || 'no session');

        // Handle INITIAL_SESSION with no user (not logged in)
        if (event === 'INITIAL_SESSION' && !session?.user) {
          console.log('ℹ️ No existing session, setting anonymous');
          initialCheckDone = true;
          dispatch({ type: 'SET_ANONYMOUS' });
          return;
        }

        // Handle sign in, token refresh, and initial session events WITH a user
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user && !isProcessing) {
          isProcessing = true;
          initialCheckDone = true;
          console.log(`✅ Processing ${event} event for:`, session.user.email);

          try {
            // Cargar perfil del usuario (con timeout para evitar bloqueos)
            let userProfile = null;
            try {
              const profilePromise = authService.getUserProfile(session.user.id);
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile load timeout')), 5000)
              );
              userProfile = await Promise.race([profilePromise, timeoutPromise]);
              console.log('📋 User profile loaded:', userProfile?.email || 'no profile yet');
            } catch (profileError) {
              console.warn('⚠️ Could not load user profile:', profileError.message);
            }

            // Obtener email seguro
            const userEmail = session.user.email || '';
            const emailUsername = userEmail.includes('@') ? userEmail.split('@')[0] : 'Usuario';

            const payload = {
              user: {
                id: session.user.id,
                email: userEmail,
                name: userProfile?.name || session.user.user_metadata?.full_name || emailUsername,
                username: userProfile?.display_name || null,
                avatar: userProfile?.avatar_url || session.user.user_metadata?.avatar_url || null,
                provider: session.user.app_metadata?.provider || AUTH_PROVIDERS.GOOGLE,
                createdAt: userProfile?.created_at || session.user.created_at,
                lastLoginAt: new Date().toISOString()
              },
              session: session,
              token: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: new Date(Date.now() + (session.expires_in || 3600) * 1000).toISOString()
            };

            console.log('📤 Dispatching AUTH_SUCCESS for:', payload.user.email);
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: payload
            });

            // Mark that user has been authenticated for future OAuth attempts
            localStorage.setItem('trucoapp_had_auth', 'true');

            console.log('✅ AUTH_SUCCESS dispatch completed');

            // Only run migration on fresh sign in, not on token refresh or initial session
            if (event === 'SIGNED_IN') {
              // Check for local data migration after successful auth
              const hasLocalData = () => {
                const gameState = localStorage.getItem('rey-del-truco-state');
                if (gameState) {
                  try {
                    const data = JSON.parse(gameState);
                    return data.localData?.partidasJugadas > 0;
                  } catch {
                    return false;
                  }
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
            }

          } catch (error) {
            console.error('🔥 Error in auth state change handler:', error);
            // En caso de error, setear como anónimo para no bloquear la UI
            dispatch({ type: 'SET_ANONYMOUS' });
          } finally {
            isProcessing = false;
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out via Supabase');
          isProcessing = false;
          dispatch({ type: 'LOGOUT' });
        }
      });

      // Verificación inmediata de sesión (por si el listener no dispara INITIAL_SESSION)
      const checkExistingSession = async () => {
        // Dar un pequeño delay para que el listener tenga chance de procesar primero
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!initialCheckDone) {
          console.log('🔍 Checking for existing session directly...');
          try {
            const { data: { session }, error } = await authService.supabase.auth.getSession();

            if (error) {
              console.error('🔥 Error getting session:', error);
              dispatch({ type: 'SET_ANONYMOUS' });
              initialCheckDone = true;
              return;
            }

            if (session?.user && !isProcessing) {
              console.log('✅ Found existing session for:', session.user.email);
              isProcessing = true;
              initialCheckDone = true;

              // Obtener email seguro
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

              dispatch({ type: 'AUTH_SUCCESS', payload });
              localStorage.setItem('trucoapp_had_auth', 'true');
              console.log('✅ Session restored from direct check');
              isProcessing = false;
            } else if (!session?.user) {
              console.log('ℹ️ No session found in direct check');
              dispatch({ type: 'SET_ANONYMOUS' });
              initialCheckDone = true;
            }
          } catch (error) {
            console.error('🔥 Session check error:', error);
            dispatch({ type: 'SET_ANONYMOUS' });
            initialCheckDone = true;
          }
        }
      };

      checkExistingSession();

      // Fallback adicional: si después de 3 segundos aún no se procesó nada
      const fallbackTimeout = setTimeout(() => {
        if (!initialCheckDone) {
          console.log('⚠️ Fallback timeout: setting anonymous');
          dispatch({ type: 'SET_ANONYMOUS' });
          initialCheckDone = true;
        }
      }, 3000);

      return () => {
        console.log('🧹 Cleaning up Supabase auth listener');
        clearTimeout(fallbackTimeout);
        subscription?.unsubscribe();
      };
    }
  }, []); // Empty dependency array - listener should only be set up once
  
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