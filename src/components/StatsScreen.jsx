// components/StatsScreen.jsx - Pantalla de estadísticas según UX flow
import React, { useState, useEffect } from 'react';
import { useStats } from '../hooks/useStats';
import { useAuth } from '../hooks/useAuth';

const StatsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('TODO'); // TODO, MES, SEM, HOY
  const { user, isAuthenticated, isAnonymous } = useAuth();
  const {
    userStats,
    rivalries,
    insights,
    isStatsAvailable,
    isLoading,
    loadTemporalAggregations,
    getTrucoInsights,
    getProgressSummary,
    recordGameFinished
  } = useStats();
  
  // useEffect deshabilitado mientras la funcionalidad está en desarrollo
  useEffect(() => {
    if (selectedPeriod !== 'TODO' && loadTemporalAggregations && typeof loadTemporalAggregations === 'function') {
      // Solo llamar si la función existe (para desarrollo futuro)
      // loadTemporalAggregations(selectedPeriod.toLowerCase());
      console.log('📊 Funcionalidad de período en desarrollo:', selectedPeriod);
    }
  }, [selectedPeriod, loadTemporalAggregations]);
  
  const trucoInsights = getTrucoInsights();
  const progressSummary = getProgressSummary();
  
  // 🧪 SIMULADOR DE STATS PARA TESTING
  const simulateGame = async (winner) => {
    const mockGameData = {
      puntosNos: winner === 'nos' ? 30 : Math.floor(Math.random() * 25) + 15,
      puntosEllos: winner === 'ellos' ? 30 : Math.floor(Math.random() * 25) + 15,
      ganador: winner,
      jugador1: 'Simulador',
      jugador2: 'Test',
      puntosTotales: 30,
      fechaInicio: Date.now() - (Math.random() * 1800000), // Entre 0-30 min atrás
      fechaFin: Date.now(),
      historial: [
        { 
          equipo: winner, 
          accion: '+', 
          puntoAnterior: 29, 
          puntoNuevo: 30, 
          timestamp: Date.now() 
        }
      ]
    };
    
    try {
      console.log('🧪 Simulando juego:', mockGameData);
      await recordGameFinished(mockGameData);
      console.log('🧪 Juego simulado registrado exitosamente!');
    } catch (error) {
      console.error('🧪 Error simulando juego:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <p className="text-[#D4A574]">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }
  
  if (!isStatsAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-[#D4A574] mb-4">
            {isAuthenticated ? `¡Hola ${user.name || user.email?.split('@')[0]}!` : '¡A jugar!'}
          </h2>
          <p className="text-[#F5DEB3] mb-6">
            {isAuthenticated 
              ? 'Jugá algunos partidos para ver tus estadísticas personales'
              : 'Jugá algunos partidos para ver estadísticas detalladas'
            }
          </p>
          {isAuthenticated && (
            <div className="bg-[#2a2a2a] rounded-lg p-3 border border-[#D4A574] border-opacity-20 mb-6">
              <div className="text-sm text-[#F5DEB3] opacity-70">
                💾 Tus partidas se guardarán en la nube para acceder desde cualquier dispositivo
              </div>
            </div>
          )}
          
          {/* 🧪 SIMULADOR PARA TESTING */}
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20 mb-4">
            <h3 className="text-sm font-bold text-[#D4A574] mb-3">
              🧪 SIMULADOR DE PARTIDOS (Testing)
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => simulateGame('nos')}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
              >
                ✅ Simular Victoria
              </button>
              <button
                onClick={() => simulateGame('ellos')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
              >
                ❌ Simular Derrota
              </button>
            </div>
            <p className="text-xs text-[#F5DEB3] opacity-70 mt-2">
              Presiona para agregar partidos de prueba
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-full bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        {isAuthenticated ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#D4A574]">
              MIS ESTADÍSTICAS
            </h1>
            <p className="text-[#F5DEB3] text-sm opacity-70 mt-1">
              {user.name || user.email?.split('@')[0]}
            </p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-[#D4A574] text-center">
            ESTADÍSTICAS LOCALES
          </h1>
        )}
      </div>
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Filtros de período */}
        <div className="bg-[#2a2a2a] rounded-lg p-1 flex">
          {['TODO', 'MES', 'SEM', 'HOY'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-[#D4A574] text-[#0a0a0a]'
                  : 'text-[#F5DEB3] hover:bg-[#F5DEB3] hover:bg-opacity-10'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        {/* Mostrar contenido según período seleccionado */}
        {selectedPeriod !== 'TODO' ? (
          // Contenido "En desarrollo" para períodos específicos
          <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#D4A574] border-opacity-20 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-[#D4A574] mb-3">
              Estadísticas por {selectedPeriod === 'MES' ? 'Mes' : selectedPeriod === 'SEM' ? 'Semana' : 'Día'}
            </h2>
            <p className="text-[#F5DEB3] opacity-80 mb-4">
              Esta función está en desarrollo y estará disponible próximamente
            </p>
            <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
              <div className="text-sm text-[#F5DEB3] opacity-70 mb-2">
                📊 Funcionalidades planeadas:
              </div>
              <ul className="text-sm text-[#F5DEB3] opacity-60 space-y-1">
                <li>• Estadísticas filtradas por período</li>
                <li>• Gráficos de progreso temporal</li>
                <li>• Comparativas con períodos anteriores</li>
                <li>• Insights específicos del período</li>
              </ul>
            </div>
            <button
              onClick={() => setSelectedPeriod('TODO')}
              className="bg-[#D4A574] text-[#0a0a0a] px-6 py-2 rounded-lg font-medium hover:bg-[#E6C589] transition-colors"
            >
              Volver a estadísticas generales
            </button>
          </div>
        ) : (
          // Contenido normal para "TODO"
          <>
            {/* Resumen General */}
            <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h2 className="text-lg font-bold text-[#D4A574] mb-3 flex items-center">
            📊 RESUMEN GENERAL
          </h2>
          <div className="space-y-2 text-[#F5DEB3]">
            <div className="flex justify-between">
              <span>Partidos:</span>
              <span className="font-bold">{userStats.games_played}</span>
            </div>
            <div className="flex justify-between">
              <span>Victorias:</span>
              <span className="font-bold text-green-400">
                {userStats.games_won} ({userStats.win_rate.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Racha actual:</span>
              <span className="font-bold">
                {userStats.current_streak > 0 ? '🔥' : '❄️'} {Math.abs(userStats.current_streak)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mejor racha:</span>
              <span className="font-bold text-[#D4A574]">{userStats.longest_win_streak}</span>
            </div>
          </div>
        </div>
        
        {/* Estadísticas Clave */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h2 className="text-lg font-bold text-[#D4A574] mb-3 flex items-center">
            🎯 ESTADÍSTICAS CLAVE
          </h2>
          <div className="space-y-3">
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <div className="text-[#F5DEB3] text-sm mb-1">Promedio en derrotas: 
                <span className="text-[#D4A574] font-bold ml-1">
                  {userStats.avg_points_in_losses.toFixed(0)}
                </span>
              </div>
              <div className="text-xs text-[#F5DEB3] opacity-70">
                {userStats.avg_points_in_losses > 20 ? '(Llegás lejos)' : '(Mejorá tu cierre)'}
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <div className="text-[#F5DEB3] text-sm mb-1">Promedio rival: 
                <span className="text-[#D4A574] font-bold ml-1">
                  {userStats.avg_opponent_points.toFixed(0)}
                </span>
              </div>
              <div className="text-xs text-[#F5DEB3] opacity-70">
                {userStats.avg_opponent_points < 20 ? '(Los dominás)' : '(Te la complican)'}
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <div className="flex justify-between text-[#F5DEB3] text-sm">
                <span>Durmió afuera:</span>
                <span className="text-[#D4A574] font-bold">{userStats.shutouts_given}x</span>
              </div>
              <div className="flex justify-between text-[#F5DEB3] text-sm">
                <span>Te durmieron:</span>
                <span className="text-red-400 font-bold">{userStats.shutouts_received}x</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progreso Visual */}
        {userStats.games_played >= 10 && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
            <h2 className="text-lg font-bold text-[#D4A574] mb-3 flex items-center">
              📈 TU PROGRESO
            </h2>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <div className="text-[#F5DEB3] text-sm mb-2">Win Rate últimos partidos</div>
              <div className="h-16 bg-[#0a0a0a] rounded relative overflow-hidden">
                {/* Gráfico simplificado */}
                <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center">
                  <div className="text-[#D4A574] text-xs">
                    {userStats.win_rate.toFixed(1)}%
                  </div>
                </div>
                {/* Barra de progreso */}
                <div 
                  className="absolute bottom-0 left-0 bg-gradient-to-t from-[#D4A574] to-[#C59660] opacity-30 transition-all duration-1000"
                  style={{ width: '100%', height: `${Math.min(userStats.win_rate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Top Rivalidades */}
        {rivalries.length > 0 && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
            <h2 className="text-lg font-bold text-[#D4A574] mb-3 flex items-center">
              🏆 TOP RIVALIDADES
            </h2>
            <div className="space-y-2">
              {rivalries.slice(0, 3).map((rivalry, index) => (
                <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#F5DEB3] text-sm">
                      vs {rivalry.user2_name}:
                    </span>
                    <span className="text-[#D4A574] font-bold text-sm">
                      {rivalry.user1_wins}-{rivalry.user2_wins}
                    </span>
                  </div>
                  {rivalry.current_streak_length > 0 && (
                    <div className="text-xs text-[#F5DEB3] opacity-70 mt-1">
                      Racha: {rivalry.current_streak_holder === 'user1' ? 'Tuya' : rivalry.user2_name} x{rivalry.current_streak_length}
                    </div>
                  )}
                </div>
              ))}
              
              {rivalries.length > 3 && (
                <button className="w-full py-2 text-[#D4A574] text-sm hover:bg-[#D4A574] hover:bg-opacity-10 rounded-lg transition-all">
                  [VER TODAS]
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Insights Destacados */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-r from-[#D4A574] to-[#C59660] rounded-lg p-4">
            <h2 className="text-lg font-bold text-[#0a0a0a] mb-3 flex items-center">
              ⭐ DESTACADO
            </h2>
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-[#0a0a0a] mb-2 last:mb-0">
                <div className="font-bold text-sm">{insight.title}</div>
                <div className="text-sm opacity-90">{insight.message}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Nivel y Progreso */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h2 className="text-lg font-bold text-[#D4A574] mb-3 flex items-center">
            🏅 TU NIVEL
          </h2>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D4A574] mb-2">
              {progressSummary.level}
            </div>
            <div className="text-[#F5DEB3] text-sm mb-3">
              {progressSummary.nextMilestone}
            </div>
            {progressSummary.gamesPlayed >= 5 && (
              <div className="bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#D4A574] to-[#C59660] h-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min((progressSummary.gamesPlayed % 20) / 20 * 100, 100)}%` 
                  }}
                />
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsScreen;