// components/StatsDemo.jsx - Demo de estadísticas para testing
import React from 'react';
import { useStats } from '../hooks/useStats';
import { useAuth } from '../hooks/useAuth';

const StatsDemo = () => {
  const { 
    userStats, 
    insights, 
    isStatsAvailable, 
    recordGameFinished,
    getPerformanceStats,
    getProgressSummary,
    getTrucoInsights,
    shouldShowInsights,
    getTopInsight
  } = useStats();
  
  const { isAuthenticated, isAnonymous } = useAuth();
  
  const simulateWin = async () => {
    const gameData = {
      puntosNos: 30,
      puntosEllos: Math.floor(Math.random() * 25) + 5, // 5-29
      ganador: 'nos',
      jugador1: 'Tú',
      jugador2: 'Rival',
      puntosTotales: 30,
      fechaInicio: Date.now() - (Math.random() * 1800000 + 300000), // 5-35 min
      fechaFin: Date.now(),
      historial: [
        { accion: 'punto', equipo: 'nos', puntosNos: 15, puntosEllos: 10 },
        { accion: 'punto', equipo: 'ellos', puntosNos: 15, puntosEllos: 20 },
        { accion: 'punto', equipo: 'nos', puntosNos: 30, puntosEllos: 20 }
      ]
    };
    
    await recordGameFinished(gameData);
  };
  
  const simulateLoss = async () => {
    const gameData = {
      puntosNos: Math.floor(Math.random() * 25) + 5, // 5-29
      puntosEllos: 30,
      ganador: 'ellos',
      jugador1: 'Tú',
      jugador2: 'Rival',
      puntosTotales: 30,
      fechaInicio: Date.now() - (Math.random() * 1800000 + 300000),
      fechaFin: Date.now(),
      historial: []
    };
    
    await recordGameFinished(gameData);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#D4A574] border-opacity-30 max-w-md mx-auto mt-4">
        <h3 className="text-[#D4A574] font-bold mb-2">📊 Demo de Estadísticas</h3>
        <p className="text-[#F5DEB3] text-sm mb-2">
          Las estadísticas requieren estar autenticado.
        </p>
        <p className="text-[#F5DEB3] text-xs opacity-70">
          Modo actual: {isAnonymous ? 'Anónimo' : 'Desconocido'}
        </p>
      </div>
    );
  }
  
  const performanceStats = getPerformanceStats();
  const progressSummary = getProgressSummary();
  const trucoInsights = getTrucoInsights();
  const topInsight = getTopInsight();
  
  return (
    <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#D4A574] border-opacity-30 max-w-md mx-auto mt-4">
      <h3 className="text-[#D4A574] font-bold mb-4">📊 Motor de Estadísticas</h3>
      
      {/* Controles de demo */}
      <div className="space-x-2 mb-4">
        <button
          onClick={simulateWin}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Simular Victoria
        </button>
        <button
          onClick={simulateLoss}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Simular Derrota
        </button>
      </div>
      
      {/* Estadísticas básicas */}
      {isStatsAvailable && (
        <div className="space-y-3">
          <div className="bg-[#2a2a2a] p-3 rounded">
            <h4 className="text-[#D4A574] font-semibold mb-2">Estadísticas Básicas</h4>
            <div className="text-sm text-[#F5DEB3] space-y-1">
              <div>Partidos: {userStats.games_played}</div>
              <div>Victorias: {userStats.games_won}</div>
              <div>WR: {userStats.win_rate.toFixed(1)}%</div>
              <div>Racha: {userStats.current_streak}</div>
            </div>
          </div>
          
          {/* Progreso */}
          <div className="bg-[#2a2a2a] p-3 rounded">
            <h4 className="text-[#D4A574] font-semibold mb-2">Progreso</h4>
            <div className="text-sm text-[#F5DEB3] space-y-1">
              <div>Nivel: {progressSummary.level}</div>
              <div className="text-xs opacity-70">{progressSummary.nextMilestone}</div>
            </div>
          </div>
          
          {/* Insights del Truco */}
          {trucoInsights && (
            <div className="bg-[#2a2a2a] p-3 rounded">
              <h4 className="text-[#D4A574] font-semibold mb-2">Insights del Truco</h4>
              <div className="text-xs text-[#F5DEB3] space-y-1">
                <div>Dominador: {trucoInsights.isDominator ? '🔥 Sí' : '❌ No'}</div>
                <div>Máquina de dormir: {trucoInsights.isShutoutMaster ? '🛌 Sí' : '❌ No'}</div>
                <div>Clutch: {trucoInsights.isClutchPlayer ? '💎 Sí' : '❌ No'}</div>
                <div>Rey del comeback: {trucoInsights.isComebackKing ? '💪 Sí' : '❌ No'}</div>
              </div>
            </div>
          )}
          
          {/* Top Insight */}
          {shouldShowInsights() && topInsight && (
            <div className="bg-gradient-to-r from-[#D4A574] to-[#C59660] p-3 rounded text-[#0a0a0a]">
              <h4 className="font-bold mb-1">{topInsight.title}</h4>
              <p className="text-sm">{topInsight.message}</p>
            </div>
          )}
          
          {/* Métricas avanzadas */}
          {userStats.games_played > 5 && (
            <div className="bg-[#2a2a2a] p-3 rounded">
              <h4 className="text-[#D4A574] font-semibold mb-2">Métricas Avanzadas</h4>
              <div className="text-xs text-[#F5DEB3] space-y-1">
                <div>Promedio en derrotas: {userStats.avg_points_in_losses.toFixed(1)}</div>
                <div>Promedio rival: {userStats.avg_opponent_points.toFixed(1)}</div>
                <div>Comebacks: {userStats.comeback_games}</div>
                <div>Chokes: {userStats.choke_games}</div>
                <div>Pressure: {userStats.pressure_performance.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!isStatsAvailable && (
        <p className="text-[#F5DEB3] text-sm opacity-70">
          Jugá algunos partidos para ver estadísticas detalladas
        </p>
      )}
    </div>
  );
};

export default StatsDemo;