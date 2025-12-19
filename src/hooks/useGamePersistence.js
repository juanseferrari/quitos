// src/hooks/useGamePersistence.js - REFACTORED VERSION
import { useCallback, useEffect, useMemo } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { validateGameState } from '../types/gameTypes';

const STORAGE_KEY = 'rey-del-truco-state';
const BACKUP_KEY = 'rey-del-truco-backup';
const STATS_KEY = 'rey-del-truco-stats';

export const useGamePersistence = () => {
  const { state, getSavedGame, hasSavedGame, clearSavedGame } = useGameContext();
  
  // Función para crear backup antes de operaciones críticas
  const createBackup = useCallback(async () => {
    try {
      const currentData = {
        game: state.game,
        localData: state.localData,
        timestamp: Date.now(),
        version: state.meta.version,
        type: 'backup'
      };
      
      localStorage.setItem(BACKUP_KEY, JSON.stringify(currentData));
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }, [state]);
  
  // Función para restaurar desde backup
  const restoreFromBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const data = JSON.parse(backup);
        
        // Validar integridad del backup
        const validation = validateGameState(data);
        if (validation.isValid) {
          return data;
        } else {
          console.warn('Backup data is invalid:', validation.errors);
        }
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
    }
    return null;
  }, []);
  
  // Función para guardar estadísticas locales
  const saveLocalStats = useCallback((stats) => {
    try {
      const statsData = {
        ...stats,
        lastUpdated: Date.now(),
        version: state.meta.version
      };
      
      localStorage.setItem(STATS_KEY, JSON.stringify(statsData));
    } catch (error) {
      console.error('Error saving local stats:', error);
    }
  }, [state.meta.version]);
  
  // Función para cargar estadísticas locales
  const loadLocalStats = useCallback(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        
        // Verificar versión y validez
        if (data.version === state.meta.version) {
          return data;
        } else {
          // Versión diferente, migrar stats si es necesario
          // Stats version mismatch, migration might be needed
        }
      }
    } catch (error) {
      console.error('Error loading local stats:', error);
    }
    return null;
  }, [state.meta.version]);
  
  // Función para limpiar datos antiguos
  const cleanupOldData = useCallback(() => {
    try {
      // Limpiar partidas muy antiguas (más de 30 días)
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        if (data.timestamp < thirtyDaysAgo) {
          localStorage.removeItem(STORAGE_KEY);
          // Cleaned up old game data
        }
      }
      
      // Limpiar backup antiguo
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const data = JSON.parse(backup);
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        if (data.timestamp < sevenDaysAgo) {
          localStorage.removeItem(BACKUP_KEY);
          // Cleaned up old backup data
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, []);
  
  // Función para exportar datos (para debugging/soporte)
  const exportGameData = useCallback(() => {
    try {
      const exportData = {
        game: state.game,
        localData: state.localData,
        stats: loadLocalStats(),
        meta: {
          ...state.meta,
          exportedAt: Date.now(),
          exportVersion: '1.0.0'
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rey-del-truco-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting game data:', error);
      return false;
    }
  }, [state, loadLocalStats]);
  
  // Función para importar datos
  const importGameData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validar estructura de datos importados
          if (data.game && data.localData) {
            const validation = validateGameState(data);
            if (validation.isValid) {
              resolve(data);
            } else {
              reject(new Error('Invalid imported data: ' + validation.errors.join(', ')));
            }
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (error) {
          reject(new Error('Error parsing file: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }, []);
  
  // Función para verificar integridad de datos guardados
  const verifyDataIntegrity = useCallback(() => {
    const issues = [];
    
    try {
      // Verificar juego principal
      const gameData = getSavedGame();
      if (gameData) {
        const validation = validateGameState(gameData);
        if (!validation.isValid) {
          issues.push(...validation.errors.map(err => `Game: ${err}`));
        }
      }
      
      // Verificar stats
      const stats = loadLocalStats();
      if (stats && (!stats.lastUpdated || !stats.version)) {
        issues.push('Stats: Missing metadata');
      }
      
      // Verificar backup
      const backup = restoreFromBackup();
      if (backup) {
        const backupValidation = validateGameState(backup);
        if (!backupValidation.isValid) {
          issues.push(...backupValidation.errors.map(err => `Backup: ${err}`));
        }
      }
      
    } catch (error) {
      issues.push(`Integrity check error: ${error.message}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }, [getSavedGame, loadLocalStats, restoreFromBackup]);
  
  // Función para migrar datos de versiones anteriores
  const migrateDataIfNeeded = useCallback(() => {
    try {
      // Verificar si hay datos del formato anterior (useGameState original)
      const oldFormatData = localStorage.getItem('anotador-truco-partida');
      
      if (oldFormatData && !hasSavedGame()) {
        const oldData = JSON.parse(oldFormatData);
        
        // Convertir al nuevo formato
        const migratedData = {
          game: {
            id: `migrated_${Date.now()}`,
            puntosNos: oldData.puntosNos || 0,
            puntosEllos: oldData.puntosEllos || 0,
            jugador1: oldData.jugador1 || 'Nosotros',
            jugador2: oldData.jugador2 || 'Ellos',
            puntosTotales: oldData.puntosTotales || 30,
            ganador: oldData.ganador || null,
            fechaInicio: oldData.timestamp || Date.now(),
            fechaFin: null,
            historial: oldData.historial || []
          },
          localData: {
            partidasJugadas: 0,
            victoriasNos: 0,
            victoriasEllos: 0,
            historialCompleto: [],
            configuracionGuardada: null
          },
          timestamp: Date.now(),
          version: state.meta.version,
          migrated: true
        };
        
        // Guardar en nuevo formato
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
        
        // Mantener backup del formato anterior por seguridad
        localStorage.setItem('anotador-truco-partida-backup', oldFormatData);
        
        // Successfully migrated game data to new format
        return migratedData;
      }
    } catch (error) {
      console.error('Error during data migration:', error);
    }
    
    return null;
  }, [hasSavedGame, state.meta.version]);
  
  // Efecto para cleanup automático
  useEffect(() => {
    const cleanup = () => {
      cleanupOldData();
    };
    
    // Cleanup al montar
    cleanup();
    
    // Cleanup cada hora
    const interval = setInterval(cleanup, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [cleanupOldData]);
  
  // Efecto para migración automática
  useEffect(() => {
    migrateDataIfNeeded();
  }, [migrateDataIfNeeded]);
  
  // Estadísticas de storage
  const storageStats = useMemo(() => {
    try {
      const gameSize = localStorage.getItem(STORAGE_KEY)?.length || 0;
      const backupSize = localStorage.getItem(BACKUP_KEY)?.length || 0;
      const statsSize = localStorage.getItem(STATS_KEY)?.length || 0;
      
      return {
        gameDataSize: gameSize,
        backupSize: backupSize,
        statsSize: statsSize,
        totalSize: gameSize + backupSize + statsSize,
        formattedSize: `${Math.round((gameSize + backupSize + statsSize) / 1024 * 100) / 100} KB`
      };
    } catch (error) {
      return {
        gameDataSize: 0,
        backupSize: 0,
        statsSize: 0,
        totalSize: 0,
        formattedSize: '0 KB'
      };
    }
  }, [state]);
  
  return {
    // Funciones existentes (compatibilidad)
    getSavedGame,
    clearSavedGame,
    hasSavedGame,
    
    // Nuevas funciones
    createBackup,
    restoreFromBackup,
    saveLocalStats,
    loadLocalStats,
    cleanupOldData,
    exportGameData,
    importGameData,
    verifyDataIntegrity,
    migrateDataIfNeeded,
    
    // Estadísticas
    storageStats,
    
    // Estado de sincronización
    needsSync: state.meta.needsSync,
    isOnline: state.meta.isOnline,
    hasUnsavedChanges: state.meta.hasUnsavedChanges,
    
    // Utilidades
    canSync: state.user.isAuthenticated && state.meta.isOnline,
    lastUpdated: state.meta.lastUpdated
  };
};