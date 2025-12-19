// components/AuthSelectionScreen.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthSelectionScreen = ({ onContinueAnonymous }) => {
  const { signInWithGoogle, isLoading, error } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      console.log('🔐 Iniciando Google OAuth...');
      await signInWithGoogle();
    } catch (error) {
      console.error('🔥 Error en Google sign in:', error);
    }
  };
  
  const handleAppleSignIn = () => {
    console.log('🍎 Apple Sign In - próximamente disponible');
    // TODO: Implement Apple Sign-In
  };
  
  const handleSMSSignIn = () => {
    console.log('📱 SMS Sign In - próximamente disponible'); 
    // TODO: Implement SMS Sign-In
  };
  
  return (
    <div className="rey-premium-layout min-h-screen flex items-center justify-center">
      <div className="rey-premium-container max-w-md mx-auto p-6">
        <div className="auth-selection-screen text-center">
          {/* Header */}
          <header className="auth-header mb-8">
            <h1 className="auth-title text-4xl font-bold mb-2 font-['Tilt_Warp'] text-[#D4A574]">
              REY DEL TRUCO
            </h1>
            <p className="auth-subtitle text-lg text-[#F5DEB3] opacity-90">
              El anotador inteligente para jugadores reales
            </p>
          </header>
          
          {/* Auth Buttons */}
          <div className="auth-buttons space-y-4 mb-6">
            <button
              className="auth-button google-button w-full p-4 rounded-lg bg-white text-gray-900 font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#D4A574]"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <span className="auth-icon text-xl">🔷</span>
              <span>Continuar con Google</span>
            </button>
            
            <button
              className="auth-button apple-button w-full p-4 rounded-lg bg-black text-white font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#D4A574]"
              onClick={handleAppleSignIn}
              disabled={isLoading}
            >
              <span className="auth-icon text-xl">🍎</span>
              <span>Continuar con Apple</span>
            </button>
            
            <button
              className="auth-button sms-button w-full p-4 rounded-lg bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleSMSSignIn}
              disabled={isLoading}
            >
              <span className="auth-icon text-xl">📱</span>
              <span>Continuar con SMS</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="auth-divider flex items-center my-6">
            <div className="divider-line flex-1 h-px bg-[#F5DEB3] opacity-30"></div>
            <span className="divider-text mx-4 text-[#F5DEB3] opacity-70">o</span>
            <div className="divider-line flex-1 h-px bg-[#F5DEB3] opacity-30"></div>
          </div>
          
          {/* Anonymous Button */}
          <button
            className="anonymous-button w-full p-4 bg-transparent border-2 border-[#F5DEB3] border-opacity-50 rounded-lg text-[#F5DEB3] hover:bg-[#F5DEB3] hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center space-x-3"
            onClick={onContinueAnonymous}
          >
            <span className="anonymous-icon text-xl">💨</span>
            <div className="anonymous-content text-center">
              <div className="anonymous-title font-semibold">Entrar sin cuenta</div>
              <div className="anonymous-subtitle text-sm opacity-70">Solo anotador, sin estadísticas</div>
            </div>
          </button>
          
          {/* Error Display */}
          {error && (
            <div className="auth-error mt-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="auth-loading mt-4 flex items-center justify-center space-x-2 text-[#D4A574]">
              <div className="spinner animate-spin w-5 h-5 border-2 border-[#D4A574] border-t-transparent rounded-full"></div>
              <span>Iniciando sesión...</span>
            </div>
          )}
          
          {/* Terms */}
          <p className="auth-terms mt-6 text-sm text-[#F5DEB3] opacity-60">
            Al continuar aceptás los términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
};