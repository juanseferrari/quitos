// src/components/AnotadorTruco.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useStats } from '../hooks/useStats';
import { useGamePersistence } from '../hooks/useGamePersistence';
import { useGameAchievements } from '../hooks/useGameAchievements';
import useSwipeBack from '../hooks/useSwipeBack';
import ScoreDisplay from './ScoreDisplay';
import PantallaInicio from './PantallaInicio';
import ScreenContainer from './ScreenContainer';
import matchService from '../services/matchService';
import { FEATURE_FLAGS } from '../config/featureFlags';

const AnotadorTruco = ({ onShowAuth }) => {
  // Local state for match notes input
  const [notesInput, setNotesInput] = useState('');

  // Usar el nuevo hook centralizado
  const {
    // Estado del juego
    puntosNos,
    puntosEllos,
    ganador,
    jugador1,
    jugador2,
    puntosTotales,
    historial,

    // Team data (Equipos2)
    teamNosotros,
    teamEllos,
    matchId,

    // Estado de UI
    pantallaActual,
    mostrarModalFalta,
    mostrarModalVictoria,
    mostrarModalReiniciar,

    // Estados derivados
    hayGanador,
    partidaEnProgreso,
    nosAlVerde,
    ellosAlVerde,

    // Acciones del juego
    sumarPunto,
    restarPunto,
    faltaEnvido,
    nuevoPartido,
    restaurarPartida,
    limpiarGanador,

    // Acciones de configuración
    setJugador1,
    setJugador2,

    // Acciones de UI
    setPantallaActual,
    setMostrarModalFalta,
    setMostrarModalReiniciar,

    // Team/Match actions
    setMatchNotes,

    // Funciones calculadas
    calcularPuntosFalta,
    ganaPartido,

    // Utilidades
    utils,

    // Datos locales y metadata
    meta
  } = useGame();
  
  const { recordGameFinished } = useStats();
  
  // Hook de persistencia
  const { hasSavedGame } = useGamePersistence();
  
  // Hook de achievements
  const { verifyPointScored, verifySpecialConditions } = useGameAchievements();

  // Reset notes input when starting a new game
  useEffect(() => {
    if (!hayGanador) {
      setNotesInput('');
    }
  }, [hayGanador]);

  // Check if we have team data (Equipos2 mode)
  const hasTeamData = FEATURE_FLAGS.USE_TEAM_SELECTION &&
    (teamNosotros.length > 0 || teamEllos.length > 0);

  // Function to save match to Supabase (for Equipos2 mode)
  const saveMatchToSupabase = async (notes = '') => {
    if (!matchId || !hasTeamData) {
      console.log('⏭️ Skipping Supabase save - no matchId or team data');
      return;
    }

    try {
      const winner = ganador === 'nos' ? 'nosotros' : 'ellos';
      const startTime = meta.lastUpdated ? new Date(meta.lastUpdated - (historial.length * 60000)) : new Date();
      const durationMinutes = Math.round((Date.now() - startTime.getTime()) / 60000);

      await matchService.finishMatch(matchId, {
        score_nosotros: puntosNos,
        score_ellos: puntosEllos,
        winner,
        notes: notes || null,
        game_data: {
          historial,
          puntosTotales
        },
        duration_minutes: durationMinutes
      });

      console.log('✅ Match saved to Supabase');
    } catch (error) {
      console.error('❌ Error saving match to Supabase:', error);
    }
  };

  // Función para registrar estadísticas en background (sin bloquear UI)
  const recordStatsInBackground = () => {
    console.log('🔍 NOTA: recordStatsInBackground DESHABILITADO - useGame maneja automáticamente las estadísticas');
    // NOTA: El registro de estadísticas se maneja automáticamente en useGame
    // No necesitamos llamar recordGameFinished aquí para evitar duplicados
  };
  
  // Función para iniciar partida desde pantalla de inicio
  const iniciarPartida = (configuracion) => {
    nuevoPartido(configuracion);
    setPantallaActual('juego');
    // Verificar condiciones especiales al iniciar partida
    verifySpecialConditions();
  };
  
  // Función para continuar partida guardada
  const continuarPartida = () => {
    setPantallaActual('juego');
  };

  const renderPantallaJuego = () => (
    <ScreenContainer className="rey-premium-layout-mobile" noScroll={true}>
      {/* Contenedor principal con altura 100% - distribuido por porcentajes */}
      <div className="h-full w-full flex flex-col rey-premium-container-mobile-optimized">

        {/* FILA 1: Headers con nombres y puntaje numérico (~12%) */}
        <div className="flex w-full" style={{ height: '12%', minHeight: '60px' }}>
          {/* Header Jugador 1 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <input
              type="text"
              value={jugador1}
              onChange={(e) => setJugador1(e.target.value)}
              className={`rey-premium-player-input-compact ${
                nosAlVerde ? 'rey-premium-input-winner' : ''
              }`}
              placeholder="Nosotros"
              maxLength={15}
            />
            <span className={`rey-premium-score-display-compact ${
              nosAlVerde ? 'rey-premium-score-winner' : ''
            }`}>
              {puntosNos}
            </span>
          </div>

          {/* Separador central */}
          <div className="w-4"></div>

          {/* Header Jugador 2 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <input
              type="text"
              value={jugador2}
              onChange={(e) => setJugador2(e.target.value)}
              className={`rey-premium-player-input-compact ${
                ellosAlVerde ? 'rey-premium-input-winner' : ''
              }`}
              placeholder="Ellos"
              maxLength={15}
            />
            <span className={`rey-premium-score-display-compact ${
              ellosAlVerde ? 'rey-premium-score-winner' : ''
            }`}>
              {puntosEllos}
            </span>
          </div>
        </div>

        {/* FILA 2: Área de rayitas - zona principal táctil (~70%) */}
        <div className="flex w-full" style={{ height: '65%' }}>
          {/* Rayitas Jugador 1 */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden cursor-pointer select-none rey-premium-score-area-optimized"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!hayGanador) {
                sumarPunto('nos');
                verifyPointScored('nos');
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!hayGanador) {
                sumarPunto('nos');
                verifyPointScored('nos');
              }
            }}
            style={{ touchAction: 'manipulation' }}
          >
            <ScoreDisplay puntos={puntosNos} puntosTotales={puntosTotales} />
          </div>

          {/* Separador central */}
          <div className="w-4"></div>

          {/* Rayitas Jugador 2 */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden cursor-pointer select-none rey-premium-score-area-optimized"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!hayGanador) {
                sumarPunto('ellos');
                verifyPointScored('ellos');
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!hayGanador) {
                sumarPunto('ellos');
                verifyPointScored('ellos');
              }
            }}
            style={{ touchAction: 'manipulation' }}
          >
            <ScoreDisplay puntos={puntosEllos} puntosTotales={puntosTotales} />
          </div>
        </div>

        {/* FILA 3: Botones de corrección (-) (~10%) */}
        <div className="flex w-full items-center justify-around" style={{ height: '8%', minHeight: '44px' }}>
          <button
            onClick={() => restarPunto('nos')}
            disabled={hayGanador}
            className={`rey-premium-score-button-mobile rey-premium-score-button-minus ${hayGanador ? 'disabled' : ''}`}
          >
            −
          </button>

          <div className="w-4"></div>

          <button
            onClick={() => restarPunto('ellos')}
            disabled={hayGanador}
            className={`rey-premium-score-button-mobile rey-premium-score-button-minus ${hayGanador ? 'disabled' : ''}`}
          >
            −
          </button>
        </div>

        {/* FILA 4: Controles del juego (Falta Envido, Reiniciar, Historial) (~10%) */}
        <div className="flex w-full items-center justify-center rey-premium-controls-area-compact px-2" style={{ height: '10%', minHeight: '50px' }}>
          <div className="flex justify-center gap-2 w-full max-w-lg">
            <button
              onClick={() => setMostrarModalFalta(true)}
              disabled={hayGanador}
              className="rey-premium-action-button-compact rey-premium-action-button-danger flex-1 py-3 text-sm font-bold"
            >
              FALTA ENVIDO
            </button>

            <button
              onClick={() => {
                if (partidaEnProgreso && !hayGanador) {
                  setMostrarModalReiniciar(true);
                } else {
                  setPantallaActual('inicio');
                }
              }}
              className="rey-premium-action-button-compact rey-premium-action-button-primary flex-1 py-3 text-sm font-bold"
            >
              {partidaEnProgreso && !hayGanador ? 'REINICIAR' : 'MENÚ'}
            </button>

            {historial.length > 0 && (
              <button
                onClick={() => setPantallaActual('historial')}
                className="rey-premium-action-button-compact flex-1 py-3 text-sm font-bold"
              >
                HISTORIAL
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de victoria - PREMIUM */}
      {hayGanador && (
        <div className="rey-premium-modal-backdrop">
          <div className="rey-premium-modal-container">
            {/* Botón de cerrar */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 CERRAR MODAL - Deshaciendo último punto');
                restarPunto(ganador, true); // allowWithWinner = true
                limpiarGanador();
              }}
              className="rey-premium-modal-close"
              style={{
                zIndex: 1000,
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              ✕
            </button>

            <div className="rey-premium-modal-icon">🏆</div>

            <h2 className="rey-premium-modal-title">
              ¡Ganó {utils.getNombreJugador(ganador)}!
            </h2>

            <p className="rey-premium-modal-text">
              {puntosTotales} puntos, ¡qué partidazo che!
            </p>

            {/* Notes input - only show in Equipos2 mode with team data */}
            {hasTeamData && (
              <div className="w-full px-4 mb-4">
                <textarea
                  placeholder="Notas de la partida (opcional)"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#D4A574] border-opacity-50 rounded-lg text-[#F5DEB3] placeholder-[#F5DEB3] placeholder-opacity-50 text-sm resize-none focus:outline-none focus:border-opacity-100"
                  rows={2}
                  maxLength={500}
                />
              </div>
            )}

            <div className="rey-premium-modal-buttons">
              <button
                onClick={async () => {
                  // 🚀 OPTIMISTIC UI: Responder inmediatamente
                  // El efecto de useGame ya maneja las estadísticas automáticamente
                  console.log('🚀 OTRA VUELTA - Respuesta inmediata');
                  recordStatsInBackground();

                  // Save match notes if in Equipos2 mode
                  if (hasTeamData) {
                    setMatchNotes(notesInput);
                    await saveMatchToSupabase(notesInput);
                  }

                  // Pequeño delay para permitir que se procesen las stats
                  setTimeout(() => {
                    nuevoPartido();
                    setPantallaActual('juego');
                  }, 50);
                }}
                className="rey-premium-modal-button rey-premium-modal-button-primary"
              >
                OTRA VUELTA
              </button>
              <button
                onClick={async () => {
                  // 🚀 OPTIMISTIC UI: Responder inmediatamente
                  console.log('🚀 FINALIZAR - Respuesta inmediata');
                  recordStatsInBackground();

                  // Save match notes if in Equipos2 mode
                  if (hasTeamData) {
                    setMatchNotes(notesInput);
                    await saveMatchToSupabase(notesInput);
                  }

                  // Pequeño delay para permitir que se procesen las stats
                  setTimeout(() => {
                    // Reiniciar para nueva partida, no ir a menú
                    nuevoPartido();
                    setPantallaActual('inicio');
                  }, 50);
                }}
                className="rey-premium-modal-button rey-premium-modal-button-secondary"
              >
                FINALIZAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Falta Envido - PREMIUM */}
      {mostrarModalFalta && (
        <div className="rey-premium-modal-backdrop">
          <div className="rey-premium-modal-container">
            <div className="rey-premium-modal-icon">🃏</div>

            <h2 className="rey-premium-modal-title">
              ¿Quién ganó la falta?
            </h2>

            <div className="rey-premium-modal-buttons">
              <button
                onClick={() => {
                  faltaEnvido('nos');
                  setMostrarModalFalta(false);
                }}
                className="rey-premium-modal-button rey-premium-modal-button-primary"
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-1">{jugador1}</span>
                  <span className="text-sm opacity-80">
                    {ganaPartido('nos') ? '¡PARTIDO!' : `+${calcularPuntosFalta('nos')} puntos`}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  faltaEnvido('ellos');
                  setMostrarModalFalta(false);
                }}
                className="rey-premium-modal-button rey-premium-modal-button-primary"
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl mb-1">{jugador2}</span>
                  <span className="text-sm opacity-80">
                    {ganaPartido('ellos') ? '¡PARTIDO!' : `+${calcularPuntosFalta('ellos')} puntos`}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setMostrarModalFalta(false)}
                className="rey-premium-modal-button rey-premium-modal-button-secondary"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reiniciar */}
      {mostrarModalReiniciar && (
        <div className="rey-premium-modal-backdrop">
          <div className="rey-premium-modal-container">
            <div className="rey-premium-modal-icon">🔄</div>

            <h2 className="rey-premium-modal-title">
              ¿Reiniciar partido?
            </h2>

            <p className="rey-premium-modal-text">
              Se perderá el progreso actual
            </p>

            <div className="rey-premium-modal-buttons">
              <button
                onClick={() => {
                  setMostrarModalReiniciar(false);
                  nuevoPartido();
                  setPantallaActual('inicio');
                }}
                className="rey-premium-modal-button rey-premium-modal-button-primary"
              >
                REINICIAR
              </button>

              <button
                onClick={() => setMostrarModalReiniciar(false)}
                className="rey-premium-modal-button rey-premium-modal-button-secondary"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

    </ScreenContainer>
  );

  // Hook para swipe-back gesture (iOS native behavior) - solo activo en historial
  useSwipeBack(() => setPantallaActual('juego'), pantallaActual === 'historial');

  const renderPantallaHistorial = () => {
    
    return (
    <div className="rey-premium-layout">
      
      {/* Header Rey del Truco */}
      <div className="rey-premium-history-header">
        <button
          onClick={() => setPantallaActual('juego')}
          className="rey-premium-back-button"
        >
          <span>←</span>
          <span>VOLVER</span>
        </button>
        
        <h1 className="rey-premium-history-title">Historial</h1>
        <p className="rey-premium-history-subtitle">Movimientos del partido</p>
      </div>

      {/* Contenido del historial */}
      <div className="flex-1">
        {historial.length === 0 ? (
          <div className="rey-premium-history-container">
            <div className="rey-premium-empty-state">
              <div className="rey-premium-empty-icon">📜</div>
              <p className="rey-premium-empty-text">
                No hay movimientos registrados aún
              </p>
            </div>
          </div>
        ) : (
          <div className="rey-premium-history-container">
            <div className="space-y-3">
              {historial.slice(0, 50).map((entrada, index) => (
                <div
                  key={entrada.id}
                  className="rey-premium-history-entry"
                >
                  <div className="rey-premium-entry-main">
                    {/* Sección de acción */}
                    <div className="rey-premium-entry-action">
                      {entrada.accion === 'Falta Envido' ? (
                        <>
                          <span className="rey-premium-entry-icon">🃏</span>
                          <span className="rey-premium-entry-type falta-envido">
                            Falta Envido
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="rey-premium-entry-icon">
                            {entrada.accion === '+' ? '⚡' : '↩️'}
                          </span>
                          <span className={`rey-premium-entry-type ${
                            entrada.accion === '+' ? 'punto-positivo' : 'punto-negativo'
                          }`}>
                            {entrada.accion === '+' ? '+1 punto' : '-1 punto'}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Detalles del jugador */}
                    <div className="rey-premium-entry-details">
                      <div className="rey-premium-entry-player">
                        {utils.getNombreJugador(entrada.equipo)}
                      </div>
                      <div className="rey-premium-entry-score">
                        {entrada.puntoAnterior} → {entrada.puntoNuevo} puntos
                      </div>
                    </div>
                    
                    {/* Meta información */}
                    <div className="rey-premium-entry-meta">
                      <div className="rey-premium-entry-time">
                        {entrada.hora.substring(0, 5)}
                      </div>
                      <div className="rey-premium-entry-number">
                        Mov #{historial.length - index}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  // Renderizar pantalla según estado
  // Si hay partida guardada y no hay ganador, ir directo al juego
  if (hasSavedGame() && partidaEnProgreso && !hayGanador && pantallaActual === 'inicio') {
    setPantallaActual('juego');
  }
  
  // Si no hay partida en progreso y estamos en 'inicio', mostrar configuración
  if (pantallaActual === 'inicio') {
    return (
      <PantallaInicio 
        key={`inicio-${pantallaActual}`} // Force re-mount cuando se navega a inicio
        onIniciarPartida={iniciarPartida}
        onContinuarPartida={continuarPartida}
        haySavedGame={hasSavedGame() && partidaEnProgreso && !hayGanador}
        onShowAuth={onShowAuth}
        showGameSetupDirectly={true} // Nueva prop para mostrar setup directamente
      />
    );
  }
  
  return pantallaActual === 'historial' ? renderPantallaHistorial() : renderPantallaJuego();
};

export default AnotadorTruco;