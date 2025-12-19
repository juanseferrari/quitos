// components/AchievementNotification.jsx - Componente de notificación individual de logros
import React, { useEffect, useState } from 'react';
import { useAchievementNotifications } from '../hooks/useAchievementNotifications';

const AchievementNotification = ({ achievement, onDismiss, autoHide = true }) => {
  const {
    getTierEffects,
    getNotificationStyle,
    animationState
  } = useAchievementNotifications();

  const [particles, setParticles] = useState([]);
  
  const tierEffects = getTierEffects(achievement.tier);

  // Generar partículas para efectos visuales
  useEffect(() => {
    if (achievement.tier === 'legendary') {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: ['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
    } else if (achievement.tier === 'gold' || achievement.tier === 'platinum') {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        emoji: achievement.tier === 'gold' ? '🌟' : '⭐',
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5
      }));
      setParticles(newParticles);
    }
  }, [achievement.tier]);

  return (
    <div className={`${getNotificationStyle()} ${tierEffects.glow}`}>
      {/* Partículas de fondo para logros legendarios */}
      {achievement.tier === 'legendary' && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: '2s'
              }}
            >
              <span className="text-lg">{particle.emoji}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Header con ícono de cierre */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="text-2xl animate-bounce">{achievement.badge_icon}</div>
            <div className="text-sm font-bold text-[#D4A574] uppercase tracking-wide">
              ¡Logro desbloqueado!
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-[#F5DEB3] hover:text-[#D4A574] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Nombre del logro */}
        <h3 className="text-lg font-bold text-[#F5DEB3] mb-2" style={{ fontFamily: '"Tilt Warp", sans-serif' }}>
          {achievement.name}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-[#F5DEB3] opacity-90 mb-3">
          {achievement.description}
        </p>

        {/* Footer con recompensas */}
        <div className="flex items-center justify-between pt-3 border-t border-[#D4A574] border-opacity-20">
          <div className="flex items-center space-x-4">
            {/* Puntos de recompensa */}
            {achievement.points_reward > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-[#D4A574] text-sm">💰</span>
                <span className="text-[#D4A574] text-sm font-medium">
                  +{achievement.points_reward} pts
                </span>
              </div>
            )}

            {/* Título desbloqueado */}
            {achievement.title_unlock && (
              <div className="flex items-center space-x-1">
                <span className="text-[#D4A574] text-sm">👑</span>
                <span className="text-[#D4A574] text-xs">
                  "{achievement.title_unlock}"
                </span>
              </div>
            )}
          </div>

          {/* Tier del logro */}
          <div
            className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${tierEffects.gradient}20`,
              color: tierEffects.border.replace('border-', ''),
              border: `1px solid ${tierEffects.border.replace('border-', '')}40`
            }}
          >
            {achievement.tier}
          </div>
        </div>
      </div>

      {/* Efectos de borde animados para logros especiales */}
      {(achievement.tier === 'gold' || achievement.tier === 'platinum' || achievement.tier === 'legendary') && (
        <div className="absolute inset-0 rounded-lg pointer-events-none">
          <div className={`absolute inset-0 rounded-lg ${tierEffects.border} border-2 animate-pulse`} />
          {achievement.tier === 'legendary' && (
            <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-ping" />
          )}
        </div>
      )}

      {/* Brillo de fondo para logros premium */}
      {(achievement.tier === 'platinum' || achievement.tier === 'legendary') && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white via-transparent to-transparent opacity-5 pointer-events-none" />
      )}
    </div>
  );
};

export default AchievementNotification;