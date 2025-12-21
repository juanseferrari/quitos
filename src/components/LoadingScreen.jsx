// components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    console.log('⏳ LoadingScreen mounted - starting timer');

    const timer = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1;
        console.log(`⏳ Loading for ${newTime} seconds...`);

        // Show retry button after 8 seconds
        if (newTime >= 8 && !showRetry) {
          console.log('⚠️ Loading taking too long, showing retry option');
          setShowRetry(true);
        }

        return newTime;
      });
    }, 1000);

    return () => {
      console.log('⏳ LoadingScreen unmounted after', loadingTime, 'seconds');
      clearInterval(timer);
    };
  }, []);

  const handleRetry = () => {
    console.log('🔄 User clicked retry - clearing session and reloading');
    // Clear all auth-related localStorage
    const keysToRemove = [
      'rey-del-truco-auth',
      'sb-pmymvwpgjacrkbimccao-auth-token',
      'supabase.auth.token',
      'trucoapp_token',
      'trucoapp_refresh_token',
      'trucoapp_had_auth'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Force reload
    window.location.reload();
  };

  const handleContinueAnonymous = () => {
    console.log('👤 User chose to continue anonymously');
    // Clear auth data and reload
    localStorage.removeItem('trucoapp_had_auth');
    window.location.reload();
  };

  return (
    <div className="rey-premium-layout min-h-screen flex items-center justify-center">
      <div className="text-center">
        {/* Corona animada */}
        <div className="text-6xl mb-6 animate-pulse">
          👑
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold mb-2 font-['Tilt_Warp'] text-[#D4A574]">
          REY DEL
        </h1>
        <h2 className="text-4xl font-bold mb-6 font-['Tilt_Warp'] text-[#D4A574]">
          TRUCO
        </h2>

        {/* Barra de progreso */}
        <div className="w-64 mx-auto mb-4">
          <div className="h-2 bg-[#F5DEB3] bg-opacity-20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4A574] to-[#C59660] rounded-full animate-pulse"></div>
          </div>
        </div>

        <p className="text-[#F5DEB3] opacity-70 mb-2">
          {loadingTime < 3 ? 'Cargando...' :
           loadingTime < 6 ? 'Conectando con el servidor...' :
           loadingTime < 10 ? 'Esto está tardando más de lo normal...' :
           'Hay un problema de conexión'}
        </p>

        {/* Debug info - solo visible después de 5 segundos */}
        {loadingTime >= 5 && (
          <p className="text-[#F5DEB3] opacity-40 text-xs mb-4">
            Tiempo de carga: {loadingTime}s
          </p>
        )}

        {/* Retry options - visible después de 8 segundos */}
        {showRetry && (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleRetry}
              className="w-full max-w-xs mx-auto px-6 py-3 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              🔄 Reintentar
            </button>

            <button
              onClick={handleContinueAnonymous}
              className="w-full max-w-xs mx-auto px-6 py-2 border border-[#F5DEB3] border-opacity-30 text-[#F5DEB3] rounded-lg hover:bg-[#F5DEB3] hover:bg-opacity-10 transition-all text-sm"
            >
              Continuar sin cuenta
            </button>

            <p className="text-[#F5DEB3] opacity-50 text-xs mt-2">
              Si el problema persiste, probá cerrar y abrir la app
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
