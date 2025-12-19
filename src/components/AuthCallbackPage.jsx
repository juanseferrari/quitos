// src/components/AuthCallbackPage.jsx - Simplified callback page
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthCallbackPage = () => {
  const { isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Si el usuario ya está autenticado, redirigir inmediatamente
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to main app...');
      window.history.replaceState({}, document.title, '/');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated]);

  // Countdown timer y fallback redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          console.log('⏰ Countdown finished, redirecting...');
          window.history.replaceState({}, document.title, '/');
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        {isAuthenticated ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
              ¡Autenticación exitosa!
            </h2>
            <p className="text-[#F5DEB3] opacity-70">
              Redirigiendo a la app...
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4A574] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
              Procesando autenticación...
            </h2>
            <p className="text-[#F5DEB3] opacity-70 mb-2">
              Verificando credenciales con Google
            </p>
            <p className="text-sm text-[#F5DEB3] opacity-50">
              Redirigiendo en {countdown} segundos...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;