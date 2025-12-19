// src/components/AuthCallbackPage.jsx - OAuth callback handler
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

const AuthCallbackPage = () => {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const processedRef = useRef(false);

  // Procesar el callback OAuth activamente
  useEffect(() => {
    // Evitar procesamiento doble
    if (processedRef.current) return;
    processedRef.current = true;

    const processOAuthCallback = async () => {
      console.log('🔐 AuthCallbackPage: Processing OAuth callback...');
      console.log('📍 Current URL:', window.location.href);
      console.log('📍 Hash:', window.location.hash);
      console.log('📍 Search:', window.location.search);

      try {
        // Verificar si hay tokens en la URL (hash fragment o query params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        // Check for errors first
        if (errorParam) {
          console.error('🔥 OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setStatus('error');
          return;
        }

        // Si hay access_token en la URL, setear la sesión manualmente
        if (accessToken) {
          console.log('✅ Found access_token in URL, setting session...');

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            console.error('🔥 Error setting session:', sessionError);
            setError(sessionError.message);
            setStatus('error');
            return;
          }

          console.log('✅ Session set successfully:', data.user?.email);
          localStorage.setItem('trucoapp_had_auth', 'true');
          setStatus('success');

          // Limpiar la URL y redirigir
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            window.location.href = '/';
          }, 1500);
          return;
        }

        // Si no hay token en URL, Supabase ya los procesó (detectSessionInUrl: true)
        // Intentar obtener la sesión que Supabase debería haber creado
        console.log('🔍 No tokens in URL (Supabase may have processed them), checking session...');

        // Dar tiempo a Supabase para procesar los tokens y crear la sesión
        // Intentar varias veces con intervalos crecientes
        const maxAttempts = 5;
        const delays = [500, 1000, 1500, 2000, 2500];

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          console.log(`🔍 Attempt ${attempt + 1}/${maxAttempts}: Checking for session...`);

          const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

          if (getSessionError) {
            console.error('🔥 Error getting session:', getSessionError);
          }

          if (session?.user) {
            console.log('✅ Session found:', session.user.email);
            localStorage.setItem('trucoapp_had_auth', 'true');
            setStatus('success');

            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              window.location.href = '/';
            }, 1000);
            return;
          }

          // Esperar antes del próximo intento
          if (attempt < maxAttempts - 1) {
            console.log(`⏳ No session yet, waiting ${delays[attempt]}ms...`);
            await new Promise(resolve => setTimeout(resolve, delays[attempt]));
          }
        }

        // Después de todos los intentos, verificar una última vez el estado de auth
        console.log('⚠️ No session after all attempts, checking auth state one more time...');

        // Forzar un refresh del token si existe algo en localStorage
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshData?.session?.user) {
            console.log('✅ Session found after refresh:', refreshData.session.user.email);
            localStorage.setItem('trucoapp_had_auth', 'true');
            setStatus('success');
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              window.location.href = '/';
            }, 1000);
            return;
          }
        } catch (refreshErr) {
          console.log('⚠️ Refresh session failed:', refreshErr.message);
        }

        // Si aún no hay sesión, redirigir de todos modos
        console.log('⚠️ No session found, redirecting to home...');
        setStatus('timeout');
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
          window.location.href = '/';
        }, 2000);

      } catch (err) {
        console.error('🔥 Unexpected error in OAuth callback:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    processOAuthCallback();
  }, []);

  // Si ya está autenticado (por el listener de AuthContext), redirigir
  useEffect(() => {
    if (isAuthenticated && status === 'processing') {
      console.log('✅ User authenticated via listener, redirecting...');
      setStatus('success');
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/');
        window.location.href = '/';
      }, 1000);
    }
  }, [isAuthenticated, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center px-6">
        {status === 'success' || isAuthenticated ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
              ¡Autenticación exitosa!
            </h2>
            <p className="text-[#F5DEB3] opacity-70">
              Redirigiendo a la app...
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              Error de autenticación
            </h2>
            <p className="text-[#F5DEB3] opacity-70 mb-4">
              {error || 'Ocurrió un error al iniciar sesión'}
            </p>
            <button
              onClick={() => {
                window.history.replaceState({}, document.title, '/');
                window.location.href = '/';
              }}
              className="px-6 py-2 bg-[#D4A574] text-black font-bold rounded-lg"
            >
              Volver al inicio
            </button>
          </>
        ) : status === 'timeout' ? (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
              Procesando...
            </h2>
            <p className="text-[#F5DEB3] opacity-70">
              Redirigiendo en unos segundos...
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
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;