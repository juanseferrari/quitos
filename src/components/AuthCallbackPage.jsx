// src/components/AuthCallbackPage.jsx - OAuth callback handler
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabase';

const AuthCallbackPage = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    // Evitar procesamiento doble
    if (processedRef.current) return;
    processedRef.current = true;

    const handleOAuthCallback = async () => {
      const currentUrl = window.location.href;
      console.log('🔐 AuthCallbackPage: Waiting for Supabase to process OAuth...');
      console.log('📍 URL:', currentUrl);
      setDebugInfo('Procesando autenticación...');

      // Check for errors in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      const errorParam = hashParams.get('error') || queryParams.get('error');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

      if (errorParam) {
        console.error('🔥 OAuth error from provider:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        setStatus('error');
        return;
      }

      // With detectSessionInUrl: true, Supabase automatically processes the tokens
      // We just need to wait for the session to be available
      // Poll for session with timeout
      const maxAttempts = 20; // 10 seconds total
      const pollInterval = 500; // 500ms between checks

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔄 Checking for session (attempt ${attempt}/${maxAttempts})...`);
        setDebugInfo(`Verificando sesión (${attempt}/${maxAttempts})...`);

        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('🔥 Session error:', sessionError);
          }

          if (session?.user) {
            console.log('✅ Session found!', session.user.email);
            localStorage.setItem('trucoapp_had_auth', 'true');
            setStatus('success');

            // Clean URL and redirect after short delay
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              window.location.replace('/');
            }, 1000);
            return;
          }
        } catch (err) {
          console.error('🔥 Error checking session:', err);
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

      // If we get here, no session was found after all attempts
      console.log('⚠️ No session found after polling');
      setDebugInfo('No se encontró sesión después de verificar');
      setStatus('timeout');

      // Redirect to home anyway after timeout
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/');
        window.location.replace('/');
      }, 2000);
    };

    // Small delay to let Supabase process the URL first
    setTimeout(handleOAuthCallback, 200);
  }, []);

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
              Procesando...
            </h2>
            <p className="text-[#F5DEB3] opacity-70 mb-2">
              Redirigiendo en unos segundos...
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-[#D4A574] text-black font-bold rounded-lg"
            >
              Continuar manualmente
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
              <p className="text-[#F5DEB3] opacity-50 text-xs mt-4 break-all">
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
