# 🗄️ FASE 3: REAL DATA PERSISTENCE

**Tiempo estimado: 1-2 semanas**  
**Prioridad: ALTA**  
**Estado: Pendiente**  
**Dependencia: Fase 1 (Authentication) completada**

## 🎯 OBJETIVO PRINCIPAL

Migrar completamente de localStorage a base de datos real (Supabase), implementando sincronización robusta, manejo offline y backup automático. Garantizar que ningún dato se pierda nunca más.

## 📋 TAREAS PRINCIPALES

### 3.1 Game Storage Real (1 semana)
- [ ] Reemplazar `useGamePersistence.js` con Supabase
- [ ] Implementar auto-save en tiempo real
- [ ] Manejo de partidas offline
- [ ] Sincronización cuando vuelve conexión
- [ ] Backup y restore automático

### 3.2 Stats Real (3-4 días)
- [ ] Migrar estadísticas de mock a Supabase
- [ ] Agregaciones en tiempo real
- [ ] Historial temporal (diario, semanal, mensual)
- [ ] Performance optimization
- [ ] Caching inteligente

### 3.3 Offline Strategy (2-3 días)
- [ ] Queue de operaciones offline
- [ ] Conflict resolution strategy
- [ ] Background sync
- [ ] User feedback durante sync
- [ ] Error recovery mechanisms

---

## 🏗️ ARQUITECTURA TÉCNICA

### Data Flow Architecture
```
User Action → Optimistic UI → Local Cache → Background Sync → Supabase
     ↓              ↓              ↓              ↓           ↓
 Immediate      UI Update    Offline Queue   Network Sync  Persistence
```

### Service Layer
```
src/services/
├── gameStorageService.js     # Reemplaza gameStorage actual
├── statsAggregationService.js # Stats calculations
├── syncService.js            # Offline/online sync
├── cacheService.js           # Intelligent caching
└── backupService.js          # Data backup/restore
```

### State Management Update
```javascript
// Enhanced state with sync status
const gameState = {
  // Existing game data
  ...currentGameState,
  
  // Sync metadata
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error',
  lastSyncTime: timestamp,
  pendingOperations: [],
  conflictResolution: 'latest' | 'manual'
};
```

---

## 🎮 GAME PERSISTENCE STRATEGY

### Real-time Auto-save
```javascript
// Save strategy per action type
const saveStrategies = {
  pointScored: 'immediate',     // Save cada punto
  gameStarted: 'immediate',     // Save al inicio
  gameFinished: 'immediate',    // Save al finalizar
  nameChanged: 'debounced',     // Save después de 1s sin cambios
  settingsChanged: 'batched'    // Save en lotes cada 30s
};
```

### Data Structure Evolution
```sql
-- Enhanced games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS:
  sync_version INTEGER DEFAULT 1,
  last_modified TIMESTAMP DEFAULT NOW(),
  client_id UUID,                    -- Para conflict resolution
  offline_changes JSONB,             -- Cambios hechos offline
  is_backup BOOLEAN DEFAULT FALSE    -- Marca backups automáticos
```

### Conflict Resolution
```javascript
// Cuando hay conflictos offline/online
const conflictResolution = {
  // Estrategia automática: último cambio gana
  automatic: (localData, serverData) => {
    return localData.lastModified > serverData.lastModified 
      ? localData 
      : serverData;
  },
  
  // Estrategia manual: mostrar modal al usuario
  manual: (localData, serverData) => {
    return showConflictResolutionModal(localData, serverData);
  },
  
  // Estrategia merge: combinar cambios cuando es posible
  merge: (localData, serverData) => {
    return smartMerge(localData, serverData);
  }
};
```

---

## 📊 STATISTICS REAL IMPLEMENTATION

### Aggregation Strategy
```sql
-- Real-time stats view
CREATE OR REPLACE VIEW user_stats_live AS
SELECT 
  user_id,
  COUNT(*) as games_played,
  COUNT(*) FILTER (WHERE winner = 'nos') as games_won,
  COUNT(*) FILTER (WHERE winner = 'ellos') as games_lost,
  AVG(CASE WHEN winner = 'nos' THEN points_us ELSE points_them END) as avg_winning_score,
  MAX(points_us + points_them) as highest_total_points,
  -- Streaks calculation
  calculate_current_streak(user_id) as current_streak,
  calculate_longest_streak(user_id) as longest_streak
FROM games 
WHERE finished_at IS NOT NULL
GROUP BY user_id;
```

### Temporal Aggregations
```javascript
// Período-specific stats
const temporalStats = {
  today: () => getStatsForPeriod('today'),
  thisWeek: () => getStatsForPeriod('week'),
  thisMonth: () => getStatsForPeriod('month'),
  allTime: () => getStatsForPeriod('all')
};

// Cached aggregations for performance
const cachedStats = {
  daily: new Map(),     // Cache por 1 hora
  weekly: new Map(),    // Cache por 6 horas  
  monthly: new Map(),   // Cache por 24 horas
  allTime: new Map()    // Cache por 7 días
};
```

### Performance Optimization
```sql
-- Materialized views for heavy calculations
CREATE MATERIALIZED VIEW monthly_stats AS
SELECT 
  user_id,
  date_trunc('month', finished_at) as month,
  COUNT(*) as games_count,
  AVG(extract(epoch FROM (finished_at - started_at))/60) as avg_duration
FROM games 
WHERE finished_at IS NOT NULL
GROUP BY user_id, date_trunc('month', finished_at);

-- Refresh strategy
REFRESH MATERIALIZED VIEW monthly_stats; -- Daily at 3 AM
```

---

## 🔄 OFFLINE/ONLINE SYNC STRATEGY

### Operation Queue
```javascript
// Queue operations when offline
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }
  
  enqueue(operation) {
    this.queue.push({
      ...operation,
      timestamp: Date.now(),
      id: generateId(),
      retryCount: 0
    });
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }
  
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue[0];
      
      try {
        await this.executeOperation(operation);
        this.queue.shift(); // Remove successful operation
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= 3) {
          // Move to failed operations
          this.handleFailedOperation(operation);
          this.queue.shift();
        } else {
          // Retry with exponential backoff
          await this.delay(Math.pow(2, operation.retryCount) * 1000);
        }
      }
    }
    
    this.isProcessing = false;
  }
}
```

### Network Status Handling
```javascript
// Network status monitoring
const networkManager = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  },
  
  handleOnline() {
    this.isOnline = true;
    // Resume sync operations
    syncService.resumeSync();
    // Show user feedback
    showToast('Conectado - Sincronizando datos...', 'success');
  },
  
  handleOffline() {
    this.isOnline = false;
    // Pause sync operations
    syncService.pauseSync();
    // Show user feedback
    showToast('Sin conexión - Los cambios se guardarán localmente', 'warning');
  }
};
```

---

## 🛡️ DATA INTEGRITY & BACKUP

### Automatic Backup Strategy
```javascript
// Backup strategy
const backupManager = {
  // Daily backup at 2 AM
  dailyBackup: async () => {
    const userData = await exportUserData();
    await supabase.storage
      .from('user-backups')
      .upload(`${userId}/backup-${date}.json`, userData);
  },
  
  // Before major operations
  preOperationBackup: async (operationType) => {
    if (['game_finished', 'stats_reset'].includes(operationType)) {
      await this.createSnapshot(`pre-${operationType}-${timestamp}`);
    }
  },
  
  // User-initiated backup
  manualBackup: async () => {
    const data = await exportUserData();
    return data; // Allow user to save locally
  }
};
```

