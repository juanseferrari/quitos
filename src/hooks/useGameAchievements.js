// src/hooks/useGameAchievements.js
// Hook para integrar verificación de logros con eventos del juego
// Evita dependencias circulares entre useGame y useAchievements

import { useEffect, useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useAuth } from './useAuth';
import { useAchievements } from './useAchievements';

export const useGameAchievements = () => {
  const { state } = useGameContext();
  const { user, isAuthenticated } = useAuth();
  const { verifyAchievements } = useAchievements();
  
  const game = state.game;
  const meta = state.meta;

  // Verificar logros cuando el juego termina
  useEffect(() => {
    const { hayGanador, ganador, puntosNos, puntosEllos } = game;
    
    if (hayGanador && ganador && isAuthenticated && user?.id) {
      console.log('🏆 Verificando logros de victoria...', {
        ganador,
        puntos: `${puntosNos}-${puntosEllos}`
      });
      
      const victoryGameData = {
        user_id: user.id,
        games_won: ganador === 'nos' ? 1 : 0,
        games_lost: ganador === 'ellos' ? 1 : 0,
        final_score_nos: puntosNos,
        final_score_ellos: puntosEllos,
        total_points: game.puntosTotales,
        game_duration: Date.now() - game.fechaInicio,
        action: 'game_finished',
        won: ganador === 'nos',
        is_shutout: ganador === 'nos' && puntosEllos === 0,
        is_perfect: ganador === 'nos' && puntosEllos === 0 && puntosNos === game.puntosTotales,
        game_timestamp: new Date().toISOString()
      };
      
      verifyAchievements(victoryGameData);
    }
  }, [game.hayGanador, game.ganador, isAuthenticated, user?.id, verifyAchievements, game]);

  // Verificar logros durante el juego
  const verifyPointScored = useCallback((equipo) => {
    if (!isAuthenticated || !user?.id) return;
    
    const newPuntosNos = equipo === 'nos' ? game.puntosNos + 1 : game.puntosNos;
    const newPuntosEllos = equipo === 'ellos' ? game.puntosEllos + 1 : game.puntosEllos;
    
    const gameData = {
      user_id: user.id,
      current_points_nos: newPuntosNos,
      current_points_ellos: newPuntosEllos,
      game_in_progress: true,
      action: 'point_scored',
      scoring_team: equipo,
      total_points_game: game.puntosTotales,
      game_timestamp: new Date().toISOString()
    };
    
    verifyAchievements(gameData);
  }, [isAuthenticated, user?.id, game, verifyAchievements]);

  // Verificar logros especiales
  const verifySpecialConditions = useCallback(() => {
    if (!isAuthenticated || !user?.id) return;
    
    const now = new Date();
    const hour = now.getHours();
    
    const specialData = {
      user_id: user.id,
      action: 'special_check',
      time_of_day: hour,
      is_night_owl: hour >= 2 && hour <= 5,
      is_early_bird: hour >= 5 && hour <= 7,
      day_of_week: now.getDay(),
      game_timestamp: now.toISOString()
    };
    
    verifyAchievements(specialData);
  }, [isAuthenticated, user?.id, verifyAchievements]);

  return {
    verifyPointScored,
    verifySpecialConditions
  };
};