// src/components/PantallaInicio.jsx - REDESIGN COMPLETO: Mobile-first functional design
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ScreenContainer from './ScreenContainer';
import TeamSelector from './TeamSelector';
import { FEATURE_FLAGS } from '../config/featureFlags';

const PantallaInicio = ({ onIniciarPartida, onContinuarPartida, haySavedGame, onShowAuth, showGameSetupDirectly = false }) => {
  const { isAuthenticated } = useAuth();
  const [showGameSetup, setShowGameSetup] = useState(showGameSetupDirectly);
  const [configuracion, setConfiguracion] = useState({
    jugador1: 'Nosotros',
    jugador2: 'Ellos',
    puntosTotales: 30
  });

  // Team selection state (Equipos2)
  const [teamNosotros, setTeamNosotros] = useState([]);
  const [teamEllos, setTeamEllos] = useState([]);

  const iniciarPartida = () => {
    // Include team data if using team selection
    const configData = {
      ...configuracion,
      ...(FEATURE_FLAGS.USE_TEAM_SELECTION && {
        teamNosotros,
        teamEllos,
        useTeamSelection: true,
      }),
    };
    onIniciarPartida(configData);
  };

  const renderMainMenu = () => (
    <ScreenContainer className="rey-premium-layout-mobile">
      {/* Header Simple */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        <div className="text-center">
          <div className="text-3xl mb-2">👑</div>
          <h1 className="text-xl font-bold text-[#D4A574]">
            REY DEL TRUCO
          </h1>
          <p className="text-[#F5DEB3] text-sm mt-1">
            Anotador inteligente
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Continue Game Card (si hay partida guardada) */}
        {haySavedGame && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-green-500 border-opacity-40">
            <h2 className="text-md font-bold text-green-400 mb-2 text-center">
              🎮 PARTIDA EN PROGRESO
            </h2>
            <p className="text-[#F5DEB3] text-sm text-center mb-3">
              Tenes una partida guardada
            </p>
            <button
              onClick={onContinuarPartida}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              CONTINUAR PARTIDO
            </button>
          </div>
        )}

        {/* Main Actions Card */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h2 className="text-md font-bold text-[#D4A574] mb-3 text-center">
            🎯 ACCIONES PRINCIPALES
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setShowGameSetup(true)}
              className="w-full py-4 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🎮 ANOTADOR
            </button>

            <p className="text-[#F5DEB3] text-xs text-center opacity-70">
              Empezar una nueva partida de truco
            </p>
          </div>
        </div>

        {/* Auth Promotion (solo si no esta autenticado) */}
        {!isAuthenticated && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="text-md font-bold text-[#D4A574] mb-2">
              Queres ser el Rey?
            </h3>
            <p className="text-[#F5DEB3] text-sm mb-3 leading-relaxed">
              Crea tu cuenta para estadisticas, rankings y competencia.
            </p>
            <button
              onClick={onShowAuth}
              className="py-2 px-4 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              👑 CREAR CUENTA / INICIAR SESION
            </button>
          </div>
        )}

        {/* Quick Stats (si esta autenticado) */}
        {isAuthenticated && (
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-md font-bold text-[#D4A574] mb-2">
              Bienvenido de vuelta!
            </h3>
            <p className="text-[#F5DEB3] text-sm">
              Listo para dominar el truco
            </p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );

  const renderGameSetup = () => (
    <ScreenContainer className="rey-premium-layout-mobile">
      {/* Header Simple */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        <h1 className="text-lg font-bold text-[#D4A574] text-center">
          CONFIGURAR PARTIDO
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Team Selection (Equipos2) or Team Names (Equipos1) */}
        {FEATURE_FLAGS.USE_TEAM_SELECTION ? (
          <TeamSelector
            teamNosotros={teamNosotros}
            teamEllos={teamEllos}
            onTeamNosotrosChange={setTeamNosotros}
            onTeamEllosChange={setTeamEllos}
            maxPerTeam={3}
          />
        ) : (
          /* Equipos1 - Classic team name inputs */
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
            <h2 className="text-md font-bold text-[#D4A574] mb-3 text-center">
              👥 EQUIPOS
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[#F5DEB3] text-sm mb-1">Equipo 1:</label>
                <input
                  type="text"
                  value={configuracion.jugador1}
                  onChange={(e) => setConfiguracion({...configuracion, jugador1: e.target.value})}
                  className="w-full p-2 bg-[#1a1a1a] border border-[#D4A574] border-opacity-30 rounded text-[#F5DEB3] focus:border-[#D4A574] focus:outline-none"
                  maxLength={15}
                  placeholder="Nosotros"
                />
              </div>

              <div>
                <label className="block text-[#F5DEB3] text-sm mb-1">Equipo 2:</label>
                <input
                  type="text"
                  value={configuracion.jugador2}
                  onChange={(e) => setConfiguracion({...configuracion, jugador2: e.target.value})}
                  className="w-full p-2 bg-[#1a1a1a] border border-[#D4A574] border-opacity-30 rounded text-[#F5DEB3] focus:border-[#D4A574] focus:outline-none"
                  maxLength={15}
                  placeholder="Ellos"
                />
              </div>
            </div>
          </div>
        )}

        {/* Points Selection */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h2 className="text-md font-bold text-[#D4A574] mb-3 text-center">
            🎯 PUNTOS
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {[16, 24, 30].map((puntos) => (
              <button
                key={puntos}
                onClick={() => setConfiguracion({...configuracion, puntosTotales: puntos})}
                className={`py-2 px-3 rounded font-bold transition-all duration-200 ${
                  configuracion.puntosTotales === puntos
                    ? 'bg-[#D4A574] text-[#0a0a0a]'
                    : 'bg-[#1a1a1a] text-[#F5DEB3] border border-[#D4A574] border-opacity-30 hover:border-opacity-50'
                }`}
              >
                {puntos}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={iniciarPartida}
            className="w-full py-3 bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            🚀 EMPEZAR PARTIDO
          </button>

          <button
            onClick={() => setShowGameSetup(false)}
            className="w-full py-2 bg-[#1a1a1a] border border-[#D4A574] border-opacity-30 text-[#F5DEB3] font-bold rounded-lg hover:border-opacity-50 transition-all duration-300"
          >
            ← VOLVER
          </button>
        </div>
      </div>
    </ScreenContainer>
  );

  return showGameSetup ? renderGameSetup() : renderMainMenu();
};

export default PantallaInicio;
