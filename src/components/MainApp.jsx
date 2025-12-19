// components/MainApp.jsx - Sistema de tabs principal según UX flow
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import IOSContainer, { IOSContentArea, IOSTabBar } from './IOSContainer';
import AnotadorTruco from './AnotadorTruco';
import StatsScreen from './StatsScreen';
import HomeScreen from './HomeScreen';
import SocialScreen from './SocialScreen';
import ProfileScreen from './ProfileScreen';
import AchievementsScreen from './AchievementsScreen';

const MainApp = ({ onShowAuth }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { isAuthenticated, isAnonymous } = useAuth();
  
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'play', icon: '🎮', label: 'Anotador' },
    // Temporarily hidden until fully developed:
    // { id: 'achievements', icon: '🏆', label: 'Logros', authRequired: true },
    // { id: 'stats', icon: '📊', label: 'Stats', authRequired: true },
    // { id: 'social', icon: '👥', label: 'Social', authRequired: true },
    { id: 'profile', icon: '👤', label: 'Perfil', authRequired: true }
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToPlay={() => setActiveTab('play')} onShowAuth={onShowAuth} />;
      case 'play':
        return <AnotadorTruco onShowAuth={onShowAuth} />;
      case 'achievements':
        return isAuthenticated ? <AchievementsScreen /> : <AuthRequiredScreen onShowAuth={onShowAuth} screen="Logros" />;
      case 'stats':
        return isAuthenticated ? <StatsScreen /> : <AuthRequiredScreen onShowAuth={onShowAuth} screen="Estadísticas" />;
      case 'social':
        return isAuthenticated ? <SocialScreen /> : <AuthRequiredScreen onShowAuth={onShowAuth} screen="Social" />;
      case 'profile':
        return isAuthenticated ? <ProfileScreen /> : <AuthRequiredScreen onShowAuth={onShowAuth} screen="Perfil" />;
      default:
        return <HomeScreen onNavigateToPlay={() => setActiveTab('play')} onShowAuth={onShowAuth} />;
    }
  };
  
  const handleTabClick = (tabId, authRequired) => {
    if (authRequired && !isAuthenticated) {
      // Aún así navegar al tab para mostrar la pantalla de auth requerida
      setActiveTab(tabId);
    } else {
      setActiveTab(tabId);
    }
  };
  
  return (
    <IOSContainer>
      {/* Contenido principal */}
      <IOSContentArea noScroll={activeTab === 'play'}>
        {renderTabContent()}
      </IOSContentArea>
      
      {/* Tab Navigator */}
      <IOSTabBar>
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const needsAuth = tab.authRequired && !isAuthenticated;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.authRequired)}
                className={`flex flex-col items-center py-0.5 px-2 rounded transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D4A574] bg-opacity-20 text-[#D4A574]'
                    : needsAuth
                      ? 'text-[#F5DEB3] opacity-50'
                      : 'text-[#F5DEB3] opacity-70 hover:opacity-100 hover:bg-[#F5DEB3] hover:bg-opacity-10'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-[9px] font-medium leading-tight">{tab.label}</span>
                {needsAuth && <span className="text-[7px] opacity-60 leading-none">🔒</span>}
              </button>
            );
          })}
        </div>
      </IOSTabBar>
    </IOSContainer>
  );
};

// Componente para pantallas que requieren autenticación
const AuthRequiredScreen = ({ onShowAuth, screen }) => {
  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="text-center max-w-sm mx-auto">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[#D4A574] mb-4">
          {screen} Premium
        </h2>
        <p className="text-[#F5DEB3] mb-6 leading-relaxed">
          Para acceder a {screen.toLowerCase()}, necesitás crear una cuenta y desbloquear 
          todas las funciones del Rey del Truco.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onShowAuth}
            className="w-full py-3 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            👑 CREAR CUENTA
          </button>
          
          <p className="text-xs text-[#F5DEB3] opacity-60">
            • Estadísticas ilimitadas<br/>
            • Rankings y competencia<br/>
            • Rivalidades y logros
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainApp;