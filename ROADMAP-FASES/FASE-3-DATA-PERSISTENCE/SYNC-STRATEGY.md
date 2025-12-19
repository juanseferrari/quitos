# 🔄 SYNC STRATEGY & OFFLINE ARCHITECTURE

## 📊 SYNC PATTERNS OVERVIEW

### Operation Types & Sync Strategy
```javascript
const syncStrategies = {
  // Immediate sync (critical operations)
  IMMEDIATE: [
    'game_started',
    'game_finished', 
    'point_scored',
    'falta_envido'
  ],
  
  // Debounced sync (frequent but non-critical)
  DEBOUNCED: [
    'player_name_changed',
    'settings_updated',
    'preferences_changed'
  ],
  
  // Batched sync (background operations)
  BATCHED: [
    'stats_calculated',
    'achievements_checked',
    'analytics_events'
  ],
  
  // Background sync (eventual consistency)
  BACKGROUND: [
    'backup_created',
    'cache_refreshed',
    'maintenance_tasks'
  ]
};
```

---

## 🏗️ OFFLINE QUEUE ARCHITECTURE

### Queue Data Structure
```javascript
// Persistent operation queue
class OfflineOperationQueue {
  constructor() {
    this.queue = new PersistentQueue('sync_operations');
    this.retryPolicy = new ExponentialBackoffRetry();
    this.networkMonitor = new NetworkStatusMonitor();
  }
  
  // Add operation to queue
  async enqueue(operation) {
    const queueItem = {
      id: generateUUID(),
      type: operation.type,
      payload: operation.payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.getMaxRetries(operation.type),
      priority: this.getPriority(operation.type),
      expiresAt: Date.now() + this.getTTL(operation.type)
    };
    
    await this.queue.add(queueItem);
    
    // Attempt immediate processing if online
    if (this.networkMonitor.isOnline) {
      this.processQueue();
    }
  }
  
  // Process queue with intelligent retry
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Sort by priority and timestamp
      const operations = await this.queue.getAll();
      const sortedOps = this.prioritizeOperations(operations);
      
      for (const operation of sortedOps) {
        await this.processOperation(operation);
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
```

### Retry Logic & Backoff
```javascript
class ExponentialBackoffRetry {
  calculateDelay(retryCount) {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }
  
  shouldRetry(operation, error) {
    // Don't retry client errors (400-499)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    
    // Retry network errors and server errors
    if (error.code === 'NETWORK_ERROR' || error.status >= 500) {
      return operation.retryCount < operation.maxRetries;
    }
    
    return false;
  }
}
```

---

## 🔀 CONFLICT RESOLUTION STRATEGIES

### Conflict Detection
```javascript
class ConflictDetector {
  detectConflict(localData, serverData) {
    // Simple timestamp-based detection
    if (localData.lastModified && serverData.lastModified) {
      const timeDiff = Math.abs(localData.lastModified - serverData.lastModified);
      
      // If modified within 5 seconds, likely same action
      if (timeDiff < 5000) {
        return null; // No conflict
      }
      
      return {
        type: 'timestamp_conflict',
        localVersion: localData,
        serverVersion: serverData,
        conflictFields: this.findConflictingFields(localData, serverData)
      };
    }
    
    // Version-based detection
    if (localData.version && serverData.version) {
      if (localData.version !== serverData.version) {
        return {
          type: 'version_conflict',
          localVersion: localData,
          serverVersion: serverData
        };
      }
    }
    
    return null;
  }
  
  findConflictingFields(local, server) {
    const conflicts = [];
    const keys = new Set([...Object.keys(local), ...Object.keys(server)]);
    
    for (const key of keys) {
      if (local[key] !== server[key]) {
        conflicts.push({
          field: key,
          localValue: local[key],
          serverValue: server[key]
        });
      }
    }
    
    return conflicts;
  }
}
```

### Resolution Strategies
```javascript
const conflictResolvers = {
  // Automatic resolution strategies
  lastWriteWins: (local, server) => {
    return local.lastModified > server.lastModified ? local : server;
  },
  
  serverWins: (local, server) => server,
  
  clientWins: (local, server) => local,
  
  // Smart merge for compatible changes
  smartMerge: (local, server) => {
    const merged = { ...server }; // Start with server data
    
    // Merge non-conflicting changes
    Object.keys(local).forEach(key => {
      if (local[key] !== server[key]) {
        // Apply custom merge logic based on field type
        merged[key] = this.mergeField(key, local[key], server[key]);
      }
    });
    
    return merged;
  },
  
  // Manual resolution - present options to user
  manual: async (local, server) => {
    return await showConflictResolutionDialog(local, server);
  }
};

// Field-specific merge strategies
const fieldMergeStrategies = {
  puntosNos: 'max',        // Take higher score
  puntosEllos: 'max',      // Take higher score
  jugador1: 'client',      // Prefer client names
  jugador2: 'client',      // Prefer client names
  historial: 'merge_array' // Merge arrays intelligently
};
```

