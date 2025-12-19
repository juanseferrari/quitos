// components/AchievementsScreen.jsx - Pantalla principal de logros con tema cinematográfico
import React, { useState, useEffect } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import { useAchievementNotifications } from '../hooks/useAchievementNotifications';

const AchievementsScreen = () => {
  const {
    achievements,
    categories,
    stats,
    categoryStats,
    isLoading,
    error,
    searchAchievements,
    getAchievementsByCategory,
    isAchievementUnlocked,
    getAchievementProgress,
    getAchievementTierColor,
    getCategoryColor,
    formatProgress,
    getProgressBarWidth
  } = useAchievements();

  const {
    showNotifications,
    setShowNotifications,
    recentUnlocks,
    NotificationPanel
  } = useAchievementNotifications();

  // Estado local
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('category'); // category, name, progress, tier
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Filtrar y ordenar logros
  const getFilteredAchievements = () => {
    let filtered = achievements;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = searchAchievements(searchTerm);
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Filtrar por estado
    if (showUnlockedOnly) {
      filtered = filtered.filter(a => isAchievementUnlocked(a.key));
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          const progressA = getAchievementProgress(a.key)?.percentage || 0;
          const progressB = getAchievementProgress(b.key)?.percentage || 0;
          return progressB - progressA;
        case 'tier':
          const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, legendary: 5 };
          return (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0);
        default:
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  const filteredAchievements = getFilteredAchievements();

  if (isLoading) {
    return (
      <div className="min-h-full rey-premium-layout-mobile bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏆</div>
          <div className="text-[#D4A574] text-xl font-bold animate-pulse">
            Cargando logros...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full rey-premium-layout-mobile bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error al cargar logros</h2>
          <p className="text-[#F5DEB3] opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full rey-premium-layout-mobile">
      {/* Header con estadísticas */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#D4A574]" style={{ fontFamily: '"Tilt Warp", sans-serif' }}>
            🏆 LOGROS
          </h1>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative bg-[#D4A574] text-[#0a0a0a] px-3 py-2 rounded-lg hover:bg-[#E6C589] transition-colors"
          >
            <span className="text-sm font-medium">📋 Recientes</span>
            {recentUnlocks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {recentUnlocks.length}
              </span>
            )}
          </button>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#D4A574]">
              {stats.unlocked_achievements}
            </div>
            <div className="text-sm text-[#F5DEB3] opacity-80">Desbloqueados</div>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#D4A574]">
              {Math.round(stats.completion_percentage)}%
            </div>
            <div className="text-sm text-[#F5DEB3] opacity-80">Completado</div>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="bg-[#2a2a2a] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#F5DEB3]">Progreso Total</span>
            <span className="text-xs text-[#F5DEB3] opacity-70">
              {stats.unlocked_achievements} / {stats.total_achievements}
            </span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#D4A574] to-[#C59660] h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="bg-[#1a1a1a] border-b border-[#D4A574] border-opacity-20 px-4 py-4 space-y-4">
        {/* Búsqueda */}
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar logros..."
            className="w-full bg-[#2a2a2a] text-[#F5DEB3] px-3 py-2 rounded-lg border border-[#D4A574] border-opacity-30 focus:border-[#D4A574] focus:outline-none"
          />
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#D4A574] text-[#0a0a0a]'
                : 'bg-[#2a2a2a] text-[#F5DEB3] hover:bg-[#D4A574] hover:bg-opacity-20'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#D4A574] text-[#0a0a0a]'
                  : 'bg-[#2a2a2a] text-[#F5DEB3] hover:bg-[#D4A574] hover:bg-opacity-20'
              }`}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color_hex : undefined
              }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Controles adicionales */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showUnlockedOnly}
                onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                className="rounded border-[#D4A574]"
              />
              <span className="text-xs text-[#F5DEB3]">Solo desbloqueados</span>
            </label>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#2a2a2a] text-[#F5DEB3] px-2 py-1 rounded text-xs border border-[#D4A574] border-opacity-30"
          >
            <option value="category">Por categoría</option>
            <option value="name">Por nombre</option>
            <option value="progress">Por progreso</option>
            <option value="tier">Por rango</option>
          </select>
        </div>
      </div>

      {/* Lista de logros */}
      <div className="p-4 space-y-3 max-w-md mx-auto">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-[#F5DEB3] opacity-70">
              {searchTerm ? 'No se encontraron logros' : 'No hay logros disponibles'}
            </div>
          </div>
        ) : (
          filteredAchievements.map((achievement) => {
            const isUnlocked = isAchievementUnlocked(achievement.key);
            const progress = getAchievementProgress(achievement.key);
            const tierColor = getAchievementTierColor(achievement.tier);

            return (
              <div
                key={achievement.id}
                className={`bg-[#2a2a2a] rounded-lg p-4 border transition-all duration-300 ${
                  isUnlocked
                    ? 'border-opacity-50 shadow-lg'
                    : 'border-opacity-20 opacity-75'
                }`}
                style={{
                  borderColor: tierColor,
                  boxShadow: isUnlocked ? `0 4px 20px ${tierColor}40` : undefined
                }}
              >
                {/* Header del logro */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={`text-3xl ${isUnlocked ? 'filter-none' : 'grayscale opacity-50'}`}>
                      {achievement.badge_icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${isUnlocked ? 'text-[#F5DEB3]' : 'text-[#F5DEB3] opacity-60'}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${isUnlocked ? 'text-[#F5DEB3] opacity-80' : 'text-[#F5DEB3] opacity-50'}`}>
                        {achievement.description}
                      </p>
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
                    {achievement.points_reward > 0 && (
                      <div className="text-xs text-[#D4A574] mt-1">
                        +{achievement.points_reward} pts
                      </div>
                    )}
                  </div>
                </div>

                {/* Progreso */}
                {progress && !isUnlocked && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#F5DEB3] opacity-70">Progreso</span>
                      <span className="text-xs text-[#F5DEB3] opacity-70">
                        {formatProgress(progress.current, progress.target)}
                      </span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.percentage}%`,
                          background: `linear-gradient(90deg, ${tierColor}80, ${tierColor})`
                        }}
                      />
                    </div>
                    <div className="text-xs text-[#F5DEB3] opacity-60 mt-1">
                      {Math.round(progress.percentage)}% completado
                    </div>
                  </div>
                )}

                {/* Estado desbloqueado */}
                {isUnlocked && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-sm">✓</span>
                      <span className="text-green-400 text-sm font-medium">Desbloqueado</span>
                    </div>
                    {achievement.title_unlock && (
                      <div className="text-xs text-[#D4A574]">
                        Título: "{achievement.title_unlock}"
                      </div>
                    )}
                  </div>
                )}

                {/* Categoría */}
                <div className="mt-3 pt-3 border-t border-[#D4A574] border-opacity-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {categories.find(c => c.id === achievement.category) && (
                        <>
                          <span className="text-sm">
                            {categories.find(c => c.id === achievement.category).icon}
                          </span>
                          <span className="text-xs text-[#F5DEB3] opacity-70">
                            {categories.find(c => c.id === achievement.category).name}
                          </span>
                        </>
                      )}
                    </div>
                    {achievement.rarity && (
                      <div className="text-xs text-[#F5DEB3] opacity-60">
                        {achievement.rarity}% de usuarios
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel de notificaciones */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default AchievementsScreen;