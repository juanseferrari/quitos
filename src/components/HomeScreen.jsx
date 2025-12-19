// components/HomeScreen.jsx - Pantalla de inicio/dashboard
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useStats';
import ScreenContainer from './ScreenContainer';

const HomeScreen = ({ onNavigateToPlay, onShowAuth }) => {
  const { isAuthenticated, user } = useAuth();
  const { userStats, getTopInsight, shouldShowInsights, gameStats } = useStats();
  
  const topInsight = getTopInsight();
  
  // Obtener el último partido jugado
  const lastGame = gameStats && gameStats.length > 0 ? gameStats[gameStats.length - 1] : null;
  
  // Debug logs
  console.log('🏠 HomeScreen Debug:', {
    gameStatsLength: gameStats?.length || 0,
    gameStats: gameStats,
    lastGame: lastGame,
    userStatsGamesPlayed: userStats?.games_played || 0
  });
  
  // Función para formatear tiempo relativo
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Reciente';
    
    const now = new Date();
    const gameDate = new Date(dateString);
    const diffMs = now - gameDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Hace momentos';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return gameDate.toLocaleDateString('es-AR');
  };
  
  return (
    <ScreenContainer>
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-6">
        <div className="text-center">
          <img
            src="/throne-icon.png"
            alt="Rey del Truco"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#D4A574]">
            REY DEL TRUCO
          </h1>
          {isAuthenticated ? (
            <p className="text-[#F5DEB3] text-sm mt-1">
              ¡Hola, {user.name || user.username || 'Rey'}!
            </p>
          ) : (
            <p className="text-[#F5DEB3] text-sm mt-1">
              El anotador inteligente
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Acciones Rápidas */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h2 className="text-lg font-bold text-[#D4A574] mb-4 text-center">
            ⚡ ACCIONES RÁPIDAS
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={onNavigateToPlay}
              className="w-full py-4 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🎮 JUGAR PARTIDO
            </button>
          </div>
        </div>
        
        {/* Estadísticas Rápidas (solo si está autenticado) */}
        {isAuthenticated && userStats.games_played > 0 && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
            <h2 className="text-lg font-bold text-[#D4A574] mb-3 text-center">
              📊 TUS NÚMEROS
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#D4A574]">
                  {userStats.games_played}
                </div>
                <div className="text-[#F5DEB3] text-sm">Partidos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {userStats.win_rate.toFixed(0)}%
                </div>
                <div className="text-[#F5DEB3] text-sm">Win Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#D4A574]">
                  {userStats.current_streak > 0 ? '🔥' : '❄️'} {Math.abs(userStats.current_streak)}
                </div>
                <div className="text-[#F5DEB3] text-sm">Racha</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#D4A574]">
                  {userStats.longest_win_streak}
                </div>
                <div className="text-[#F5DEB3] text-sm">Mejor</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Insight Destacado */}
        {shouldShowInsights() && topInsight && (
          <div className="bg-gradient-to-r from-[#D4A574] to-[#C59660] rounded-lg p-4">
            <h2 className="text-lg font-bold text-[#0a0a0a] mb-2 text-center">
              ⭐ DESTACADO
            </h2>
            <div className="text-center">
              <div className="text-lg font-bold text-[#0a0a0a] mb-1">
                {topInsight.title}
              </div>
              <div className="text-[#0a0a0a] text-sm">
                {topInsight.message}
              </div>
            </div>
          </div>
        )}
        
        {/* Actividad Reciente */}
        {isAuthenticated && userStats.games_played > 0 && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
            <h2 className="text-lg font-bold text-[#D4A574] mb-3 text-center">
              📝 ACTIVIDAD RECIENTE
            </h2>
            
            <div className="space-y-2 text-[#F5DEB3] text-sm">
              {lastGame && (
                <div className="bg-[#1a1a1a] rounded p-3">
                  <div className="flex justify-between items-center">
                    <span>Último partido</span>
                    <span className={`${lastGame.is_victory ? 'text-green-400' : 'text-red-400'}`}>
                      {lastGame.is_victory ? 'Victoria' : 'Derrota'} {lastGame.final_score_user}-{lastGame.final_score_opponent}
                    </span>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    vs {lastGame.opponent_name || 'Rival'} • {formatTimeAgo(lastGame.date_played)}
                  </div>
                </div>
              )}
              
              {userStats.current_streak > 3 && (
                <div className="bg-[#1a1a1a] rounded p-3">
                  <div className="flex justify-between items-center">
                    <span>Racha activa</span>
                    <span className="text-green-400">🔥 {userStats.current_streak}</span>
                  </div>
                  <div className="text-xs opacity-70 mt-1">¡Vas imparable!</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Promoción para usuarios anónimos */}
        {!isAuthenticated && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-[#D4A574] mb-2">
              ¿Querés ser el Rey?
            </h3>
            <p className="text-[#F5DEB3] text-sm mb-4 leading-relaxed">
              Creá tu cuenta para acceder a estadísticas detalladas,
              rankings locales y competir por el trono del truco.
            </p>
            <button
              onClick={onShowAuth}
              className="py-2 px-6 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              👑 CREAR CUENTA
            </button>
          </div>
        )}

        {/* Footer con links legales */}
        <div className="pt-4 pb-2 text-center">
          <p className="text-[#F5DEB3] text-[10px] opacity-40">
            <a
              href="/privacy"
              className="hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/privacy');
                window.location.reload();
              }}
            >
              Privacidad
            </a>
            {' · '}
            <a
              href="/terms"
              className="hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/terms');
                window.location.reload();
              }}
            >
              Términos
            </a>
          </p>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default HomeScreen;