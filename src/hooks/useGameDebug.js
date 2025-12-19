// src/hooks/useGameDebug.js
import { useCallback } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { useGamePersistence } from '../hooks/useGamePersistence';
import { validateGameState } from '../types/gameTypes';

/**
 * Hook de debug para desarrollo y troubleshooting
 * Solo debe usarse en desarrollo
 */
export const useGameDebug = () => {
  const { state, debugState } = useGameContext();
  const persistence = useGamePersistence();
  
  // Función para simular un juego completo
  const simulateGame = useCallback((scenario = 'normal') => {
    const { dispatch, actions } = useGameContext();
    
    console.log(`🎮 Simulating ${scenario} game scenario...`);
    
    switch (scenario) {
      case 'normal':
        // Simular un juego normal de 30 puntos
        for (let i = 0; i < 25; i++) {
          dispatch(actions.addPoint(i % 2 === 0 ? 'nos' : 'ellos'));
        }
        // Nos gana
        for (let i = 0; i < 5; i++) {
          dispatch(actions.addPoint('nos'));
        }
        break;
        
      case 'falta_envido':
        // Simular juego que termina por falta envido
        for (let i = 0; i < 20; i++) {
          dispatch(actions.addPoint('nos'));
        }
        for (let i = 0; i < 15; i++) {
          dispatch(actions.addPoint('ellos'));
        }
        dispatch(actions.faltaEnvido('nos')); // Nos gana por falta
        break;
        
      case 'close_game':
        // Simular juego muy parejo
        for (let i = 0; i < 29; i++) {
          dispatch(actions.addPoint(i % 2 === 0 ? 'nos' : 'ellos'));
        }
        dispatch(actions.addPoint('nos')); // Nos gana por 1
        break;
        
      case 'blowout':
        // Simular goleada
        for (let i = 0; i < 30; i++) {
          dispatch(actions.addPoint('nos'));
        }
        // Ellos solo anota 5
        for (let i = 0; i < 5; i++) {
          dispatch(actions.addPoint('ellos'));
        }
        break;
        
      default:
        console.warn('Unknown scenario:', scenario);
    }
    
    console.log('✅ Game simulation completed');
  }, []);
  
  // Función para probar persistencia
  const testPersistence = useCallback(async () => {
    console.log('🔍 Testing persistence system...');
    
    try {
      // Crear backup
      const backupSuccess = await persistence.createBackup();
      console.log('Backup creation:', backupSuccess ? '✅' : '❌');
      
      // Verificar integridad
      const integrity = persistence.verifyDataIntegrity();
      console.log('Data integrity:', integrity.isValid ? '✅' : '❌');
      if (!integrity.isValid) {
        console.warn('Integrity issues:', integrity.issues);
      }
      
      // Stats de storage
      console.log('Storage stats:', persistence.storageStats);
      
      // Intentar migración
      const migrationResult = persistence.migrateDataIfNeeded();
      if (migrationResult) {
        console.log('Migration performed:', migrationResult);
      } else {
        console.log('No migration needed');
      }
      
      console.log('✅ Persistence test completed');
    } catch (error) {
      console.error('❌ Persistence test failed:', error);
    }
  }, [persistence]);
  
  // Función para generar datos de test
  const generateTestData = useCallback((amount = 100) => {
    console.log(`📊 Generating ${amount} test games...`);
    
    const scenarios = ['normal', 'falta_envido', 'close_game', 'blowout'];
    const testStats = {
      totalGames: amount,
      victories: 0,
      defeats: 0,
      faltaEnvidoWins: 0,
      blowouts: 0,
      closeGames: 0
    };
    
    for (let i = 0; i < amount; i++) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      // Simular resultado basado en escenario
      const won = Math.random() > 0.4; // 60% win rate
      
      if (won) {
        testStats.victories++;
        if (scenario === 'falta_envido') testStats.faltaEnvidoWins++;
        if (scenario === 'blowout') testStats.blowouts++;
        if (scenario === 'close_game') testStats.closeGames++;
      } else {
        testStats.defeats++;
      }
    }
    
    // Guardar stats generadas
    persistence.saveLocalStats(testStats);
    
    console.log('✅ Test data generated:', testStats);
    return testStats;
  }, [persistence]);
  
  // Función para analizar performance
  const analyzePerformance = useCallback(() => {
    console.log('⚡ Analyzing performance...');
    
    const startTime = performance.now();
    
    // Test de render performance
    const renderStart = performance.now();
    debugState(); // This logs current state
    const renderTime = performance.now() - renderStart;
    
    // Test de validación
    const validationStart = performance.now();
    const validation = validateGameState(state);
    const validationTime = performance.now() - validationStart;
    
    // Test de serialización
    const serializationStart = performance.now();
    const serialized = JSON.stringify(state);
    const serializationTime = performance.now() - serializationStart;
    
    // Test de parsing
    const parseStart = performance.now();
    JSON.parse(serialized);
    const parseTime = performance.now() - parseStart;
    
    const totalTime = performance.now() - startTime;
    
    const performanceReport = {
      renderTime: `${renderTime.toFixed(2)}ms`,
      validationTime: `${validationTime.toFixed(2)}ms`,
      serializationTime: `${serializationTime.toFixed(2)}ms`,
      parseTime: `${parseTime.toFixed(2)}ms`,
      totalTime: `${totalTime.toFixed(2)}ms`,
      stateSize: `${(serialized.length / 1024).toFixed(2)}KB`,
      isValid: validation.isValid,
      validationErrors: validation.errors
    };
    
    console.log('Performance Report:', performanceReport);
    return performanceReport;
  }, [state, debugState]);
  
  // Función para limpiar todos los datos
  const clearAllData = useCallback(() => {
    console.log('🧹 Clearing all data...');
    
    try {
      // Limpiar localStorage
      localStorage.removeItem('rey-del-truco-state');
      localStorage.removeItem('rey-del-truco-backup');
      localStorage.removeItem('rey-del-truco-stats');
      localStorage.removeItem('anotador-truco-partida'); // Old format
      localStorage.removeItem('anotador-truco-partida-backup');
      
      // Reset estado
      const { dispatch, actions } = useGameContext();
      dispatch(actions.newGame());
      
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  }, []);
  
  // Función para exportar logs de debug
  const exportDebugInfo = useCallback(() => {
    console.log('📋 Exporting debug information...');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      state: state,
      validation: validateGameState(state),
      performance: analyzePerformance(),
      persistence: {
        hasSavedGame: persistence.hasSavedGame(),
        storageStats: persistence.storageStats,
        integrity: persistence.verifyDataIntegrity()
      },
      browser: {
        userAgent: navigator.userAgent,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language
      },
      localStorage: {
        available: typeof Storage !== 'undefined',
        quota: navigator.storage ? 'Available' : 'Not available'
      }
    };
    
    // Crear archivo de debug
    const blob = new Blob([JSON.stringify(debugInfo, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rey-del-truco-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Debug info exported');
    return debugInfo;
  }, [state, persistence, analyzePerformance]);
  
  // Función para test de stress
  const stressTest = useCallback((iterations = 1000) => {
    console.log(`🔥 Running stress test with ${iterations} operations...`);
    
    const startTime = performance.now();
    const { dispatch, actions } = useGameContext();
    
    try {
      for (let i = 0; i < iterations; i++) {
        const operation = Math.random();
        
        if (operation < 0.7) {
          // 70% suma puntos
          dispatch(actions.addPoint(Math.random() > 0.5 ? 'nos' : 'ellos'));
        } else if (operation < 0.85) {
          // 15% resta puntos
          dispatch(actions.subtractPoint(Math.random() > 0.5 ? 'nos' : 'ellos'));
        } else if (operation < 0.95) {
          // 10% nuevo juego
          dispatch(actions.newGame());
        } else {
          // 5% falta envido
          dispatch(actions.faltaEnvido(Math.random() > 0.5 ? 'nos' : 'ellos'));
        }
        
        // Cada 100 operaciones, hacer una validación
        if (i % 100 === 0) {
          const validation = validateGameState(state);
          if (!validation.isValid) {
            throw new Error(`State became invalid at iteration ${i}: ${validation.errors.join(', ')}`);
          }
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const stressReport = {
        iterations,
        duration: `${duration.toFixed(2)}ms`,
        averageOpTime: `${(duration / iterations).toFixed(4)}ms`,
        opsPerSecond: Math.round(iterations / (duration / 1000)),
        finalState: 'Valid',
        memoryUsage: performance.memory ? {
          used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        } : 'Not available'
      };
      
      console.log('✅ Stress test completed:', stressReport);
      return stressReport;
    } catch (error) {
      console.error('❌ Stress test failed:', error);
      throw error;
    }
  }, [state]);
  
  return {
    // Estado de debug
    state,
    isValid: validateGameState(state).isValid,
    validationErrors: validateGameState(state).errors,
    
    // Funciones de test
    simulateGame,
    testPersistence,
    generateTestData,
    analyzePerformance,
    stressTest,
    
    // Utilidades
    clearAllData,
    exportDebugInfo,
    debugState,
    
    // Datos de persistencia
    persistence
  };
};

// Hook wrapper que solo funciona en desarrollo
export const useGameDebugDev = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('useGameDebug is only available in development mode');
    return null;
  }
  
  return useGameDebug();
};