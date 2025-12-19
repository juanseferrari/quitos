# 🔄 ESTRATEGIA DE MIGRACIÓN DE DATOS

## 📋 OBJETIVO
Definir una estrategia comprensiva para migrar datos entre diferentes versiones de la aplicación, desde el modo local actual hasta el sistema cloud completo, garantizando cero pérdida de datos.

---

## 🎯 TIPOS DE MIGRACIÓN

### 1. Migración Local → Cloud (Fase 1)
Migrar datos del usuario de localStorage/AsyncStorage a Firebase cuando se autentica por primera vez.

### 2. Migración de Esquemas (Todas las fases)
Actualizar estructura de datos conforme evolucionan las features.

### 3. Migración de Versiones (Ongoing)
Mantener compatibilidad entre versiones de la app.

### 4. Migración Cross-Platform
Sincronizar datos entre diferentes dispositivos del mismo usuario.

---

## 🏗️ ARQUITECTURA DE MIGRACIÓN

### Data Migration Manager
```javascript
// services/DataMigrationManager.js
export class DataMigrationManager {
  constructor() {
    this.currentVersion = '1.0.0';
    this.migrations = new Map();
    this.backupManager = new BackupManager();
    this.validators = new Map();
    
    // Registrar todas las migraciones
    this.registerMigrations();
  }
  
  registerMigrations() {
    // Migración 0: Local → Cloud
    this.migrations.set('0.0.0->1.0.0', new LocalToCloudMigration());
    
    // Migración 1: Agregar sistema de logros
    this.migrations.set('1.0.0->1.1.0', new AddAchievementsMigration());
    
    // Migración 2: Agregar rivalidades
    this.migrations.set('1.1.0->1.2.0', new AddRivalriesMigration());
    
    // Migración 3: Agregar estadísticas avanzadas
    this.migrations.set('1.2.0->1.3.0', new AddAdvancedStatsMigration());
    
    // Migración 4: Normalizar estructura de equipos
    this.migrations.set('1.3.0->1.4.0', new NormalizeTeamsMigration());
  }
  
  async migrateUserData(userId, fromVersion, toVersion) {
    try {
      console.log(`Starting migration for ${userId}: ${fromVersion} → ${toVersion}`);
      
      // 1. Crear backup completo
      await this.backupManager.createFullBackup(userId, fromVersion);
      
      // 2. Obtener datos actuales
      const currentData = await this.getCurrentUserData(userId);
      
      // 3. Validar datos pre-migración
      await this.validateData(currentData, fromVersion);
      
      // 4. Aplicar migraciones secuenciales
      const migrationPath = this.getMigrationPath(fromVersion, toVersion);
      let migratedData = currentData;
      
      for (const migrationKey of migrationPath) {
        const migration = this.migrations.get(migrationKey);
        if (!migration) {
          throw new Error(`Migration not found: ${migrationKey}`);
        }
        
        console.log(`Applying migration: ${migrationKey}`);
        migratedData = await migration.migrate(migratedData);
        
        // Validar después de cada migración
        const targetVersion = migrationKey.split('->')[1];
        await this.validateData(migratedData, targetVersion);
      }
      
      // 5. Guardar datos migrados
      await this.saveUserData(userId, migratedData, toVersion);
      
      // 6. Verificar integridad final
      await this.verifyMigration(userId, currentData, migratedData);
      
      // 7. Limpiar backups antiguos (después de 30 días)
      await this.backupManager.scheduleCleanup(userId, 30);
      
      return {
        success: true,
        fromVersion,
        toVersion,
        migratedAt: Date.now(),
        backupId: await this.backupManager.getLatestBackupId(userId)
      };
      
    } catch (error) {
      console.error('Migration failed:', error);
      
      // Intentar rollback
      await this.rollbackMigration(userId, fromVersion);
      
      throw error;
    }
  }
  
  getMigrationPath(fromVersion, toVersion) {
    // Calcular secuencia de migraciones necesarias
    const path = [];
    let currentVersion = fromVersion;
    
    while (currentVersion !== toVersion) {
      const nextMigration = this.findNextMigration(currentVersion);
      if (!nextMigration) {
        throw new Error(`No migration path from ${currentVersion} to ${toVersion}`);
      }
      
      path.push(nextMigration);
      currentVersion = nextMigration.split('->')[1];
    }
    
    return path;
  }
  
  async rollbackMigration(userId, targetVersion) {
    try {
      console.log(`Rolling back migration for ${userId} to ${targetVersion}`);
      
      const backup = await this.backupManager.getBackup(userId, targetVersion);
      if (!backup) {
        throw new Error('No backup found for rollback');
      }
      
      await this.saveUserData(userId, backup.data, targetVersion);
      
      return { success: true, rolledBackTo: targetVersion };
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }
}
```

