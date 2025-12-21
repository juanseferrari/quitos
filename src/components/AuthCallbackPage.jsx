// src/components/AuthCallbackPage.jsx - OAuth callback handler
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabase';

const AuthCallbackPage = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Iniciando...');
  const processedRef = useRef(false);
  const timeoutRef = useRef(null);
  const statusRef = useRef('processing'); // Track status for async checks

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // Evitar procesamiento doble
    if (processedRef.current) return;
    processedRef.current = true;

    console.log('🔐 AuthCallbackPage mounted');
    console.log('📍 URL:', window.location.href);
    console.log('📍 Hash:', window.location.hash);
    console.log('📍 Search:', window.location.search);

    // Check for errors in URL first
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

    // Set up auth state listener - this is the KEY change
    // Instead of polling, we listen for the auth state change event
    // which Supabase emits after processing the code
    setDebugInfo('Esperando autenticación de Supabase...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 AuthCallbackPage received auth event:', event, session?.user?.email || 'no user');

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ SIGNED_IN event received!', session.user.email);
        clearTimeout(timeoutRef.current);
        localStorage.setItem('trucoapp_had_auth', 'true');
        statusRef.current = 'success';
        setStatus('success');

        // Clean URL and redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to home...');
          window.history.replaceState({}, document.title, '/');
          window.location.replace('/');
        }, 1000);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('✅ TOKEN_REFRESHED event with session!', session.user.email);
        clearTimeout(timeoutRef.current);
        localStorage.setItem('trucoapp_had_auth', 'true');
        statusRef.current = 'success';
        setStatus('success');

        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
          window.location.replace('/');
        }, 1000);
      } else if (event === 'INITIAL_SESSION') {
        // Check if there's already a session
        if (session?.user) {
          console.log('✅ INITIAL_SESSION has user!', session.user.email);
          clearTimeout(timeoutRef.current);
          localStorage.setItem('trucoapp_had_auth', 'true');
          statusRef.current = 'success';
          setStatus('success');

          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            window.location.replace('/');
          }, 1000);
        } else {
          console.log('ℹ️ INITIAL_SESSION without user, waiting for SIGNED_IN...');
          setDebugInfo('Procesando código de autorización...');
        }
      }
    });

    // Also check if we have a code to exchange (PKCE flow)
    const code = queryParams.get('code');
    if (code) {
      console.log('🔑 Found authorization code, Supabase should auto-exchange it...');
      setDebugInfo('Intercambiando código por sesión...');
    }

    // IMPORTANT: Check if session was already established before listener was set up
    // This handles the race condition where Supabase processes the code before
    // our listener is ready
    const checkExistingSession = async () => {
      // Small delay to let Supabase finish processing
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔍 Initial session check:', session?.user?.email || 'no session', error?.message || 'no error');

      if (session?.user && statusRef.current === 'processing') {
        console.log('✅ Session already exists!', session.user.email);
        clearTimeout(timeoutRef.current);
        localStorage.setItem('trucoapp_had_auth', 'true');
        statusRef.current = 'success';
        setStatus('success');

        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
          window.location.replace('/');
        }, 1000);
      }
    };

    checkExistingSession();

    // Set a timeout for safety - if nothing happens in 15 seconds, redirect anyway
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ Timeout reached, checking final session state...');

      // One final check
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('🔥 Final session check error:', error);
          setError('Error al verificar sesión');
          setStatus('error');
        } else if (session?.user) {
          console.log('✅ Found session on timeout check!', session.user.email);
          localStorage.setItem('trucoapp_had_auth', 'true');
          setStatus('success');
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            window.location.replace('/');
          }, 500);
        } else {
          console.log('⚠️ No session found after timeout');
          setDebugInfo('No se pudo establecer sesión');
          setStatus('timeout');
          // Redirect to home after short delay
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            window.location.replace('/');
          }, 2000);
        }
      });
    }, 15000); // 15 second timeout

    // Cleanup
    return () => {
      console.log('🧹 AuthCallbackPage cleanup');
      clearTimeout(timeoutRef.current);
      subscription?.unsubscribe();
    };
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
