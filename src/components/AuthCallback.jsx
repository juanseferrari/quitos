// src/components/AuthCallback.jsx - Handle OAuth callback from Supabase
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const AuthCallback = ({ onAuthComplete }) => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const { dispatch } = useAuth();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setStatus('processing');
      
      // Check if we have a session after OAuth redirect
      const { session, user } = await authService.getSession();
      
      if (session && user) {
        console.log('✅ OAuth callback successful:', user.email);
        
        // Ensure user profile exists
        const profile = await authService.ensureUserProfile(user);
        
        if (profile) {
          // Dispatch successful auth
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: profile,
              session: session,
              token: session.access_token,
              refreshToken: session.refresh_token
            }
          });
          
          setStatus('success');
          
          // Redirect back to app
          setTimeout(() => {
            if (onAuthComplete) {
              onAuthComplete(profile);
            } else {
              window.location.href = '/';
            }
          }, 2000);
          
        } else {
          throw new Error('Failed to create user profile');
        }
      } else {
        throw new Error('No session found after OAuth');
      }
      
    } catch (err) {
      console.error('🔥 Auth callback error:', err);
      setError(err.message);
      setStatus('error');
      
      // Redirect to login after error
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4A574] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
            Completando inicio de sesión...
          </h2>
          <p className="text-[#F5DEB3] opacity-70">
            Configurando tu perfil
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
            ¡Bienvenido al Rey del Truco!
          </h2>
          <p className="text-[#F5DEB3] opacity-70">
            Redirigiendo a la app...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Error de autenticación
          </h2>
          <p className="text-[#F5DEB3] opacity-70 mb-4">
            {error || 'Ocurrió un error durante el inicio de sesión'}
          </p>
          <p className="text-sm text-[#F5DEB3] opacity-50">
            Redirigiendo en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;