---

## 🔄 MIGRACIONES ESPECÍFICAS

### Migración 0: Local → Cloud
```javascript
// migrations/LocalToCloudMigration.js
export class LocalToCloudMigration {
  async migrate(localData) {
    try {
      // Estructura local actual
      const {
        historialCompleto = [],
        partidasJugadas = 0,
        victoriasLocales = 0,
        configuracionGuardada = null
      } = localData;
      
      // Transformar a estructura cloud
      const cloudData = {
        version: '1.0.0',
        migratedAt: Date.now(),
        migrationSource: 'local',
        
        // Datos del usuario
        user: {
          id: null, // será asignado
          createdAt: Date.now(),
          totalGamesPlayed: partidasJugadas,
          totalWins: victoriasLocales,
          winRate: partidasJugadas > 0 ? victoriasLocales / partidasJugadas : 0
        },
        
        // Historial de juegos
        games: this.transformGames(historialCompleto),
        
        // Configuración
        settings: this.transformSettings(configuracionGuardada),
        
        // Stats iniciales
        stats: this.calculateInitialStats(historialCompleto),
        
        // Nuevos campos
        achievements: [],
        rivalries: [],
        teams: []
      };
      
      return cloudData;
    } catch (error) {
      throw new Error(`Local to cloud migration failed: ${error.message}`);
    }
  }
  
  transformGames(historialCompleto) {
    return historialCompleto.map((game, index) => ({
      id: `migrated_${Date.now()}_${index}`,
      createdAt: game.fechaInicio || Date.now() - (index * 3600000), // Estimar fechas
      finishedAt: game.fechaFin || game.fechaInicio + 1800000, // 30 min promedio
      
      players: [
        {
          name: game.jugador1 || 'Nosotros',
          points: game.puntosNos || 0,
          isWinner: game.ganador === 'nos'
        },
        {
          name: game.jugador2 || 'Ellos', 
          points: game.puntosEllos || 0,
          isWinner: game.ganador === 'ellos'
        }
      ],
      
      gameMode: '1v1',
      totalPoints: game.puntosTotales || 30,
      moves: game.historial || [],
      duration: this.calculateDuration(game),
      
      // Metadata de migración
      migrated: true,
      originalData: game
    }));
  }
  
  transformSettings(configuracion) {
    return {
      theme: 'rey-del-truco',
      sounds: true,
      haptics: true,
      notifications: false,
      defaultGameMode: '1v1',
      defaultPoints: configuracion?.puntosTotales || 30,
      ...configuracion
    };
  }
  
  calculateInitialStats(games) {
    const totalGames = games.length;
    const wins = games.filter(g => g.ganador === 'nos').length;
    
    return {
      basic: {
        totalGames,
        totalWins: wins,
        totalLosses: totalGames - wins,
        winRate: totalGames > 0 ? wins / totalGames : 0,
        currentStreak: this.calculateCurrentStreak(games),
        bestWinStreak: this.calculateBestStreak(games, 'nos'),
        worstLossStreak: this.calculateBestStreak(games, 'ellos')
      },
      temporal: {
        last7Days: { games: 0, wins: 0, winRate: 0 },
        last30Days: { games: 0, wins: 0, winRate: 0 },
        thisMonth: { games: 0, wins: 0, winRate: 0 }
      }
    };
  }
}
```

