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

    const processOAuthCallback = async () => {
      const currentUrl = window.location.href;
      const hash = window.location.hash;
      const search = window.location.search;

      console.log('🔐 AuthCallbackPage: Starting OAuth callback processing');
      console.log('📍 URL:', currentUrl);
      console.log('📍 Hash:', hash);
      console.log('📍 Search:', search);

      setDebugInfo(`URL: ${currentUrl.substring(0, 100)}...`);

      try {
        // Parse tokens from URL
        const hashParams = new URLSearchParams(hash.substring(1));
        const queryParams = new URLSearchParams(search);

        // Check for access_token in hash (implicit flow) or query params
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const expiresIn = hashParams.get('expires_in') || queryParams.get('expires_in');
        const tokenType = hashParams.get('token_type') || queryParams.get('token_type');

        // Check for authorization code (PKCE flow)
        const code = queryParams.get('code');

        // Check for errors
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        console.log('🔍 Parsed params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code,
          hasError: !!errorParam
        });

        // Handle OAuth errors
        if (errorParam) {
          console.error('🔥 OAuth error from provider:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setStatus('error');
          return;
        }

        // CASE 1: We have an access_token directly (implicit grant or hash fragment)
        if (accessToken) {
          console.log('✅ Found access_token, setting session manually...');
          setDebugInfo('Configurando sesión con token...');

          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (setSessionError) {
            console.error('🔥 Error setting session:', setSessionError);
            setError(setSessionError.message);
            setStatus('error');
            return;
          }

          if (data?.user) {
            console.log('✅ Session set successfully for:', data.user.email);
            localStorage.setItem('trucoapp_had_auth', 'true');
            setStatus('success');

            // Redirect after a short delay
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              window.location.replace('/');
            }, 1500);
            return;
          } else {
            console.error('🔥 setSession succeeded but no user returned');
            setError('No se pudo obtener información del usuario');
            setStatus('error');
            return;
          }
        }

        // CASE 2: We have an authorization code (PKCE flow)
        if (code) {
          console.log('✅ Found authorization code, exchanging for session...');
          setDebugInfo('Intercambiando código por sesión...');

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('🔥 Error exchanging code:', exchangeError);
            setError(exchangeError.message);
            setStatus('error');
            return;
          }

          if (data?.user) {
            console.log('✅ Code exchange successful for:', data.user.email);
            localStorage.setItem('trucoapp_had_auth', 'true');
            setStatus('success');

            setTimeout(() => {
              window.history.replaceState({}, document.title, '/');
              window.location.replace('/');
            }, 1500);
            return;
          }
        }

        // CASE 3: No tokens in URL, maybe session was already set by Supabase
        console.log('🔍 No tokens in URL, checking for existing session...');
        setDebugInfo('Verificando sesión existente...');

        // Wait a moment for Supabase to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        if (getSessionError) {
          console.error('🔥 Error getting session:', getSessionError);
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          localStorage.setItem('trucoapp_had_auth', 'true');
          setStatus('success');

          setTimeout(() => {
            window.history.replaceState({}, document.title, '/');
            window.location.replace('/');
          }, 1500);
          return;
        }

        // CASE 4: Still no session, this shouldn't happen
        console.log('⚠️ No session found after OAuth callback');
        setDebugInfo('No se encontró sesión');
        setStatus('timeout');

        setTimeout(() => {
          window.history.replaceState({}, document.title, '/');
          window.location.replace('/');
        }, 3000);

      } catch (err) {
        console.error('🔥 Unexpected error in OAuth callback:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    processOAuthCallback();
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
