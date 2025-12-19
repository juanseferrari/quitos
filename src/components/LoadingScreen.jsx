// components/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = () => {
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
        
        <p className="text-[#F5DEB3] opacity-70">
          Cargando...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;