### Migración 1: Agregar Sistema de Logros
```javascript
// migrations/AddAchievementsMigration.js
export class AddAchievementsMigration {
  async migrate(userData) {
    try {
      const migratedData = {
        ...userData,
        version: '1.1.0',
        
        // Agregar sistema de logros
        achievements: {
          unlocked: [],
          progress: this.calculateInitialProgress(userData),
          totalPoints: 0,
          level: 1
        },
        
        // Actualizar stats para incluir datos necesarios para logros
        stats: {
          ...userData.stats,
          advanced: {
            ...userData.stats.advanced,
            shutoutsGiven: this.countShutouts(userData.games, true),
            shutoutsReceived: this.countShutouts(userData.games, false),
            comebackWins: this.countComebacks(userData.games),
            perfectGames: this.countPerfectGames(userData.games)
          }
        }
      };
      
      // Calcular logros que deberían estar desbloqueados
      const unlockedAchievements = this.calculateRetroactiveAchievements(migratedData);
      migratedData.achievements.unlocked = unlockedAchievements;
      migratedData.achievements.totalPoints = this.calculateAchievementPoints(unlockedAchievements);
      
      return migratedData;
    } catch (error) {
      throw new Error(`Add achievements migration failed: ${error.message}`);
    }
  }
  
  calculateRetroactiveAchievements(userData) {
    const unlocked = [];
    const { totalWins, totalGames } = userData.stats.basic;
    
    // Logros por victorias
    if (totalWins >= 1) unlocked.push('first_blood');
    if (totalWins >= 10) unlocked.push('warming_up');
    if (totalWins >= 25) unlocked.push('on_fire');
    if (totalWins >= 50) unlocked.push('unstoppable');
    if (totalWins >= 100) unlocked.push('legendary');
    
    // Logros por juegos
    if (totalGames >= 5) unlocked.push('getting_started');
    if (totalGames >= 25) unlocked.push('regular_player');
    if (totalGames >= 100) unlocked.push('dedicated');
    
    return unlocked;
  }
}
```

---

## 💾 SISTEMA DE BACKUP

### Backup Manager
```javascript
// services/BackupManager.js
export class BackupManager {
  constructor() {
    this.compressionEnabled = true;
    this.encryptionEnabled = true;
  }
  
  async createFullBackup(userId, version) {
    try {
      const timestamp = Date.now();
      const backupId = `backup_${userId}_${version}_${timestamp}`;
      
      // 1. Recopilar todos los datos del usuario
      const userData = await this.gatherAllUserData(userId);
      
      // 2. Crear metadata del backup
      const metadata = {
        backupId,
        userId,
        version,
        timestamp,
        dataSize: this.calculateDataSize(userData),
        checksum: this.calculateChecksum(userData),
        platform: Platform.OS,
        appVersion: getAppVersion()
      };
      
      // 3. Comprimir datos si está habilitado
      let backupData = userData;
      if (this.compressionEnabled) {
        backupData = await this.compressData(userData);
        metadata.compressed = true;
      }
      
      // 4. Encriptar si está habilitado
      if (this.encryptionEnabled) {
        backupData = await this.encryptData(backupData, userId);
        metadata.encrypted = true;
      }
      
      // 5. Guardar backup
      await this.saveBackup(backupId, {
        metadata,
        data: backupData
      });
      
      // 6. Guardar en múltiples ubicaciones
      await Promise.all([
        this.saveToFirestore(backupId, metadata, backupData),
        this.saveToLocalStorage(backupId, metadata, backupData),
        this.saveToSecureStorage(backupId, metadata) // Solo metadata
      ]);
      
      return backupId;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }
  
  async restoreFromBackup(backupId, userId) {
    try {
      // 1. Obtener backup
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }
      
      // 2. Verificar integridad
      const isValid = await this.verifyBackupIntegrity(backup);
      if (!isValid) {
        throw new Error('Backup integrity check failed');
      }
      
      // 3. Desencriptar si es necesario
      let backupData = backup.data;
      if (backup.metadata.encrypted) {
        backupData = await this.decryptData(backupData, userId);
      }
      
      // 4. Descomprimir si es necesario
      if (backup.metadata.compressed) {
        backupData = await this.decompressData(backupData);
      }
      
      // 5. Validar estructura de datos
      await this.validateRestoredData(backupData, backup.metadata.version);
      
      return backupData;
    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw error;
    }
  }
  
  async saveToFirestore(backupId, metadata, data) {
    const chunkSize = 1000000; // 1MB chunks para no exceder límites de Firestore
    const chunks = this.chunkData(data, chunkSize);
    
    const batch = firestore().batch();
    
    // Guardar metadata
    const metadataRef = firestore().collection('backups').doc(backupId);
    batch.set(metadataRef, {
      ...metadata,
      totalChunks: chunks.length
    });
    
    // Guardar chunks
    chunks.forEach((chunk, index) => {
      const chunkRef = firestore().collection('backup_chunks').doc(`${backupId}_${index}`);
      batch.set(chunkRef, {
        backupId,
        chunkIndex: index,
        data: chunk,
        createdAt: Date.now()
      });
    });
    
    await batch.commit();
  }
  
  async scheduleCleanup(userId, retentionDays) {
    const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    try {
      // Obtener backups antiguos
      const oldBackups = await firestore()
        .collection('backups')
        .where('userId', '==', userId)
        .where('timestamp', '<', cutoffDate)
        .get();
      
      // Eliminar en lotes
      const batch = firestore().batch();
      
      oldBackups.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      // También limpiar chunks asociados
      await this.cleanupOrphanedChunks();
      
    } catch (error) {
      console.error('Backup cleanup failed:', error);
    }
  }
}
```