---

## 📱 OFFLINE CAPABILITIES

### Local Storage Strategy
```javascript
class OfflineStorageManager {
  constructor() {
    this.indexedDB = new IndexedDBWrapper('rey_del_truco');
    this.localStorage = new LocalStorageWrapper();
    this.memoryCache = new Map();
  }
  
  // Multi-tier storage with fallbacks
  async store(key, data, options = {}) {
    const storageItem = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || 86400000, // 24h default
      version: options.version || 1
    };
    
    try {
      // Primary: IndexedDB (large data, structured)
      await this.indexedDB.set(key, storageItem);
    } catch (error) {
      // Fallback: localStorage (limited size)
      try {
        this.localStorage.set(key, storageItem);
      } catch (localStorageError) {
        // Last resort: memory (session only)
        this.memoryCache.set(key, storageItem);
      }
    }
  }
  
  async retrieve(key) {
    // Try IndexedDB first
    try {
      const item = await this.indexedDB.get(key);
      if (item && !this.isExpired(item)) {
        return item.data;
      }
    } catch (error) {
      // Fallback to localStorage
      const item = this.localStorage.get(key);
      if (item && !this.isExpired(item)) {
        return item.data;
      }
    }
    
    // Last resort: memory cache
    const item = this.memoryCache.get(key);
    if (item && !this.isExpired(item)) {
      return item.data;
    }
    
    return null;
  }
}
```

### Offline Game State Management
```javascript
class OfflineGameManager {
  constructor() {
    this.storage = new OfflineStorageManager();
    this.syncQueue = new OfflineOperationQueue();
  }
  
  // Save game state optimistically
  async saveGameState(gameState) {
    // Immediate local save
    await this.storage.store('current_game', gameState, {
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Queue for sync when online
    await this.syncQueue.enqueue({
      type: 'save_game_state',
      payload: gameState,
      priority: 'high'
    });
    
    return gameState;
  }
  
  // Load game state with fallback chain
  async loadGameState() {
    // Try local storage first
    const localState = await this.storage.retrieve('current_game');
    if (localState) {
      return localState;
    }
    
    // If online, try to fetch from server
    if (navigator.onLine) {
      try {
        const serverState = await this.fetchFromServer();
        if (serverState) {
          // Cache locally
          await this.storage.store('current_game', serverState);
          return serverState;
        }
      } catch (error) {
        console.warn('Failed to fetch from server:', error);
      }
    }
    
    // Return default state
    return this.getDefaultGameState();
  }
}
```

---

## 🔄 REAL-TIME SYNC IMPLEMENTATION

### Event-Driven Sync
```javascript
class RealtimeSyncManager {
  constructor() {
    this.eventBus = new EventBus();
    this.syncQueue = new OfflineOperationQueue();
    this.debounceTimers = new Map();
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Game events
    this.eventBus.on('point_scored', this.handlePointScored.bind(this));
    this.eventBus.on('game_finished', this.handleGameFinished.bind(this));
    this.eventBus.on('player_name_changed', this.handleNameChanged.bind(this));
    
    // Network events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  // Immediate sync for critical operations
  async handlePointScored(event) {
    await this.syncQueue.enqueue({
      type: 'point_scored',
      payload: event.data,
      priority: 'immediate'
    });
  }
  
  // Debounced sync for frequent operations
  handleNameChanged(event) {
    const key = `name_change_${event.data.player}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.syncQueue.enqueue({
        type: 'player_name_changed',
        payload: event.data,
        priority: 'low'
      });
      this.debounceTimers.delete(key);
    }, 1000); // 1 second debounce
    
    this.debounceTimers.set(key, timer);
  }
  
  // Resume sync when back online
  async handleOnline() {
    await this.syncQueue.processQueue();
  }
  
  // Pause sync when offline
  handleOffline() {
    this.syncQueue.pause();
  }
}
```

---

## 🛡️ DATA CONSISTENCY GUARANTEES

### ACID Properties Implementation
```javascript
class TransactionManager {
  constructor() {
    this.transactions = new Map();
  }
  
  // Atomic operations
  async executeTransaction(operations) {
    const transactionId = generateUUID();
    const transaction = {
      id: transactionId,
      operations,
      status: 'pending',
      rollbackData: new Map()
    };
    
    this.transactions.set(transactionId, transaction);
    
    try {
      // Execute all operations
      for (const operation of operations) {
        // Save rollback data before operation
        const currentState = await this.getCurrentState(operation.target);
        transaction.rollbackData.set(operation.target, currentState);
        
        // Execute operation
        await this.executeOperation(operation);
      }
      
      // Mark as committed
      transaction.status = 'committed';
      return { success: true, transactionId };
      
    } catch (error) {
      // Rollback on failure
      await this.rollbackTransaction(transaction);
      transaction.status = 'rolled_back';
      throw error;
    } finally {
      // Cleanup after delay
      setTimeout(() => {
        this.transactions.delete(transactionId);
      }, 60000); // Keep for 1 minute for debugging
    }
  }
  
  async rollbackTransaction(transaction) {
    // Rollback in reverse order
    const operations = [...transaction.operations].reverse();
    
    for (const operation of operations) {
      const rollbackData = transaction.rollbackData.get(operation.target);
      if (rollbackData) {
        await this.restoreState(operation.target, rollbackData);
      }
    }
  }
}
```

### Optimistic Locking
```javascript
class OptimisticLockManager {
  // Update with version check
  async updateWithLock(table, id, updates, currentVersion) {
    const result = await supabase
      .from(table)
      .update({
        ...updates,
        version: currentVersion + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('version', currentVersion)
      .select();
    
    if (result.data?.length === 0) {
      throw new OptimisticLockError('Record was modified by another process');
    }
    
    return result.data[0];
  }
  
  // Retry with fresh version on conflict
  async updateWithRetry(table, id, updateFn, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Fetch current version
        const current = await this.fetchCurrent(table, id);
        
        // Apply updates
        const updates = await updateFn(current);
        
        // Attempt update with version check
        return await this.updateWithLock(table, id, updates, current.version);
        
      } catch (error) {
        if (error instanceof OptimisticLockError && attempt < maxRetries - 1) {
          // Wait before retry with exponential backoff
          await this.sleep(Math.pow(2, attempt) * 100);
          continue;
        }
        throw error;
      }
    }
  }
}
```

---

## 📊 SYNC MONITORING & METRICS

### Performance Tracking
```javascript
class SyncMetrics {
  constructor() {
    this.metrics = {
      operationsQueued: 0,
      operationsProcessed: 0,
      operationsFailed: 0,
      averageProcessingTime: 0,
      conflictsDetected: 0,
      conflictsResolved: 0
    };
  }
  
  recordOperation(type, duration, success) {
    this.metrics.operationsProcessed++;
    
    if (!success) {
      this.metrics.operationsFailed++;
    }
    
    // Update average processing time
    this.updateAverageProcessingTime(duration);
    
    // Emit metrics for monitoring
    this.emitMetrics(type, { duration, success });
  }
  
  getHealthStatus() {
    const successRate = (this.metrics.operationsProcessed - this.metrics.operationsFailed) 
                       / this.metrics.operationsProcessed;
    
    return {
      healthy: successRate > 0.95 && this.metrics.averageProcessingTime < 1000,
      successRate,
      averageProcessingTime: this.metrics.averageProcessingTime,
      queueDepth: this.metrics.operationsQueued - this.metrics.operationsProcessed
    };
  }
}
```

### User-Facing Sync Status
```javascript
const SyncStatusComponent = () => {
  const { 
    syncStatus, 
    queueDepth, 
    lastSyncTime, 
    conflicts 
  } = useSyncStatus();
  
  return (
    <div className="sync-status-bar">
      {syncStatus === 'syncing' && (
        <div className="flex items-center text-blue-500">
          <AnimatedSpinner />
          <span>Sincronizando {queueDepth} cambios...</span>
        </div>
      )}
      
      {syncStatus === 'offline' && queueDepth > 0 && (
        <div className="flex items-center text-orange-500">
          <OfflineIcon />
          <span>{queueDepth} cambios pendientes</span>
          <small>Se sincronizarán al reconectar</small>
        </div>
      )}
      
      {conflicts.length > 0 && (
        <div className="flex items-center text-red-500">
          <AlertIcon />
          <span>{conflicts.length} conflictos requieren atención</span>
          <button onClick={() => showConflictDialog()}>
            Resolver
          </button>
        </div>
      )}
      
      {syncStatus === 'synced' && (
        <div className="flex items-center text-green-500">
          <CheckIcon />
          <span>Todo sincronizado</span>
          <small>Última actualización: {formatTime(lastSyncTime)}</small>
        </div>
      )}
    </div>
  );
};
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Core Sync Infrastructure
- [ ] **Offline operation queue** with persistence
- [ ] **Network status monitoring** and handling
- [ ] **Exponential backoff retry** mechanism
- [ ] **Conflict detection** and resolution
- [ ] **Optimistic UI** updates
- [ ] **Transaction management** for data consistency

### Sync Strategies
- [ ] **Immediate sync** for critical operations
- [ ] **Debounced sync** for frequent operations  
- [ ] **Batched sync** for background operations
- [ ] **Priority-based processing** queue
- [ ] **Intelligent retry logic** with backoff

### User Experience
- [ ] **Transparent sync** - user doesn't notice complexity
- [ ] **Clear status indicators** when sync is happening
- [ ] **Graceful error handling** with recovery options
- [ ] **Conflict resolution UI** for manual resolution
- [ ] **Offline mode messaging** to set expectations

### Monitoring & Debugging
- [ ] **Sync metrics** collection and monitoring
- [ ] **Error logging** with context and stack traces
- [ ] **Performance monitoring** for sync operations
- [ ] **Health checks** for sync system status
- [ ] **Debug tools** for troubleshooting sync issues