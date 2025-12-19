# 🏆 FASE 5: ACHIEVEMENTS & GAMIFICATION

**Tiempo estimado: 2-3 semanas**  
**Prioridad: MEDIA**  
**Estado: Pendiente**  
**Dependencias: Fase 1 (Auth) + Fase 3 (Data) + Fase 4 (Social) completadas**

## 🎯 OBJETIVO PRINCIPAL

Transformar el sistema de achievements actual (mock) en un motor de gamificación real, server-side, anti-cheat, con progresión complexa, eventos especiales, y sistema de recompensas que maximice engagement y retención de usuarios.

## 📋 TAREAS PRINCIPALES

### 5.1 Achievement Engine Real (2 semanas)
- [ ] Server-side achievement verification
- [ ] Anti-cheat mechanisms  
- [ ] Complex progression tracking
- [ ] Real-time achievement unlocks
- [ ] Achievement dependency chains

### 5.2 Gamification Systems (1 semana)
- [ ] Daily/Weekly/Monthly challenges
- [ ] Seasonal events y limited achievements
- [ ] Badge/Trophy collection system
- [ ] Achievement point economy
- [ ] Prestige/Mastery progression

### 5.3 Social Achievement Features (3-4 días)
- [ ] Achievement sharing y bragging rights
- [ ] Community challenges
- [ ] Achievement-based leaderboards
- [ ] Achievement comparisons entre friends
- [ ] Collaborative achievements

---

## 🏗️ ACHIEVEMENT ENGINE ARCHITECTURE

### Server-Side Verification System
```javascript
// Achievement verification pipeline
class AchievementEngine {
  constructor() {
    this.verificationPipeline = [
      new DataValidationStep(),
      new AntiCheatDetectionStep(),
      new ProgressCalculationStep(),
      new UnlockEligibilityStep(),
      new RewardDistributionStep()
    ];
  }
  
  // Process achievement verification request
  async verifyAchievement(userId, achievementId, gameData) {
    const context = {
      userId,
      achievementId,
      gameData,
      timestamp: Date.now(),
      userHistory: await this.getUserHistory(userId),
      achievement: await this.getAchievementDefinition(achievementId)
    };
    
    // Run through verification pipeline
    for (const step of this.verificationPipeline) {
      const result = await step.process(context);
      
      if (!result.isValid) {
        await this.logSuspiciousActivity(userId, achievementId, result.reason);
        return { success: false, reason: result.reason };
      }
      
      // Update context with step results
      context = { ...context, ...result.updates };
    }
    
    // All verifications passed - unlock achievement
    return await this.unlockAchievement(context);
  }
}
```

### Anti-Cheat Mechanisms
```javascript
class AntiCheatDetectionStep {
  async process(context) {
    const { userId, gameData, userHistory } = context;
    
    // Statistical anomaly detection
    const anomalies = await this.detectAnomalies(gameData, userHistory);
    if (anomalies.length > 0) {
      return { 
        isValid: false, 
        reason: 'statistical_anomaly',
        details: anomalies 
      };
    }
    
    // Timing analysis (too fast completion)
    if (this.isSuspiciouslyFast(gameData)) {
      return { 
        isValid: false, 
        reason: 'completion_too_fast' 
      };
    }
    
    // Pattern recognition (repeated identical actions)
    if (this.hasRepeatedPatterns(gameData.historial)) {
      return { 
        isValid: false, 
        reason: 'repeated_patterns' 
      };
    }
    
    // Device/client validation
    const deviceFingerprint = await this.getDeviceFingerprint(userId);
    if (this.isDeviceCompromised(deviceFingerprint)) {
      return { 
        isValid: false, 
        reason: 'compromised_device' 
      };
    }
    
    return { isValid: true };
  }
  
  detectAnomalies(gameData, userHistory) {
    const anomalies = [];
    
    // Score progression anomaly
    const avgGameDuration = this.calculateAverageGameDuration(userHistory);
    if (gameData.duration < avgGameDuration * 0.3) {
      anomalies.push('unusually_short_game');
    }
    
    // Win rate anomaly
    const recentWinRate = this.calculateRecentWinRate(userHistory, 10);
    if (recentWinRate > 0.95 && userHistory.length > 10) {
      anomalies.push('impossible_win_rate');
    }
    
    return anomalies;
  }
}
```

### Complex Achievement Definitions
```sql
-- Enhanced achievements table with complex criteria
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🏆',
  
  -- Difficulty and progression
  difficulty VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond
  tier INTEGER DEFAULT 1,                  -- Multiple tiers per achievement
  points INTEGER DEFAULT 10,               -- Achievement points
  
  -- Complex unlock criteria
  criteria JSONB NOT NULL,                 -- Main criteria
  prerequisites JSONB,                     -- Required achievements
  time_constraints JSONB,                  -- Time-based requirements
  social_requirements JSONB,               -- Social criteria
  
  -- Metadata
  is_secret BOOLEAN DEFAULT FALSE,
  is_seasonal BOOLEAN DEFAULT FALSE,
  season_id VARCHAR(20),
  expires_at TIMESTAMP,
  
  -- Rewards
  rewards JSONB,                           -- Coins, badges, titles, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complex achievement examples
INSERT INTO achievements (id, category, name, description, criteria, prerequisites, rewards) VALUES 
(
  'perfectionist_gold', 
  'maestria', 
  'Perfeccionista Dorado', 
  'Ganá 5 partidos perfectos (30-0) en una semana',
  '{
    "type": "perfect_games_timeframe",
    "perfect_games": 5,
    "timeframe_days": 7,
    "points_required": 30
  }',
  '["perfectionist_bronze", "perfectionist_silver"]',
  '{
    "coins": 1000,
    "title": "Perfeccionista Dorado",
    "badge": "perfect_gold"
  }'
),
(
  'social_butterfly', 
  'social', 
  'Mariposa Social', 
  'Jugá contra 10 amigos diferentes en un mes',
  '{
    "type": "unique_friend_games",
    "unique_friends": 10,
    "timeframe_days": 30
  }',
  '["first_friend", "friend_challenger"]',
  '{
    "coins": 500,
    "title": "Mariposa Social"
  }'
);
```

---

## 🎮 GAMIFICATION SYSTEMS

### Daily/Weekly Challenge System
```javascript
class ChallengeSystem {
  // Generate personalized daily challenges
  async generateDailyChallenges(userId) {
    const userProfile = await this.getUserProfile(userId);
    const challenges = [];
    
    // Skill-based challenges
    challenges.push(this.generateSkillChallenge(userProfile));
    
    // Social challenges  
    challenges.push(this.generateSocialChallenge(userProfile));
    
    // Progress challenges
    challenges.push(this.generateProgressChallenge(userProfile));
    
    // Store challenges with expiration
    await this.storeDailyChallenges(userId, challenges);
    
    return challenges;
  }
  
  generateSkillChallenge(userProfile) {
    const templates = [
      {
        id: 'win_streak',
        name: 'Racha Victoriosa',
        description: 'Ganá {target} partidos seguidos',
        target: this.calculateSkillTarget(userProfile.skill_level, 'win_streak'),
        reward: { coins: 100, xp: 50 }
      },
      {
        id: 'points_efficiency', 
        name: 'Eficiencia Pura',
        description: 'Ganá una partida en menos de {target} puntos',
        target: Math.max(16, userProfile.average_winning_score - 5),
        reward: { coins: 150, xp: 75 }
      }
    ];
    
    return this.selectRandomTemplate(templates, userProfile);
  }
  
  // Weekly meta-challenges
  async generateWeeklyChallenges() {
    return [
      {
        id: 'weekly_games',
        name: 'Guerrero Semanal',
        description: 'Jugá 20 partidos esta semana',
        target: 20,
        progress_type: 'cumulative',
        reward: { coins: 500, title: 'Guerrero Semanal' }
      },
      {
        id: 'weekly_social',
        name: 'Conexión Social',
        description: 'Jugá contra 5 amigos diferentes',
        target: 5,
        progress_type: 'unique_count',
        reward: { coins: 300, badge: 'social_weekly' }
      }
    ];
  }
}
```

### Seasonal Events System
```javascript
class SeasonalEventsSystem {
  // Define seasonal events
  async createSeasonalEvent(eventConfig) {
    const event = {
      id: eventConfig.id,
      name: eventConfig.name,
      description: eventConfig.description,
      start_date: eventConfig.startDate,
      end_date: eventConfig.endDate,
      
      // Event-specific achievements
      achievements: eventConfig.achievements,
      
      // Special rules/modifiers
      game_modifiers: eventConfig.gameModifiers,
      
      // Exclusive rewards
      exclusive_rewards: eventConfig.exclusiveRewards
    };
    
    await supabase.from('seasonal_events').insert(event);
    
    // Generate event achievements
    for (const achievement of event.achievements) {
      await this.createEventAchievement(achievement, event.id);
    }
    
    return event;
  }
  
  // Example: World Cup event
  async createWorldCupEvent() {
    return await this.createSeasonalEvent({
      id: 'world_cup_2024',
      name: 'Mundial de Truco 2024',
      description: 'Evento especial durante el Mundial de Fútbol',
      startDate: '2024-06-14',
      endDate: '2024-07-14',
      
      achievements: [
        {
          id: 'mundial_champion',
          name: 'Campeón Mundial',
          description: 'Ganá 32 partidos durante el evento',
          criteria: { wins_during_event: 32 },
          rewards: { 
            coins: 2024, 
            title: 'Campeón Mundial 2024',
            exclusive_badge: 'mundial_trophy'
          }
        }
      ],
      
      gameModifiers: {
        double_points: true,        // Doble puntos de achievement
        special_celebrations: true  // Celebraciones temáticas
      }
    });
  }
}
```

### Progression & Mastery System
```javascript
class ProgressionSystem {
  // Multi-tier progression for achievements
  async calculateAchievementProgress(userId, achievementId) {
    const achievement = await this.getAchievement(achievementId);
    const userStats = await this.getUserStats(userId);
    
    // Calculate current progress
    const progress = this.evaluateCriteria(achievement.criteria, userStats);
    
    // Check for tier progression
    const currentTier = await this.getCurrentTier(userId, achievementId);
    const nextTier = this.getNextTier(achievement, currentTier);
    
    return {
      current_progress: progress.current,
      target: progress.target,
      percentage: Math.min(100, (progress.current / progress.target) * 100),
      current_tier: currentTier,
      next_tier: nextTier,
      can_advance: progress.current >= progress.target
    };
  }
  
  // Prestige system for master players
  async calculatePrestigeLevel(userId) {
    const userAchievements = await this.getUserAchievements(userId);
    
    // Points from different achievement categories
    const categoryPoints = {
      'victorias': 0,
      'puntos': 0, 
      'racha': 0,
      'especiales': 0,
      'maestria': 0,
      'social': 0
    };
    
    userAchievements.forEach(achievement => {
      const points = achievement.points * this.getTierMultiplier(achievement.tier);
      categoryPoints[achievement.category] += points;
    });
    
    // Calculate prestige level (requires mastery in multiple categories)
    const totalPoints = Object.values(categoryPoints).reduce((a, b) => a + b, 0);
    const prestigeLevel = Math.floor(totalPoints / 10000); // 10k points per prestige level
    
    return {
      prestige_level: prestigeLevel,
      total_points: totalPoints,
      points_to_next: 10000 - (totalPoints % 10000),
      category_breakdown: categoryPoints
    };
  }
}
```

---

## 🎖️ ACHIEVEMENT TYPES & CATEGORIES

### Enhanced Achievement Categories
```javascript
const enhancedAchievementCategories = {
  VICTORIAS: {
    name: 'Victorias',
    icon: '🏆',
    color: '#FFD700',
    achievements: [
      // Tiered progression
      { id: 'wins_1', name: 'Primera Victoria', target: 1, tier: 1 },
      { id: 'wins_10', name: 'Veterano', target: 10, tier: 2 },
      { id: 'wins_50', name: 'Experimentado', target: 50, tier: 3 },
      { id: 'wins_100', name: 'Maestro', target: 100, tier: 4 },
      { id: 'wins_500', name: 'Leyenda', target: 500, tier: 5 },
      { id: 'wins_1000', name: 'Rey del Truco', target: 1000, tier: 6 }
    ]
  },
  
  MAESTRIA: {
    name: 'Maestría',
    icon: '🎯',
    color: '#9D4EDD',
    achievements: [
      {
        id: 'perfect_game',
        name: 'Juego Perfecto',
        description: 'Ganá 30-0',
        criteria: { perfect_win: true },
        difficulty: 'gold'
      },
      {
        id: 'speed_demon',
        name: 'Demonio de Velocidad', 
        description: 'Ganá una partida en menos de 5 minutos',
        criteria: { max_duration_minutes: 5, must_win: true },
        difficulty: 'silver'
      },
      {
        id: 'comeback_king',
        name: 'Rey de la Remontada',
        description: 'Ganá después de estar 0-25',
        criteria: { comeback_from_deficit: 25 },
        difficulty: 'platinum'
      }
    ]
  },
  
  SOCIAL: {
    name: 'Social',
    icon: '👥', 
    color: '#06D6A0',
    achievements: [
      {
        id: 'first_friend',
        name: 'Primer Amigo',
        description: 'Agregá tu primer amigo',
        criteria: { friends_count: 1 }
      },
      {
        id: 'challenger',
        name: 'Desafiante',
        description: 'Enviá 10 desafíos',
        criteria: { challenges_sent: 10 }
      },
      {
        id: 'community_leader',
        name: 'Líder Comunitario',
        description: 'Tené 50 amigos activos',
        criteria: { 
          friends_count: 50,
          friends_active_last_week: 25
        },
        difficulty: 'platinum'
      }
    ]
  },
  
  COMPETITIVO: {
    name: 'Competitivo',
    icon: '⚔️',
    color: '#EF476F',
    achievements: [
      {
        id: 'elo_climber',
        name: 'Escalador ELO',
        description: 'Alcanzá 1500 de rating',
        criteria: { min_elo_rating: 1500 }
      },
      {
        id: 'tournament_winner',
        name: 'Campeón de Torneo',
        description: 'Ganá un torneo oficial',
        criteria: { tournament_wins: 1 },
        difficulty: 'diamond'
      },
      {
        id: 'undefeated',
        name: 'Invicto',
        description: 'Ganá 20 desafíos seguidos',
        criteria: { challenge_win_streak: 20 },
        difficulty: 'platinum'
      }
    ]
  },
  
  TEMPORAL: {
    name: 'Temporal',
    icon: '⏰',
    color: '#F77F00',
    achievements: [
      {
        id: 'daily_warrior',
        name: 'Guerrero Diario',
        description: 'Jugá todos los días por una semana',
        criteria: { 
          consecutive_days_played: 7,
          min_games_per_day: 1
        },
        time_constraint: { window_days: 7 }
      },
      {
        id: 'weekend_crusher',
        name: 'Destructor de Fin de Semana',
        description: 'Ganá 20 partidos en un fin de semana',
        criteria: { 
          wins_in_timeframe: 20,
          timeframe_type: 'weekend'
        }
      }
    ]
  },
  
  ESPECIALES: {
    name: 'Especiales',
    icon: '✨',
    color: '#B5179E',
    achievements: [
      {
        id: 'easter_egg_hunter',
        name: 'Cazador de Secretos',
        description: 'Descubrí 5 easter eggs',
        criteria: { easter_eggs_found: 5 },
        is_secret: true
      },
      {
        id: 'beta_tester',
        name: 'Beta Tester Legendario',
        description: 'Participaste del desarrollo',
        criteria: { is_beta_user: true },
        is_legacy: true,
        difficulty: 'diamond'
      }
    ]
  }
};
```

---

## 🔄 REAL-TIME ACHIEVEMENT SYSTEM

### Event-Driven Achievement Tracking
```javascript
class RealtimeAchievementTracker {
  constructor() {
    this.eventBus = new EventBus();
    this.achievementQueue = new PriorityQueue();
    this.debounceTimers = new Map();
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Game events
    this.eventBus.on('game_finished', this.handleGameFinished.bind(this));
    this.eventBus.on('point_scored', this.handlePointScored.bind(this));
    this.eventBus.on('falta_envido', this.handleFaltaEnvido.bind(this));
    
    // Social events
    this.eventBus.on('friend_added', this.handleFriendAdded.bind(this));
    this.eventBus.on('challenge_sent', this.handleChallengeSent.bind(this));
    this.eventBus.on('challenge_won', this.handleChallengeWon.bind(this));
    
    // Special events
    this.eventBus.on('easter_egg_found', this.handleEasterEggFound.bind(this));
    this.eventBus.on('daily_login', this.handleDailyLogin.bind(this));
  }
  
  async handleGameFinished(event) {
    const { userId, gameData } = event;
    
    // Queue multiple achievement checks
    const potentialAchievements = [
      'win_achievements',
      'score_achievements', 
      'streak_achievements',
      'mastery_achievements',
      'speed_achievements'
    ];
    
    for (const category of potentialAchievements) {
      await this.queueAchievementCheck(userId, category, gameData);
    }
  }
  
  async queueAchievementCheck(userId, category, data, priority = 'normal') {
    const checkItem = {
      userId,
      category,
      data,
      timestamp: Date.now(),
      priority: this.getPriorityValue(priority)
    };
    
    this.achievementQueue.enqueue(checkItem);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processAchievementQueue();
    }
  }
  
  async processAchievementQueue() {
    this.isProcessing = true;
    
    while (!this.achievementQueue.isEmpty()) {
      const item = this.achievementQueue.dequeue();
      
      try {
        await this.processAchievementCheck(item);
      } catch (error) {
        console.error('Achievement check failed:', error);
        // Retry with lower priority
        if (item.retryCount < 3) {
          item.retryCount = (item.retryCount || 0) + 1;
          item.priority -= 1;
          this.achievementQueue.enqueue(item);
        }
      }
    }
    
    this.isProcessing = false;
  }
}
```

### Achievement Notification System
```javascript
class AchievementNotificationSystem {
  // Show epic achievement unlock animation
  async showAchievementUnlock(achievement, user) {
    const notification = {
      id: generateUUID(),
      type: 'achievement_unlock',
      achievement,
      user,
      timestamp: Date.now(),
      
      // Animation configuration
      animation: this.getAchievementAnimation(achievement.difficulty),
      sound: this.getAchievementSound(achievement.difficulty),
      duration: this.getNotificationDuration(achievement.difficulty)
    };
    
    // Show local notification immediately
    this.showLocalNotification(notification);
    
    // Send to other platforms if user is multi-device
    await this.sendCrossDeviceNotification(user.id, notification);
    
    // Social sharing prompt for rare achievements
    if (achievement.difficulty === 'platinum' || achievement.difficulty === 'diamond') {
      setTimeout(() => {
        this.showSharingPrompt(achievement);
      }, notification.duration + 1000);
    }
  }
  
  getAchievementAnimation(difficulty) {
    const animations = {
      'bronze': 'bronze_glow',
      'silver': 'silver_sparkle', 
      'gold': 'gold_explosion',
      'platinum': 'platinum_burst',
      'diamond': 'diamond_supernova'
    };
    
    return animations[difficulty] || 'bronze_glow';
  }
  
  // Achievement sharing to social media
  async shareAchievement(achievementId, userId) {
    const achievement = await this.getAchievement(achievementId);
    const user = await this.getUser(userId);
    
    const shareData = {
      title: `¡${user.name} desbloqueó "${achievement.name}"!`,
      text: achievement.description,
      url: `https://reydeltruco.com/achievement/${achievementId}`,
      image: await this.generateAchievementImage(achievement, user)
    };
    
    // Native sharing if available
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback to social media buttons
      this.showSocialMediaOptions(shareData);
    }
  }
}
```

---

## 📊 ACHIEVEMENT ANALYTICS & OPTIMIZATION

### Achievement Performance Metrics
```javascript
class AchievementAnalytics {
  // Track achievement unlock rates
  async getAchievementMetrics(achievementId, timeframe = '30d') {
    const metrics = await supabase
      .from('user_achievements')
      .select('unlocked_at, user_id')
      .eq('achievement_id', achievementId)
      .gte('unlocked_at', this.getTimeframeStart(timeframe));
    
    const totalUsers = await this.getTotalActiveUsers(timeframe);
    const unlockRate = (metrics.data.length / totalUsers) * 100;
    
    return {
      total_unlocks: metrics.data.length,
      unlock_rate: unlockRate,
      difficulty_rating: this.calculateDifficultyRating(unlockRate),
      average_time_to_unlock: await this.calculateAverageTimeToUnlock(achievementId),
      user_feedback: await this.getAchievementFeedback(achievementId)
    };
  }
  
  // A/B testing for achievement designs
  async runAchievementABTest(achievementId, variants) {
    const testConfig = {
      achievement_id: achievementId,
      variants: variants.map((variant, index) => ({
        variant_id: `${achievementId}_v${index}`,
        name: variant.name,
        description: variant.description,
        criteria: variant.criteria,
        rewards: variant.rewards
      })),
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metrics_to_track: [
        'unlock_rate',
        'time_to_unlock', 
        'user_satisfaction',
        'sharing_rate'
      ]
    };
    
    await this.createABTest(testConfig);
    return testConfig;
  }
  
  // Dynamic achievement difficulty adjustment
  async adjustAchievementDifficulty() {
    const achievements = await this.getAllAchievements();
    
    for (const achievement of achievements) {
      const metrics = await this.getAchievementMetrics(achievement.id);
      
      // Too easy (>80% unlock rate)
      if (metrics.unlock_rate > 80) {
        await this.suggestDifficultyIncrease(achievement, metrics);
      }
      
      // Too hard (<5% unlock rate after 90 days)
      if (metrics.unlock_rate < 5 && this.getDaysSinceCreation(achievement) > 90) {
        await this.suggestDifficultyDecrease(achievement, metrics);
      }
    }
  }
}
```

---

## ✅ DEFINITION OF DONE

### Core Achievement Engine
- [ ] **Server-side verification** completo y anti-cheat
- [ ] **Real-time achievement tracking** sin lag perceptible
- [ ] **Complex progression chains** funcionando correctamente
- [ ] **Achievement dependencies** respetadas
- [ ] **Seasonal/event achievements** system activo

### Gamification Features
- [ ] **Daily challenges** generados dinámicamente
- [ ] **Weekly/Monthly challenges** with proper reset
- [ ] **Seasonal events** con achievements exclusivos
- [ ] **Prestige progression** para players avanzados
- [ ] **Achievement point economy** balanceada

### User Experience
- [ ] **Epic unlock animations** para todas las dificultades
- [ ] **Social sharing** de achievements funcionando
- [ ] **Achievement comparison** entre amigos
- [ ] **Progress tracking** claro y motivante
- [ ] **Notification system** no intrusivo pero engaging

### Technical Quality
- [ ] **Performance optimized** para tracking en tiempo real
- [ ] **Anti-cheat protection** robusto
- [ ] **Analytics integration** completa
- [ ] **A/B testing capability** para optimización
- [ ] **Scalable architecture** para nuevos achievements

---

## 📈 SUCCESS METRICS

- **Engagement**: 80%+ users unlock at least 1 achievement per week
- **Retention**: 25%+ improvement en user retention
- **Progression**: 60%+ users actively working toward achievement goals
- **Social**: 40%+ achievement unlocks are shared
- **Performance**: <100ms achievement verification time

---

## 🔗 DEPENDENCIES  

### External
- Analytics platform for achievement metrics
- Push notification service for achievement alerts
- Social media APIs for sharing
- A/B testing platform for optimization

### Internal
- Phase 1 (Authentication) - user accounts and verification
- Phase 3 (Data Persistence) - reliable achievement storage
- Phase 4 (Social Features) - friend system for social achievements
- Game mechanics stable and properly instrumented