// components/AchievementProgress.jsx - Componente para mostrar progreso de logros
import React from 'react';
import { useAchievements } from '../hooks/useAchievements';

const AchievementProgress = ({ achievementKey, showDetails = true, size = 'md' }) => {
  const {
    getAchievementByKey,
    getAchievementProgress,
    isAchievementUnlocked,
    getAchievementTierColor,
    formatProgress
  } = useAchievements();

  const achievement = getAchievementByKey(achievementKey);
  const progress = getAchievementProgress(achievementKey);
  const isUnlocked = isAchievementUnlocked(achievementKey);

  if (!achievement) {
    return null;
  }

  const tierColor = getAchievementTierColor(achievement.tier);

  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: 'h-1',
      text: 'text-xs',
      icon: 'text-sm',
      padding: 'p-2'
    },
    md: {
      container: 'h-2',
      text: 'text-sm',
      icon: 'text-base',
      padding: 'p-3'
    },
    lg: {
      container: 'h-3',
      text: 'text-base',
      icon: 'text-lg',
      padding: 'p-4'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`bg-[#2a2a2a] rounded-lg border border-[#D4A574] border-opacity-20 ${config.padding}`}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`${config.icon} ${isUnlocked ? 'filter-none' : 'grayscale opacity-50'}`}>
              {achievement.badge_icon}
            </span>
            <div>
              <h4 className={`font-medium text-[#F5DEB3] ${config.text} ${isUnlocked ? 'opacity-100' : 'opacity-75'}`}>
                {achievement.name}
              </h4>
              {size !== 'sm' && (
                <p className={`text-xs text-[#F5DEB3] ${isUnlocked ? 'opacity-80' : 'opacity-60'}`}>
                  {achievement.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-xs font-bold px-2 py-1 rounded uppercase"
              style={{
                backgroundColor: `${tierColor}20`,
                color: tierColor,
                border: `1px solid ${tierColor}40`
              }}
            >
              {achievement.tier}
            </div>
          </div>
        </div>
      )}

      {/* Barra de progreso */}
      <div className="space-y-1">
        {progress && !isUnlocked && (
          <div className="flex items-center justify-between">
            <span className={`${config.text} text-[#F5DEB3] opacity-70`}>
              Progreso
            </span>
            <span className={`${config.text} text-[#F5DEB3] opacity-70`}>
              {formatProgress(progress.current, progress.target)}
            </span>
          </div>
        )}
        
        <div className={`w-full bg-[#1a1a1a] rounded-full ${config.container} overflow-hidden`}>
          {isUnlocked ? (
            <div
              className={`${config.container} rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 to-green-500`}
              style={{ width: '100%' }}
            />
          ) : progress ? (
            <div
              className={`${config.container} rounded-full transition-all duration-500`}
              style={{
                width: `${progress.percentage}%`,
                background: `linear-gradient(90deg, ${tierColor}80, ${tierColor})`
              }}
            />
          ) : (
            <div className={`${config.container} rounded-full bg-[#3a3a3a]`} style={{ width: '0%' }} />
          )}
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between">
          {isUnlocked ? (
            <div className="flex items-center space-x-1">
              <span className="text-green-400 text-xs">✓</span>
              <span className="text-green-400 text-xs font-medium">Desbloqueado</span>
            </div>
          ) : progress ? (
            <span className={`${config.text} text-[#F5DEB3] opacity-60`}>
              {Math.round(progress.percentage)}% completado
            </span>
          ) : (
            <span className={`${config.text} text-[#F5DEB3] opacity-60`}>
              Sin progreso
            </span>
          )}
          
          {achievement.points_reward > 0 && (
            <span className={`${config.text} text-[#D4A574]`}>
              +{achievement.points_reward} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar múltiples progresos
export const AchievementProgressGrid = ({ achievementKeys, columns = 1, size = 'md' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3`}>
      {achievementKeys.map(key => (
        <AchievementProgress
          key={key}
          achievementKey={key}
          size={size}
          showDetails={true}
        />
      ))}
    </div>
  );
};

// Componente para mostrar progreso resumido por categoría
export const CategoryProgress = ({ categoryId }) => {
  const {
    categories,
    getAchievementsByCategory,
    getCategoryProgress,
    getCategoryColor
  } = useAchievements();

  const category = categories.find(c => c.id === categoryId);
  const categoryAchievements = getAchievementsByCategory(categoryId);
  const progress = getCategoryProgress(categoryId);
  const categoryColor = getCategoryColor(categoryId);

  if (!category) {
    return null;
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-[#D4A574] border-opacity-20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="font-bold text-[#F5DEB3]">{category.name}</h3>
            <p className="text-xs text-[#F5DEB3] opacity-70">{category.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#D4A574]">
            {Math.round(progress.percentage)}%
          </div>
          <div className="text-xs text-[#F5DEB3] opacity-70">
            {progress.unlocked} / {progress.total}
          </div>
        </div>
      </div>

      <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${progress.percentage}%`,
            backgroundColor: categoryColor
          }}
        />
      </div>

      <div className="text-xs text-[#F5DEB3] opacity-60">
        {progress.remaining > 0 ? (
          `${progress.remaining} logros por desbloquear`
        ) : (
          '¡Categoría completada!'
        )}
      </div>
    </div>
  );
};

// Componente para mostrar logros cercanos a completarse
export const NearCompletionAchievements = ({ threshold = 80, limit = 3 }) => {
  const { getNearCompletionAchievements } = useAchievements();
  
  const nearCompletion = getNearCompletionAchievements(threshold).slice(0, limit);

  if (nearCompletion.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-yellow-400 border-opacity-30 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-yellow-400 text-lg">⚡</span>
        <h3 className="font-bold text-yellow-400">Casi completados</h3>
      </div>
      
      <div className="space-y-2">
        {nearCompletion.map(achievement => (
          <AchievementProgress
            key={achievement.key}
            achievementKey={achievement.key}
            size="sm"
            showDetails={true}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementProgress;