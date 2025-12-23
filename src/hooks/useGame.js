// src/hooks/useGame.js
import { useCallback, useMemo, useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useStats } from './useStats';
import { PLAYERS, SCREENS, gameUtils } from '../types/gameTypes';

// Hook principal para interactuar con el estado del juego
export const useGame = () => {
  const { state, dispatch, actions } = useGameContext();
  const { recordGameFinished, isStatsAvailable } = useStats();
  
  // Selectores memoizados para optimizar renders
  const game = useMemo(() => state.game, [state.game]);
  const ui = useMemo(() => state.ui, [state.ui]);
  const user = useMemo(() => state.user, [state.user]);
  const localData = useMemo(() => state.localData, [state.localData]);
  const meta = useMemo(() => state.meta, [state.meta]);
  
  // Detectar cuando un juego termina y registrarlo en estadísticas
  useEffect(() => {
    const { puntosNos, puntosEllos, puntosTotales } = game;
    
    // Usar gameUtils para detectar ganador correctamente
    const hayGanador = gameUtils.hasWinner(state);
    const ganador = gameUtils.getWinner(state);
    
    console.log('🎯 Debug juego terminado:', {
      puntosNos,
      puntosEllos,
      puntosTotales,
      hayGanador,
      ganador,
      gameRecordedInStats: meta.gameRecordedInStats
    });
    
    if (hayGanador && ganador && !meta.gameRecordedInStats) {
      console.log('🎯 JUEGO TERMINADO - Registrando en estadísticas...', {
        ganador,
        puntos: `${puntosNos}-${puntosEllos}`,
        gameRecordedInStats: meta.gameRecordedInStats
      });
      
      // Preparar datos del juego para estadísticas
      const gameData = {
        puntosNos,
        puntosEllos,
        ganador: ganador === PLAYERS.NOS ? 'nos' : 'ellos', // Convertir a formato string
        jugador1: game.jugador1,
        jugador2: game.jugador2,
        puntosTotales: game.puntosTotales,
        fechaInicio: game.fechaInicio,
        fechaFin: Date.now(),
        historial: game.historial
      };
      
      // Marcar inmediatamente como registrado para evitar loops
      dispatch(actions.markGameRecorded());
      
      // Registrar en estadísticas
      recordGameFinished(gameData).then((result) => {
        console.log('✅ Juego registrado exitosamente en estadísticas!', {
          success: !!result,
          insights: result?.insights?.length || 0
        });
      }).catch(error => {
        console.error('❌ Error registering game in stats:', error);
        // Si falla, desmarcar para permitir reintento
        dispatch(actions.clearGameRecorded());
      });
    }
  }, [game.puntosNos, game.puntosEllos, game.puntosTotales, meta.gameRecordedInStats, recordGameFinished, dispatch, actions, state]);
  
  // Acciones del juego
  const sumarPunto = useCallback((equipo) => {
    const player = equipo === 'nos' ? PLAYERS.NOS : PLAYERS.ELLOS;
    dispatch(actions.addPoint(player));
  }, [dispatch, actions]);
  
  const restarPunto = useCallback((equipo, allowWithWinner = false) => {
    const player = equipo === 'nos' ? PLAYERS.NOS : PLAYERS.ELLOS;
    dispatch(actions.subtractPoint(player, allowWithWinner));
  }, [dispatch, actions]);
  
  const faltaEnvido = useCallback((equipoGanador) => {
    const player = equipoGanador === 'nos' ? PLAYERS.NOS : PLAYERS.ELLOS;
    dispatch(actions.faltaEnvido(player));
  }, [dispatch, actions]);
  
  const nuevoPartido = useCallback((configuracion = {}) => {
    dispatch(actions.newGame(configuracion));
  }, [dispatch, actions]);
  
  const restaurarPartida = useCallback((partidaGuardada) => {
    dispatch(actions.restoreGame(partidaGuardada));
  }, [dispatch, actions]);
  
  const limpiarGanador = useCallback(() => {
    dispatch(actions.clearWinner());
  }, [dispatch, actions]);
  
  // Acciones de configuración
  const setJugador1 = useCallback((nombre) => {
    dispatch(actions.setPlayerNames(nombre, game.jugador2));
  }, [dispatch, actions, game.jugador2]);
  
  const setJugador2 = useCallback((nombre) => {
    dispatch(actions.setPlayerNames(game.jugador1, nombre));
  }, [dispatch, actions, game.jugador1]);
  
  const setPuntosTotales = useCallback((puntos) => {
    dispatch(actions.setTotalPoints(puntos));
  }, [dispatch, actions]);
  
  // Acciones de UI
  const setPantallaActual = useCallback((pantalla) => {
    const screen = pantalla === 'inicio' ? SCREENS.INICIO :
                   pantalla === 'juego' ? SCREENS.JUEGO :
                   pantalla === 'historial' ? SCREENS.HISTORIAL :
                   pantalla;
    dispatch(actions.setScreen(screen));
  }, [dispatch, actions]);
  
  const setMostrarModalFalta = useCallback((show) => {
    dispatch(actions.toggleModalFalta(show));
  }, [dispatch, actions]);
  
  const setMostrarModalVictoria = useCallback((show) => {
    dispatch(actions.toggleModalVictoria(show));
  }, [dispatch, actions]);

  const setMostrarModalReiniciar = useCallback((show) => {
    dispatch(actions.toggleModalReiniciar(show));
  }, [dispatch, actions]);

  // Team/Match actions (Equipos2)
  const setMatchNotes = useCallback((notes) => {
    dispatch(actions.setMatchNotes(notes));
  }, [dispatch, actions]);

  const setMatchId = useCallback((matchId) => {
    dispatch(actions.setMatchId(matchId));
  }, [dispatch, actions]);

  // Funciones calculadas
  const calcularPuntosFalta = useCallback((equipoGanador) => {
    const player = equipoGanador === 'nos' ? PLAYERS.NOS : PLAYERS.ELLOS;
    return gameUtils.calculateFaltaEnvidoPoints(state, player);
  }, [state]);
  
  const ganaPartido = useCallback((equipoGanador) => {
    const player = equipoGanador === 'nos' ? PLAYERS.NOS : PLAYERS.ELLOS;
    return gameUtils.faltaEnvidoWinsGame(state, player);
  }, [state]);
  
  // Estado derivado memoizado
  const derived = useMemo(() => ({
    // Estado del juego
    hayGanador: gameUtils.hasWinner(state),
    ganadorActual: gameUtils.getWinner(state),
    partidaEnProgreso: gameUtils.isGameInProgress(state),
    
    // Estados "al verde"
    nosAlVerde: gameUtils.isAlVerde(game.puntosNos, game.puntosTotales),
    ellosAlVerde: gameUtils.isAlVerde(game.puntosEllos, game.puntosTotales),
    
    // Estadísticas locales
    winRateNos: localData.partidasJugadas > 0 ? 
      (localData.victoriasNos / localData.partidasJugadas * 100).toFixed(1) : '0.0',
    winRateEllos: localData.partidasJugadas > 0 ? 
      (localData.victoriasEllos / localData.partidasJugadas * 100).toFixed(1) : '0.0',
    
    // Estados de sincronización
    needsSync: meta.needsSync,
    isOnline: meta.isOnline,
    hasUnsavedChanges: meta.hasUnsavedChanges,
    
    // Estados de autenticación (preparado para Fase 1)
    isAuthenticated: user.isAuthenticated,
    canSync: user.isAuthenticated && meta.isOnline
  }), [state, game, localData, meta, user]);
  
  // Funciones de utilidad
  const utils = useMemo(() => ({
    // Formatear tiempo relativo para historial
    formatearTiempoRelativo: (timestamp) => {
      const ahora = Date.now();
      const diferencia = ahora - timestamp;
      
      const minutos = Math.floor(diferencia / (1000 * 60));
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      
      if (minutos < 1) return 'hace momentos';
      if (minutos < 60) return `hace ${minutos} min`;
      if (horas < 24) return `hace ${horas} h`;
      if (dias < 7) return `hace ${dias} días`;
      
      return new Date(timestamp).toLocaleDateString('es-AR');
    },
    
    // Calcular duración de partida
    calcularDuracionPartida: () => {
      if (!game.fechaInicio) return 0;
      const fin = game.fechaFin || Date.now();
      return fin - game.fechaInicio;
    },
    
    // Formatear duración
    formatearDuracion: (duracion) => {
      const minutos = Math.floor(duracion / (1000 * 60));
      const segundos = Math.floor((duracion % (1000 * 60)) / 1000);
      
      if (minutos > 0) {
        return `${minutos}:${segundos.toString().padStart(2, '0')}`;
      }
      return `${segundos}s`;
    },
    
    // Obtener nombre del jugador por equipo
    getNombreJugador: (equipo) => {
      return equipo === 'nos' ? game.jugador1 : game.jugador2;
    },
    
    // Obtener puntos por equipo
    getPuntos: (equipo) => {
      return equipo === 'nos' ? game.puntosNos : game.puntosEllos;
    }
  }), [game]);
  
  return {
    // Estado básico
    puntosNos: game.puntosNos,
    puntosEllos: game.puntosEllos,
    ganador: game.ganador,
    jugador1: game.jugador1,
    jugador2: game.jugador2,
    puntosTotales: game.puntosTotales,
    historial: game.historial,

    // Team data (Equipos2)
    teamNosotros: game.teamNosotros || [],
    teamEllos: game.teamEllos || [],
    matchId: game.matchId,
    matchNotes: game.matchNotes,

    // Estado de UI
    pantallaActual: ui.pantallaActual,
    mostrarModalFalta: ui.mostrarModalFalta,
    mostrarModalVictoria: ui.mostrarModalVictoria,
    mostrarModalReiniciar: ui.mostrarModalReiniciar,
    loading: ui.loading,
    error: ui.error,

    // Estado derivado
    ...derived,

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
    setPuntosTotales,

    // Acciones de UI
    setPantallaActual,
    setMostrarModalFalta,
    setMostrarModalVictoria,
    setMostrarModalReiniciar,

    // Team/Match actions (Equipos2)
    setMatchNotes,
    setMatchId,

    // Funciones calculadas
    calcularPuntosFalta,
    ganaPartido,

    // Utilidades
    utils,

    // Datos locales y metadata
    localData,
    meta,
    user,

    // Estado completo (para casos especiales)
    fullState: state
  };
};

export default useGame;