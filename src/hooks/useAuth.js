// hooks/useAuth.js
import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { startDataMigration } from '../services/dataMigration';
import authService from '../services/authService';

export const useAuth = () => {
  const { state, dispatch, api } = useAuthContext();
  
  // Debug: Log auth state changes (throttled)
  React.useEffect(() => {
    const logStateChange = () => {
      console.log('🔥 useAuth state update:', {
        isAuthenticated: state.session.isAuthenticated,
        isAnonymous: state.session.isAnonymous,
        userEmail: state.user.email,
        appState: state.app.state
      });
    };
    
    // Throttle logs to prevent spam
    const timeoutId = setTimeout(logStateChange, 100);
    return () => clearTimeout(timeoutId);
  }, [state.session.isAuthenticated, state.session.isAnonymous, state.user.email, state.app.state]);
  
  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Check if using real Supabase or mock
      if (!authService.isMockMode()) {
        console.log('🔐 Starting Google OAuth with Supabase...');
        
        const result = await authService.signInWithGoogle();
        
        if (result.success) {
          console.log('✅ OAuth successful, waiting for AuthContext listener to handle session...');
          // Don't dispatch AUTH_SUCCESS here - let AuthContext listener handle it
          // to avoid double dispatch that causes infinite loops
          
          // Migration will be handled by AuthContext after successful auth
        }
        
        return result;
      } else {
        // Fallback to mock mode
        console.log('⚠️ Mock: Iniciando Google OAuth...');
        
        const mockGoogleUser = {
          email: 'google-user@gmail.com',
          name: 'Usuario Google',
          username: null,
          avatar: 'https://via.placeholder.com/150',
          city: null,
          provider: 'google'
        };
        
        const response = await api.signUp(mockGoogleUser);
        
        localStorage.setItem('trucoapp_token', response.token);
        localStorage.setItem('trucoapp_refresh_token', response.refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: response
        });
        
        if (hasLocalData()) {
          await startDataMigration(response.user.id);
        }
      }
      
    } catch (error) {
      console.error('🔥 Google sign in error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: { error: error.message } });
    }
  };
  
  const signInWithEmail = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      if (!authService.isMockMode()) {
        console.log('🔐 Starting email sign in with Supabase...');

        const result = await authService.signInWithEmail(email, password);

        if (result.success) {
          console.log('✅ Email sign in successful');
          // AuthContext listener will handle the session
        }

        return result;
      } else {
        // Fallback to mock mode
        const response = await api.signInWithEmail({ email, password });

        localStorage.setItem('trucoapp_token', response.token);
        localStorage.setItem('trucoapp_refresh_token', response.refreshToken);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: response
        });

        if (hasLocalData()) {
          await startDataMigration(response.user.id);
        }
      }

    } catch (error) {
      console.error('Email sign in error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: { error: error.message } });
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, name = null) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      if (!authService.isMockMode()) {
        console.log('🔐 Starting email sign up with Supabase...');

        const result = await authService.signUpWithEmail(email, password, name);

        if (result.needsEmailConfirmation) {
          dispatch({ type: 'AUTH_ERROR', payload: { error: result.message } });
          return result;
        }

        if (result.success) {
          console.log('✅ Email sign up successful');
        }

        return result;
      } else {
        // Fallback to mock mode
        const response = await api.signUp({ email, password, name });

        localStorage.setItem('trucoapp_token', response.token);
        localStorage.setItem('trucoapp_refresh_token', response.refreshToken);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: response
        });
      }

    } catch (error) {
      console.error('Email sign up error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: { error: error.message } });
      throw error;
    }
  };
  
  const signUp = async (userData) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const response = await api.signUp(userData);
      
      localStorage.setItem('trucoapp_token', response.token);
      localStorage.setItem('trucoapp_refresh_token', response.refreshToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response
      });
      
    } catch (error) {
      console.error('Sign up error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: { error: error.message } });
    }
  };
  
  const signOut = async () => {
    console.log('🚪 SignOut button clicked');
    try {
      if (!authService.isMockMode()) {
        console.log('🔐 Signing out with Supabase...');

        // Sign out but don't wait for completion - clear local state immediately
        authService.signOut().catch(error => {
          console.warn('⚠️ Supabase signOut error (non-blocking):', error);
        });

        console.log('✅ Supabase signOut initiated (non-blocking)');
      } else {
        console.log('⚠️ Mock: Signing out...');
        const token = localStorage.getItem('trucoapp_token');
        if (token) {
          await api.signOut(token);
        }
      }
    } catch (error) {
      console.error('🔥 Sign out error:', error);
    } finally {
      console.log('🧹 Clearing local storage and dispatching LOGOUT...');
      // Clear local storage immediately for fast UX
      localStorage.removeItem('trucoapp_token');
      localStorage.removeItem('trucoapp_refresh_token');

      dispatch({ type: 'LOGOUT' });
      console.log('✅ LOGOUT dispatch completed');
    }
  };
  
  const continueAsAnonymous = () => {
    dispatch({ type: 'SET_ANONYMOUS' });
  };
  
  const updateProfile = async (updates) => {
    try {
      const updatedUser = await api.updateProfile(state.user.id, updates);
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };
  
  // Helper para verificar si hay datos locales
  const hasLocalData = () => {
    const gameState = localStorage.getItem('rey-del-truco-state');
    if (gameState) {
      const data = JSON.parse(gameState);
      return data.localData?.partidasJugadas > 0;
    }
    return false;
  };
  
  return {
    // Estado
    user: state.user,
    session: state.session,
    isAuthenticated: state.session.isAuthenticated,
    isAnonymous: state.session.isAnonymous,
    isLoading: state.app.isLoading,
    error: state.app.error,
    migrationStatus: state.app.migrationStatus,
    isOnline: state.app.isOnline,
    
    // Acciones
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signUp,
    signOut,
    continueAsAnonymous,
    updateProfile,
    
    // Utilidades
    canSync: state.session.isAuthenticated && state.app.isOnline,
    needsOnboarding: state.session.isAuthenticated && !state.user.username,
    hasLocalData: hasLocalData()
  };
};