---

## ✅ VALIDADORES DE DATOS

### Data Validators
```javascript
// validators/DataValidators.js
export class DataValidators {
  static validateUserData(data, version) {
    const validator = this.getValidatorForVersion(version);
    return validator.validate(data);
  }
  
  static getValidatorForVersion(version) {
    switch (version) {
      case '1.0.0':
        return new V1_0_0_Validator();
      case '1.1.0':
        return new V1_1_0_Validator();
      case '1.2.0':
        return new V1_2_0_Validator();
      default:
        return new LatestValidator();
    }
  }
}

class V1_0_0_Validator {
  validate(data) {
    const errors = [];
    
    // Validar estructura básica
    if (!data.user || typeof data.user !== 'object') {
      errors.push('Invalid user object');
    }
    
    if (!Array.isArray(data.games)) {
      errors.push('Invalid games array');
    }
    
    if (!data.stats || typeof data.stats !== 'object') {
      errors.push('Invalid stats object');
    }
    
    // Validar cada juego
    data.games?.forEach((game, index) => {
      if (!game.id || !game.players || !Array.isArray(game.players)) {
        errors.push(`Invalid game at index ${index}`);
      }
      
      if (game.players?.length !== 2) {
        errors.push(`Game ${index} must have exactly 2 players`);
      }
    });
    
    // Validar stats básicas
    if (data.stats?.basic) {
      const basic = data.stats.basic;
      if (typeof basic.totalGames !== 'number' || basic.totalGames < 0) {
        errors.push('Invalid totalGames in stats');
      }
      
      if (typeof basic.winRate !== 'number' || basic.winRate < 0 || basic.winRate > 1) {
        errors.push('Invalid winRate in stats');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

class V1_1_0_Validator extends V1_0_0_Validator {
  validate(data) {
    // Validaciones de versión anterior
    const baseValidation = super.validate(data);
    
    // Validaciones específicas de v1.1.0
    const errors = [...baseValidation.errors];
    
    // Validar sistema de logros
    if (!data.achievements || typeof data.achievements !== 'object') {
      errors.push('Missing achievements object in v1.1.0');
    }
    
    if (data.achievements) {
      if (!Array.isArray(data.achievements.unlocked)) {
        errors.push('Invalid achievements.unlocked array');
      }
      
      if (typeof data.achievements.totalPoints !== 'number') {
        errors.push('Invalid achievements.totalPoints');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

---

## 🔧 TESTING DE MIGRACIÓN

### Migration Test Suite
```javascript
// __tests__/migration.test.js
describe('Data Migration', () => {
  let migrationManager;
  let mockBackupManager;
  
  beforeEach(() => {
    mockBackupManager = new MockBackupManager();
    migrationManager = new DataMigrationManager(mockBackupManager);
  });
  
  test('migrates local data to cloud correctly', async () => {
    const localData = {
      historialCompleto: [
        {
          fechaInicio: Date.now() - 10000,
          fechaFin: Date.now(),
          jugador1: 'Juan',
          jugador2: 'Carlos',
          puntosNos: 30,
          puntosEllos: 24,
          ganador: 'nos'
        }
      ],
      partidasJugadas: 1,
      victoriasLocales: 1
    };
    
    const migration = new LocalToCloudMigration();
    const result = await migration.migrate(localData);
    
    expect(result.version).toBe('1.0.0');
    expect(result.games).toHaveLength(1);
    expect(result.user.totalGamesPlayed).toBe(1);
    expect(result.user.totalWins).toBe(1);
    expect(result.stats.basic.winRate).toBe(1.0);
  });
  
  test('handles migration rollback correctly', async () => {
    const userId = 'test-user';
    const fromVersion = '1.0.0';
    const toVersion = '1.1.0';
    
    // Simular fallo en migración
    const mockMigration = {
      migrate: jest.fn().mockRejectedValue(new Error('Migration failed'))
    };
    
    migrationManager.migrations.set('1.0.0->1.1.0', mockMigration);
    
    // Configurar backup para rollback
    const backupData = { version: '1.0.0', user: { id: userId } };
    mockBackupManager.setBackup(userId, fromVersion, backupData);
    
    try {
      await migrationManager.migrateUserData(userId, fromVersion, toVersion);
      fail('Should have thrown error');
    } catch (error) {
      expect(error.message).toBe('Migration failed');
    }
    
    // Verificar que se intentó rollback
    expect(mockBackupManager.getBackup).toHaveBeenCalledWith(userId, fromVersion);
  });
  
  test('validates data integrity during migration', async () => {
    const invalidData = {
      user: null, // Invalid
      games: 'not-an-array', // Invalid
      stats: undefined // Invalid
    };
    
    const validator = new V1_0_0_Validator();
    const result = validator.validate(invalidData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid user object');
    expect(result.errors).toContain('Invalid games array');
    expect(result.errors).toContain('Invalid stats object');
  });
  
  test('creates and restores backups correctly', async () => {
    const userId = 'test-user';
    const version = '1.0.0';
    const userData = {
      user: { id: userId },
      games: [],
      stats: { basic: { totalGames: 0 } }
    };
    
    const backupManager = new BackupManager();
    
    // Crear backup
    const backupId = await backupManager.createFullBackup(userId, version);
    expect(backupId).toBeTruthy();
    
    // Restaurar backup
    const restored = await backupManager.restoreFromBackup(backupId, userId);
    expect(restored).toEqual(userData);
  });
});
```

---

## 📊 MONITORING Y ALERTAS

### Migration Monitor
```javascript
// services/MigrationMonitor.js
export class MigrationMonitor {
  static async trackMigration(migrationInfo) {
    try {
      const event = {
        type: 'data_migration',
        timestamp: Date.now(),
        userId: migrationInfo.userId,
        fromVersion: migrationInfo.fromVersion,
        toVersion: migrationInfo.toVersion,
        success: migrationInfo.success,
        duration: migrationInfo.duration,
        dataSize: migrationInfo.dataSize,
        errorMessage: migrationInfo.error?.message,
        platform: Platform.OS,
        appVersion: getAppVersion()
      };
      
      // Enviar a analytics
      await this.sendAnalyticsEvent(event);
      
      // Alertas para fallos
      if (!migrationInfo.success) {
        await this.sendAlert('Migration Failed', event);
      }
      
      // Alertas para migraciones muy lentas
      if (migrationInfo.duration > 30000) { // 30 segundos
        await this.sendAlert('Slow Migration', event);
      }
      
    } catch (error) {
      console.error('Failed to track migration:', error);
    }
  }
  
  static async sendAlert(type, data) {
    // Implementar sistema de alertas
    // Puede ser email, Slack, etc.
    console.warn(`MIGRATION ALERT: ${type}`, data);
  }
}
```

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### Fase 0 (Foundation)
- [ ] BackupManager básico
- [ ] Validadores de datos
- [ ] Tests de migración

### Fase 1 (Auth)
- [ ] LocalToCloudMigration
- [ ] Migration manager completo
- [ ] Monitoring y alertas

### Fase 2+ (Evolutiva)
- [ ] Nuevas migraciones según features
- [ ] Optimización de performance
- [ ] Backup automático

---

## 🚨 CRITERIOS DE ÉXITO

- **Zero Data Loss**: 0% pérdida de datos en migración
- **Rollback Success**: 100% éxito en rollbacks cuando es necesario
- **Validation Accuracy**: 100% precisión en validación de datos
- **Performance**: <30 segundos para migraciones típicas
- **Monitoring Coverage**: 100% de migraciones monitoreadas

---

*Sistema crítico que garantiza la integridad de datos durante toda la evolución de la aplicación.*