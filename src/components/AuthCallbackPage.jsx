// src/components/AuthCallbackPage.jsx - OAuth callback handler
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabase';

const AuthCallbackPage = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Iniciando...');
  const processedRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Evitar procesamiento doble
    if (processedRef.current) return;
    processedRef.current = true;

    console.log('🔐 AuthCallbackPage mounted');
    console.log('📍 Full URL:', window.location.href);
    console.log('📍 Hash:', window.location.hash);
    console.log('📍 Search:', window.location.search);

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    // Check for errors in URL first
    const errorParam = hashParams.get('error') || queryParams.get('error');
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

    if (errorParam) {
      console.error('🔥 OAuth error from provider:', errorParam, errorDescription);
      setError(decodeURIComponent(errorDescription || errorParam));
      setStatus('error');
      return;
    }

    // Check what we have in the URL
    const code = queryParams.get('code');
    const accessToken = hashParams.get('access_token');

    console.log('🔑 URL contains:', { hasCode: !!code, hasAccessToken: !!accessToken });

    const processAuth = async () => {
      try {
        // If we have a code, we need to exchange it for a session
        if (code) {
          console.log('🔄 Exchanging authorization code for session...');
          setDebugInfo('Intercambiando código por sesión...');

          // Supabase should auto-exchange with detectSessionInUrl: true
          // But let's also manually try if needed
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('🔥 Code exchange error:', exchangeError);
            // Don't fail immediately - the listener might still work
            setDebugInfo('Verificando sesión...');
          } else if (data.session) {
            console.log('✅ Code exchanged successfully!', data.session.user?.email);
            handleSuccess(data.session);
            return;
          }
        }

        // If we have an access token in hash (implicit flow)
        if (accessToken) {
          console.log('🔑 Access token found in URL hash');
          setDebugInfo('Estableciendo sesión...');
          // Supabase should handle this automatically
        }

        // Wait for Supabase to process and check session
        setDebugInfo('Verificando sesión...');
        await checkSessionWithRetry();

      } catch (err) {
        console.error('🔥 Auth processing error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    const checkSessionWithRetry = async (attempts = 0) => {
      const maxAttempts = 5;
      const delay = 1000; // 1 second between attempts

      console.log(`🔍 Checking session (attempt ${attempts + 1}/${maxAttempts})...`);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('🔥 Session check error:', sessionError);
      }

      if (session?.user) {
        console.log('✅ Session found!', session.user.email);
        handleSuccess(session);
        return;
      }

      if (attempts < maxAttempts - 1) {
        console.log(`⏳ No session yet, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkSessionWithRetry(attempts + 1);
      }

      // All attempts failed
      console.log('❌ No session after all attempts');
      setStatus('timeout');
      setDebugInfo('No se pudo establecer la sesión');

      // Redirect to home after delay
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/');
        window.location.replace('/');
      }, 2000);
    };

    const handleSuccess = (session) => {
      console.log('🎉 Authentication successful!', session.user.email);
      localStorage.setItem('trucoapp_had_auth', 'true');
      setStatus('success');

      // Clean URL and redirect
      setTimeout(() => {
        console.log('🔄 Redirecting to home...');
        window.history.replaceState({}, document.title, '/');
        window.location.replace('/');
      }, 1500);
    };

    // Also listen for auth state changes as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.email || 'no user');

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        if (status === 'processing') {
          handleSuccess(session);
        }
      }
    });

    // Start processing
    processAuth();

    // Safety timeout - 30 seconds max
    timeoutRef.current = setTimeout(() => {
      if (status === 'processing') {
        console.log('⏱️ Safety timeout reached');
        setStatus('timeout');
        setDebugInfo('Tiempo agotado');
        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
          window.location.replace('/');
        }, 2000);
      }
    }, 30000);

    // Cleanup
    return () => {
      console.log('🧹 AuthCallbackPage cleanup');
      clearTimeout(timeoutRef.current);
      subscription?.unsubscribe();
    };
  }, [status]);

  const handleRetry = () => {
    window.history.replaceState({}, document.title, '/');
    window.location.replace('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center px-6 max-w-md">
        {status === 'success' ? (
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
              onClick={handleRetry}
              className="px-6 py-2 bg-[#D4A574] text-black font-bold rounded-lg"
            >
              Volver al inicio
            </button>
          </>
        ) : status === 'timeout' ? (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#D4A574] mb-2">
              Tiempo agotado
            </h2>
            <p className="text-[#F5DEB3] opacity-70 mb-2">
              No se pudo completar la autenticación
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-[#D4A574] text-black font-bold rounded-lg"
            >
              Volver al inicio
            </button>
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
            {debugInfo && (
              <p className="text-[#F5DEB3] opacity-50 text-xs mt-4">
                {debugInfo}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
