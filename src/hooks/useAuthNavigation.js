// hooks/useAuthNavigation.js
import { useAuth } from './useAuth';

export const useAuthNavigation = () => {
  const { isAuthenticated, isAnonymous, needsOnboarding, isLoading } = useAuth();
  
  const getInitialRoute = () => {
    if (isLoading) {
      return 'Loading';
    }
    
    if (isAnonymous) {
      // Usuario sin cuenta - ir directo al anotador (comportamiento actual)
      return 'Start';
    }
    
    if (isAuthenticated && needsOnboarding) {
      // Usuario autenticado pero sin perfil completo
      return 'ProfileSetup';
    }
    
    if (isAuthenticated) {
      // Usuario autenticado completo - ir al dashboard (futuro)
      // Por ahora, volver al anotador también
      return 'Start';
    }
    
    // Default - mostrar opciones de auth
    return 'AuthSelection';
  };
  
  const shouldShowAuthPrompt = () => {
    // Mostrar prompt de auth después de 3 partidas anónimas
    const gameState = localStorage.getItem('rey-del-truco-state');
    if (gameState) {
      const data = JSON.parse(gameState);
      return data.localData?.partidasJugadas >= 3 && isAnonymous;
    }
    return false;
  };
  
  const getOnboardingStep = () => {
    const hasSeenOnboarding = localStorage.getItem('trucoapp_onboarding_seen');
    
    if (!hasSeenOnboarding) {
      return 'onboarding'; // Mostrar slides de onboarding primero
    }
    
    // Si ya vio onboarding, seguir lógica normal
    return getInitialRoute();
  };
  
  return { 
    getInitialRoute, 
    shouldShowAuthPrompt,
    getOnboardingStep,
    currentRoute: getInitialRoute()
  };
};