### Data Validation
```javascript
// Validation before save
const validateGameData = (gameData) => {
  const rules = {
    pointsUs: (val) => val >= 0 && val <= gameData.totalPoints,
    pointsThem: (val) => val >= 0 && val <= gameData.totalPoints,
    totalPoints: (val) => [16, 24, 30].includes(val),
    winner: (val) => val === null || ['nos', 'ellos'].includes(val),
    historial: (val) => Array.isArray(val) && val.length <= 100
  };
  
  return Object.entries(rules).every(([field, validator]) => {
    return validator(gameData[field]);
  });
};
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### Intelligent Caching
```javascript
// Multi-level caching strategy
const cacheManager = {
  // Memory cache (fastest)
  memory: new Map(),
  
  // IndexedDB cache (persistent)
  idb: null,
  
  // Supabase cache (with TTL)
  supabase: null,
  
  async get(key) {
    // Try memory first
    if (this.memory.has(key)) {
      return this.memory.get(key);
    }
    
    // Try IndexedDB
    const idbResult = await this.idb.get(key);
    if (idbResult && !this.isExpired(idbResult)) {
      this.memory.set(key, idbResult.data);
      return idbResult.data;
    }
    
    // Fetch from Supabase
    const freshData = await this.fetchFromSupabase(key);
    await this.set(key, freshData);
    return freshData;
  },
  
  async set(key, data) {
    // Set in all cache levels
    this.memory.set(key, data);
    await this.idb.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.getTTL(key)
    });
  }
};
```

### Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_games_user_finished 
  ON games(user_id, finished_at) 
  WHERE finished_at IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_games_created_recent 
  ON games(created_at) 
  WHERE created_at > NOW() - INTERVAL '30 days';

-- Partition large tables by date
CREATE TABLE games_2024 PARTITION OF games
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## 📱 USER EXPERIENCE ENHANCEMENTS

### Sync Status Indicators
```javascript
// Visual sync status
const SyncStatusIndicator = () => {
  const { syncStatus, pendingOperations } = useSyncStatus();
  
  return (
    <div className="sync-indicator">
      {syncStatus === 'syncing' && (
        <div className="flex items-center text-yellow-500">
          <Spinner size="sm" />
          <span>Sincronizando...</span>
        </div>
      )}
      
      {syncStatus === 'offline' && pendingOperations.length > 0 && (
        <div className="flex items-center text-orange-500">
          <OfflineIcon />
          <span>{pendingOperations.length} cambios pendientes</span>
        </div>
      )}
      
      {syncStatus === 'synced' && (
        <div className="flex items-center text-green-500">
          <CheckIcon />
          <span>Sincronizado</span>
        </div>
      )}
    </div>
  );
};
```

### Error Recovery UI
```javascript
// Friendly error recovery
const SyncErrorRecovery = ({ error, onRetry, onIgnore }) => (
  <div className="rey-premium-modal-backdrop">
    <div className="rey-premium-modal-container">
      <div className="rey-premium-modal-icon">⚠️</div>
      
      <h2 className="rey-premium-modal-title">
        Error de Sincronización
      </h2>
      
      <p className="rey-premium-modal-text">
        No pudimos sincronizar algunos cambios. Tus datos están seguros localmente.
      </p>
      
      <div className="rey-premium-modal-buttons">
        <button onClick={onRetry} className="rey-premium-modal-button-primary">
          Reintentar
        </button>
        <button onClick={onIgnore} className="rey-premium-modal-button-secondary">
          Continuar sin Sincronizar
        </button>
      </div>
    </div>
  </div>
);
```

---

## ✅ DEFINITION OF DONE

### Funcional
- [ ] **Zero data loss**: Ningún dato se pierde nunca
- [ ] **Offline capable**: App funcional sin conexión
- [ ] **Auto-sync**: Sincronización transparente
- [ ] **Conflict resolution**: Manejo de conflictos robusto
- [ ] **Performance**: Sin degradación perceptible

### Técnico
- [ ] **Database migration**: localStorage → Supabase completa
- [ ] **Real-time stats**: Estadísticas actualizadas en vivo
- [ ] **Backup system**: Backup automático y manual
- [ ] **Error handling**: Recovery graceful de errores
- [ ] **Testing**: Tests de sync y offline scenarios

### UX
- [ ] **Transparent sync**: Usuario no nota la complejidad
- [ ] **Clear feedback**: Status de sync visible cuando necesario
- [ ] **Error recovery**: UI amigable para errores
- [ ] **Performance**: <100ms para operaciones comunes

---

## 📈 SUCCESS METRICS

- **Reliability**: 99.9% success rate en sync operations
- **Performance**: <100ms save time promedio
- **Data Integrity**: 0% data corruption/loss incidents
- **User Experience**: <1% users reportan problemas de sync
- **Offline Usage**: App funcional 100% sin conexión

---

## 🔗 DEPENDENCIES

### External
- Fase 1 (Authentication) completa y estable
- Supabase database configurada y optimizada
- Network connectivity monitoring
- IndexedDB support (modern browsers)

### Internal
- Game state architecture stable
- Component interfaces defined
- Error handling patterns established
- Performance benchmarks defined