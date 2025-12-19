// components/AppNavigator.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { AuthSelectionScreen } from './AuthSelectionScreen';
import AnotadorTruco from './AnotadorTruco';
import MainApp from './MainApp';
import OnboardingSlides from './OnboardingSlides';
import LoadingScreen from './LoadingScreen';
import AchievementNotificationContainer from './AchievementNotificationContainer';
import AuthCallbackPage from './AuthCallbackPage';

const AppNavigator = () => {
  const { isLoading, isAuthenticated, isAnonymous, continueAsAnonymous } = useAuth();
  const { getOnboardingStep, shouldShowAuthPrompt } = useAuthNavigation();
  const [currentRoute, setCurrentRoute] = useState('Loading');
  
  // Check if we're on OAuth callback URL
  const isOAuthCallback = window.location.hash.includes('access_token') || 
                         window.location.search.includes('code=') ||
                         window.location.pathname === '/auth/callback';
  
  useEffect(() => {
    if (!isLoading) {
      const route = getOnboardingStep();
      setCurrentRoute(route);
    }
  }, [isLoading, isAuthenticated, isAnonymous]);
  
  // Handle OAuth callback first
  if (isOAuthCallback) {
    return <AuthCallbackPage />;
  }

  // Loading inicial
  if (isLoading || currentRoute === 'Loading') {
    return <LoadingScreen />;
  }
  
  // Onboarding primera vez
  if (currentRoute === 'onboarding') {
    return (
      <OnboardingSlides 
        onComplete={() => {
          localStorage.setItem('trucoapp_onboarding_seen', 'true');
          setCurrentRoute('AuthSelection');
        }} 
      />
    );
  }
  
  // Pantalla de autenticación
  if (currentRoute === 'AuthSelection') {
    return (
      <AuthSelectionScreen 
        onContinueAnonymous={() => {
          continueAsAnonymous();
          setCurrentRoute('Start');
        }}
      />
    );
  }
  
  // App principal con sistema de tabs
  if (currentRoute === 'Start' || isAnonymous || isAuthenticated) {
    return (
      <>
        <MainApp 
          onShowAuth={() => setCurrentRoute('AuthSelection')}
        />
        
        {/* Sistema de notificaciones de logros */}
        <AchievementNotificationContainer />
        
        {/* Prompt suave para auth después de varias partidas */}
        {shouldShowAuthPrompt() && (
          <AuthPromptModal 
            onShowAuth={() => setCurrentRoute('AuthSelection')}
            onDismiss={() => {
              // Marcar que ya se mostró el prompt para no ser invasivo
              localStorage.setItem('auth_prompt_shown', Date.now().toString());
            }}
          />
        )}
      </>
    );
  }
  
  // Fallback al anotador
  return <AnotadorTruco />;
};

// Componente simple para prompt no invasivo
const AuthPromptModal = ({ onShowAuth, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Solo mostrar si no se ha mostrado en las últimas 24 horas
    const lastShown = localStorage.getItem('auth_prompt_shown');
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (!lastShown || (now - parseInt(lastShown)) > dayInMs) {
      setIsVisible(true);
    }
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-2 border-[#D4A574] rounded-lg p-6 max-w-sm w-full text-center">
        <div className="text-2xl mb-3">👑</div>
        <h3 className="text-xl font-bold text-[#D4A574] mb-2">¡Llevás {getGamesPlayed()} partidas!</h3>
        <p className="text-[#F5DEB3] mb-4 text-sm">
          Creá una cuenta para ver tus estadísticas y competir en rankings
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              setIsVisible(false);
              onShowAuth();
            }}
            className="w-full py-2 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Ver opciones
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="w-full py-2 text-[#F5DEB3] opacity-70 hover:opacity-100 transition-opacity"
          >
            Seguir sin cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper para obtener número de partidas jugadas
const getGamesPlayed = () => {
  try {
    const gameState = localStorage.getItem('rey-del-truco-state');
    if (gameState) {
      const data = JSON.parse(gameState);
      return data.localData?.partidasJugadas || 0;
    }
  } catch {
    // Fallback silencioso
  }
  return 0;
};

export default AppNavigator;