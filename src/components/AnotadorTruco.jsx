// src/components/AnotadorTruco.jsx
import React from 'react';
import { useGame } from '../hooks/useGame';
import { useStats } from '../hooks/useStats';
import { useGamePersistence } from '../hooks/useGamePersistence';
import { useGameAchievements } from '../hooks/useGameAchievements';
import useSwipeBack from '../hooks/useSwipeBack';
import ScoreDisplay from './ScoreDisplay';
import PantallaInicio from './PantallaInicio';
import ScreenContainer from './ScreenContainer';

const AnotadorTruco = ({ onShowAuth }) => {
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
    
    // Estado de UI
    pantallaActual,
    mostrarModalFalta,
    mostrarModalVictoria,
    
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
      {/* NUEVO: Contenedor flex optimizado para viewport completo */}
      <div className="h-full flex flex-col rey-premium-container-mobile-optimized">
        
        {/* SECCIÓN UNIFICADA: Área de rayitas con headers y botones alineados */}
        <div className="flex flex-1 w-full min-h-0">
          {/* Columna Jugador 1 */}
          <div className="flex-1 flex flex-col">
            {/* Header Jugador 1 */}
            <div className="text-center p-1 flex-shrink-0">
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
              <div className="mt-0.5">
                <span className={`rey-premium-score-display-compact ${
                  nosAlVerde ? 'rey-premium-score-winner' : ''
                }`}>
                  {puntosNos}
                </span>
              </div>
            </div>
            
            {/* Rayitas Jugador 1 */}
            <div className="flex-1 p-1">
              <div 
                className="h-full flex items-center justify-center overflow-hidden cursor-pointer select-none rey-premium-score-area-optimized" 
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
            </div>
            
            {/* Botón Corrección Jugador 1 */}
            <div className="flex justify-center items-center flex-shrink-0 py-3">
              <button
                onClick={() => restarPunto('nos')}
                disabled={hayGanador}
                className={`rey-premium-score-button-mobile rey-premium-score-button-minus ${hayGanador ? 'disabled' : ''}`}
              >
                −
              </button>
            </div>
          </div>
          
          {/* Columna central - Sin trono */}
          <div className="w-4"></div>
          
          {/* Columna Jugador 2 */}
          <div className="flex-1 flex flex-col">
            {/* Header Jugador 2 */}
            <div className="text-center p-1 flex-shrink-0">
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
              <div className="mt-0.5">
                <span className={`rey-premium-score-display-compact ${
                  ellosAlVerde ? 'rey-premium-score-winner' : ''
                }`}>
                  {puntosEllos}
                </span>
              </div>
            </div>
            
            {/* Rayitas Jugador 2 */}
            <div className="flex-1 p-1">
              <div 
                className="h-full flex items-center justify-center overflow-hidden cursor-pointer select-none rey-premium-score-area-optimized" 
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
            
            {/* Botón Corrección Jugador 2 */}
            <div className="flex justify-center items-center flex-shrink-0 py-3">
              <button
                onClick={() => restarPunto('ellos')}
                disabled={hayGanador}
                className={`rey-premium-score-button-mobile rey-premium-score-button-minus ${hayGanador ? 'disabled' : ''}`}
              >
                −
              </button>
            </div>
          </div>
        </div>
        
        {/* SECCIÓN 4: Controles principales (altura fija mínima) */}
        <div className="rey-premium-controls-area-compact flex-shrink-0 mt-4">
          <div className="flex justify-center gap-1 flex-wrap">
            <button
              onClick={() => setMostrarModalFalta(true)}
              disabled={hayGanador}
              className="rey-premium-action-button-compact rey-premium-action-button-danger"
            >
              FALTA ENVIDO
            </button>
            
            <button
              onClick={() => {
                if (partidaEnProgreso && !hayGanador) {
                  const confirmReset = window.confirm('¿Seguro que querés reiniciar? Se perderá el progreso actual.');
                  if (confirmReset) {
                    nuevoPartido();
                    setPantallaActual('inicio');
                  }
                } else {
                  setPantallaActual('inicio');
                }
              }}
              className="rey-premium-action-button-compact rey-premium-action-button-primary"
            >
              {partidaEnProgreso && !hayGanador ? 'REINICIAR' : 'MENÚ'}
            </button>
            
            {historial.length > 0 && (
              <button
                onClick={() => setPantallaActual('historial')}
                className="rey-premium-action-button-compact"
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
            
            <div className="rey-premium-modal-buttons">
              <button
                onClick={() => {
                  // 🚀 OPTIMISTIC UI: Responder inmediatamente
                  // El efecto de useGame ya maneja las estadísticas automáticamente
                  console.log('🚀 OTRA VUELTA - Respuesta inmediata');
                  recordStatsInBackground();
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
                onClick={() => {
                  // 🚀 OPTIMISTIC UI: Responder inmediatamente
                  console.log('🚀 FINALIZAR - Respuesta inmediata');
                  recordStatsInBackground();
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