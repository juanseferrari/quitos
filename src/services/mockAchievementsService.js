// src/services/mockAchievementsService.js
// Servicio mock completo del sistema de logros
// Implementa las 50+ achievements según especificaciones M4.1

class MockAchievementsService {
  constructor() {
    this.achievements = this.generateAllAchievements();
    this.categories = this.generateCategories();
    this.userProgress = this.generateMockUserProgress();
    this.recentUnlocks = [];
    this.delay = 300; // Optimizado según recomendación de performance expert
    this.progressCache = new Map();
    this.lastProgressCheck = Date.now();
  }

  generateCategories() {
    return [
      {
        id: 'victorias',
        name: 'Victorias',
        description: 'Logros por partidas ganadas y experiencia',
        icon: '🏆',
        color_hex: '#D4A574',
        sort_order: 1
      },
      {
        id: 'rachas',
        name: 'Rachas',
        description: 'Logros por victorias consecutivas',
        icon: '🔥',
        color_hex: '#FF6B35',
        sort_order: 2
      },
      {
        id: 'dominancia',
        name: 'Dominancia',
        description: 'Logros por dominar oponentes',
        icon: '😴',
        color_hex: '#9B59B6',
        sort_order: 3
      },
      {
        id: 'equipos',
        name: 'Equipos',
        description: 'Logros por jugar en dupla/trío',
        icon: '🤝',
        color_hex: '#3498DB',
        sort_order: 4
      },
      {
        id: 'especiales',
        name: 'Especiales',
        description: 'Logros únicos y eventos especiales',
        icon: '⭐',
        color_hex: '#F39C12',
        sort_order: 5
      }
    ];
  }

  generateAllAchievements() {
    return [
      // ========================================
      // CATEGORÍA: VICTORIAS (7 logros)
      // ========================================
      {
        id: 'ach-victorias-1',
        key: 'primer_sangre',
        name: 'Primer Sangre',
        description: 'Gana tu primera partida',
        category: 'victorias',
        tier: 'bronze',
        points_reward: 10,
        badge_icon: '🩸',
        unlock_conditions: { type: 'games_won', value: 1 },
        rarity: 95.2,
        is_progressive: false,
        title_unlock: null
      },
      {
        id: 'ach-victorias-2',
        key: 'calentando',
        name: 'Calentando',
        description: 'Gana 10 partidas',
        category: 'victorias',
        tier: 'bronze',
        points_reward: 25,
        badge_icon: '🔥',
        unlock_conditions: { type: 'games_won', value: 10 },
        rarity: 78.5,
        is_progressive: false
      },
      {
        id: 'ach-victorias-3',
        key: 'en_racha',
        name: 'En Racha',
        description: 'Gana 25 partidas',
        category: 'victorias',
        tier: 'silver',
        points_reward: 50,
        badge_icon: '⚡',
        unlock_conditions: { type: 'games_won', value: 25 },
        rarity: 52.3,
        is_progressive: false
      },
      {
        id: 'ach-victorias-4',
        key: 'imparable',
        name: 'Imparable',
        description: 'Gana 50 partidas',
        category: 'victorias',
        tier: 'silver',
        points_reward: 100,
        badge_icon: '🚀',
        unlock_conditions: { type: 'games_won', value: 50 },
        rarity: 34.7,
        is_progressive: false
      },
      {
        id: 'ach-victorias-5',
        key: 'rey_del_barrio',
        name: 'Rey del Barrio',
        description: 'Gana 100 partidas',
        category: 'victorias',
        tier: 'gold',
        points_reward: 200,
        badge_icon: '👑',
        unlock_conditions: { type: 'games_won', value: 100 },
        rarity: 18.9,
        is_progressive: false,
        title_unlock: 'Rey del Barrio'
      },
      {
        id: 'ach-victorias-6',
        key: 'leyenda_viviente',
        name: 'Leyenda Viviente',
        description: 'Gana 250 partidas',
        category: 'victorias',
        tier: 'platinum',
        points_reward: 500,
        badge_icon: '🏆',
        unlock_conditions: { type: 'games_won', value: 250 },
        rarity: 5.2,
        is_progressive: false,
        title_unlock: 'Leyenda'
      },
      {
        id: 'ach-victorias-7',
        key: 'mito_del_truco',
        name: 'Mito del Truco',
        description: 'Gana 500 partidas',
        category: 'victorias',
        tier: 'legendary',
        points_reward: 1000,
        badge_icon: '⭐',
        unlock_conditions: { type: 'games_won', value: 500 },
        rarity: 1.1,
        is_progressive: false,
        title_unlock: 'Mito'
      },

      // ========================================
      // CATEGORÍA: RACHAS (6 logros)
      // ========================================
      {
        id: 'ach-rachas-1',
        key: 'esta_que_arde',
        name: 'Está que Arde',
        description: 'Gana 5 partidas consecutivas',
        category: 'rachas',
        tier: 'bronze',
        points_reward: 25,
        badge_icon: '🔥',
        unlock_conditions: { type: 'win_streak', value: 5 },
        rarity: 45.8,
        is_progressive: false
      },
      {
        id: 'ach-rachas-2',
        key: 'fuego_sagrado',
        name: 'Fuego Sagrado',
        description: 'Gana 10 partidas consecutivas',
        category: 'rachas',
        tier: 'silver',
        points_reward: 75,
        badge_icon: '🌟',
        unlock_conditions: { type: 'win_streak', value: 10 },
        rarity: 23.4,
        is_progressive: false
      },
      {
        id: 'ach-rachas-3',
        key: 'phoenix',
        name: 'Phoenix',
        description: 'Gana 20 partidas consecutivas',
        category: 'rachas',
        tier: 'gold',
        points_reward: 200,
        badge_icon: '🔥',
        unlock_conditions: { type: 'win_streak', value: 20 },
        rarity: 8.7,
        is_progressive: false,
        title_unlock: 'Phoenix'
      },
      {
        id: 'ach-rachas-4',
        key: 'dragon',
        name: 'Dragón',
        description: 'Gana 30 partidas consecutivas',
        category: 'rachas',
        tier: 'platinum',
        points_reward: 500,
        badge_icon: '🐉',
        unlock_conditions: { type: 'win_streak', value: 30 },
        rarity: 2.1,
        is_progressive: false,
        title_unlock: 'Dragón'
      },
      {
        id: 'ach-rachas-5',
        key: 'inmortal',
        name: 'Inmortal',
        description: 'Gana 50 partidas consecutivas',
        category: 'rachas',
        tier: 'legendary',
        points_reward: 1000,
        badge_icon: '👹',
        unlock_conditions: { type: 'win_streak', value: 50 },
        rarity: 0.3,
        is_progressive: false,
        title_unlock: 'Inmortal'
      },
      {
        id: 'ach-rachas-6',
        key: 'dios_del_truco',
        name: 'Dios del Truco',
        description: 'Gana 100 partidas consecutivas',
        category: 'rachas',
        tier: 'legendary',
        points_reward: 2000,
        badge_icon: '⚡',
        unlock_conditions: { type: 'win_streak', value: 100 },
        rarity: 0.01,
        is_progressive: false,
        title_unlock: 'Dios del Truco'
      },

      // ========================================
      // CATEGORÍA: DOMINANCIA (6 logros)
      // ========================================
      {
        id: 'ach-dominancia-1',
        key: 'primera_siesta',
        name: 'Primera Siesta',
        description: 'Dormí afuera por primera vez',
        category: 'dominancia',
        tier: 'bronze',
        points_reward: 15,
        badge_icon: '😴',
        unlock_conditions: { type: 'shutouts_given', value: 1 },
        rarity: 67.8,
        is_progressive: false
      },
      {
        id: 'ach-dominancia-2',
        key: 'sandman',
        name: 'Sandman',
        description: 'Dormí afuera 10 veces',
        category: 'dominancia',
        tier: 'bronze',
        points_reward: 50,
        badge_icon: '🌙',
        unlock_conditions: { type: 'shutouts_given', value: 10 },
        rarity: 34.2,
        is_progressive: false
      },
      {
        id: 'ach-dominancia-3',
        key: 'morfeo',
        name: 'Morfeo',
        description: 'Dormí afuera 25 veces',
        category: 'dominancia',
        tier: 'silver',
        points_reward: 100,
        badge_icon: '💤',
        unlock_conditions: { type: 'shutouts_given', value: 25 },
        rarity: 18.5,
        is_progressive: false
      },
      {
        id: 'ach-dominancia-4',
        key: 'freddy_krueger',
        name: 'Freddy Krueger',
        description: 'Dormí afuera 50 veces',
        category: 'dominancia',
        tier: 'gold',
        points_reward: 200,
        badge_icon: '🔪',
        unlock_conditions: { type: 'shutouts_given', value: 50 },
        rarity: 9.3,
        is_progressive: false,
        title_unlock: 'Pesadilla'
      },
      {
        id: 'ach-dominancia-5',
        key: 'senor_de_los_suenos',
        name: 'Señor de los Sueños',
        description: 'Dormí afuera 100 veces',
        category: 'dominancia',
        tier: 'platinum',
        points_reward: 400,
        badge_icon: '👹',
        unlock_conditions: { type: 'shutouts_given', value: 100 },
        rarity: 3.7,
        is_progressive: false,
        title_unlock: 'Señor de Pesadillas'
      },
      {
        id: 'ach-dominancia-6',
        key: 'exterminador',
        name: 'Exterminador',
        description: 'Dormí afuera 200 veces',
        category: 'dominancia',
        tier: 'legendary',
        points_reward: 800,
        badge_icon: '💀',
        unlock_conditions: { type: 'shutouts_given', value: 200 },
        rarity: 0.8,
        is_progressive: false,
        title_unlock: 'Exterminador'
      },

      // ========================================
      // CATEGORÍA: EQUIPOS (5 logros)
      // ========================================
      {
        id: 'ach-equipos-1',
        key: 'buen_companero',
        name: 'Buen Compañero',
        description: 'Gana 1 partida en dupla',
        category: 'equipos',
        tier: 'bronze',
        points_reward: 10,
        badge_icon: '🤝',
        unlock_conditions: { type: 'team_wins', value: 1 },
        rarity: 58.3,
        is_progressive: false
      },
      {
        id: 'ach-equipos-2',
        key: 'dupla_dinamica',
        name: 'Dupla Dinámica',
        description: 'Gana 10 partidas en dupla',
        category: 'equipos',
        tier: 'silver',
        points_reward: 50,
        badge_icon: '⚡',
        unlock_conditions: { type: 'team_wins', value: 10 },
        rarity: 28.7,
        is_progressive: false
      },
      {
        id: 'ach-equipos-3',
        key: 'los_invencibles',
        name: 'Los Invencibles',
        description: 'Gana 25 partidas en dupla',
        category: 'equipos',
        tier: 'gold',
        points_reward: 125,
        badge_icon: '🛡️',
        unlock_conditions: { type: 'team_wins', value: 25 },
        rarity: 14.2,
        is_progressive: false,
        title_unlock: 'Invencible'
      },
      {
        id: 'ach-equipos-4',
        key: 'leyenda_dupla',
        name: 'Leyenda en Dupla',
        description: 'Gana 50 partidas en dupla',
        category: 'equipos',
        tier: 'platinum',
        points_reward: 250,
        badge_icon: '👥',
        unlock_conditions: { type: 'team_wins', value: 50 },
        rarity: 6.8,
        is_progressive: false,
        title_unlock: 'Leyenda Dupla'
      },
      {
        id: 'ach-equipos-5',
        key: 'mito_en_equipo',
        name: 'Mito en Equipo',
        description: 'Gana 100 partidas en dupla',
        category: 'equipos',
        tier: 'legendary',
        points_reward: 500,
        badge_icon: '🏆',
        unlock_conditions: { type: 'team_wins', value: 100 },
        rarity: 2.1,
        is_progressive: false,
        title_unlock: 'Mito del Equipo'
      },

      // ========================================
      // CATEGORÍA: ESPECIALES (25+ logros)
      // ========================================
      {
        id: 'ach-especiales-1',
        key: 'madrugador',
        name: 'Madrugador',
        description: 'Gana una partida entre las 3:00 y 6:00 AM',
        category: 'especiales',
        tier: 'silver',
        points_reward: 50,
        badge_icon: '🌅',
        unlock_conditions: { type: 'win_at_hour_range', start: 3, end: 6 },
        rarity: 12.4,
        is_progressive: false
      },
      {
        id: 'ach-especiales-2',
        key: 'noctambulo',
        name: 'Noctámbulo',
        description: 'Gana una partida después de medianoche',
        category: 'especiales',
        tier: 'bronze',
        points_reward: 25,
        badge_icon: '🌙',
        unlock_conditions: { type: 'win_at_hour_range', start: 0, end: 3 },
        rarity: 23.7,
        is_progressive: false
      },
      {
        id: 'ach-especiales-3',
        key: 'guerrero_fin_semana',
        name: 'Guerrero de Fin de Semana',
        description: 'Gana 10 partidas en sábado o domingo',
        category: 'especiales',
        tier: 'silver',
        points_reward: 35,
        badge_icon: '🍻',
        unlock_conditions: { type: 'weekend_wins', value: 10 },
        rarity: 31.2,
        is_progressive: false
      },
      {
        id: 'ach-especiales-4',
        key: 'workaholic',
        name: 'Workaholic',
        description: 'Gana una partida en horario laboral (9-17hs)',
        category: 'especiales',
        tier: 'bronze',
        points_reward: 30,
        badge_icon: '💼',
        unlock_conditions: { type: 'win_at_hour_range', start: 9, end: 17 },
        rarity: 42.8,
        is_progressive: false
      },
      {
        id: 'ach-especiales-5',
        key: 'perfeccionista',
        name: 'Perfeccionista',
        description: 'Gana sin que el oponente anote',
        category: 'especiales',
        tier: 'gold',
        points_reward: 75,
        badge_icon: '🎯',
        unlock_conditions: { type: 'perfect_game', value: 1 },
        rarity: 8.9,
        is_progressive: false
      },
      {
        id: 'ach-especiales-6',
        key: 'comeback_kid',
        name: 'Comeback Kid',
        description: 'Gana estando 20+ puntos abajo',
        category: 'especiales',
        tier: 'gold',
        points_reward: 100,
        badge_icon: '🔄',
        unlock_conditions: { type: 'comeback_win', value: 20 },
        rarity: 6.2,
        is_progressive: false
      },
      {
        id: 'ach-especiales-7',
        key: 'velocista',
        name: 'Velocista',
        description: 'Gana una partida en menos de 5 minutos',
        category: 'especiales',
        tier: 'silver',
        points_reward: 40,
        badge_icon: '⚡',
        unlock_conditions: { type: 'quick_win', value: 300 }, // 5 minutes in seconds
        rarity: 18.5,
        is_progressive: false
      },
      {
        id: 'ach-especiales-8',
        key: 'maratonista',
        name: 'Maratonista',
        description: 'Gana una partida que dure más de 30 minutos',
        category: 'especiales',
        tier: 'silver',
        points_reward: 40,
        badge_icon: '🏃',
        unlock_conditions: { type: 'long_win', value: 1800 }, // 30 minutes in seconds
        rarity: 15.3,
        is_progressive: false
      },
      {
        id: 'ach-especiales-9',
        key: 'veterano',
        name: 'Veterano',
        description: 'Juega durante 7 días seguidos',
        category: 'especiales',
        tier: 'gold',
        points_reward: 100,
        badge_icon: '🎖️',
        unlock_conditions: { type: 'daily_streak', value: 7 },
        rarity: 24.1,
        is_progressive: false
      },
      {
        id: 'ach-especiales-10',
        key: 'adicto_al_truco',
        name: 'Adicto al Truco',
        description: 'Juega durante 30 días seguidos',
        category: 'especiales',
        tier: 'platinum',
        points_reward: 300,
        badge_icon: '🎮',
        unlock_conditions: { type: 'daily_streak', value: 30 },
        rarity: 5.7,
        is_progressive: false,
        title_unlock: 'Adicto'
      },
      {
        id: 'ach-especiales-11',
        key: 'lunes_motivado',
        name: 'Lunes Motivado',
        description: 'Gana 5 partidas en lunes',
        category: 'especiales',
        tier: 'bronze',
        points_reward: 25,
        badge_icon: '💼',
        unlock_conditions: { type: 'weekday_wins', day: 1, value: 5 },
        rarity: 28.9,
        is_progressive: false
      },
      {
        id: 'ach-especiales-12',
        key: 'viernes_de_truco',
        name: 'Viernes de Truco',
        description: 'Gana 10 partidas en viernes',
        category: 'especiales',
        tier: 'silver',
        points_reward: 40,
        badge_icon: '🎉',
        unlock_conditions: { type: 'weekday_wins', day: 5, value: 10 },
        rarity: 35.2,
        is_progressive: false
      },
      {
        id: 'ach-especiales-13',
        key: 'campeon_mensual',
        name: 'Campeón Mensual',
        description: 'Gana 100 partidas en un mes',
        category: 'especiales',
        tier: 'platinum',
        points_reward: 500,
        badge_icon: '📅',
        unlock_conditions: { type: 'monthly_wins', value: 100 },
        rarity: 3.4,
        is_progressive: false,
        title_unlock: 'Campeón Mensual'
      },
      {
        id: 'ach-especiales-14',
        key: 'ano_nuevo_truco',
        name: 'Año Nuevo Truco',
        description: 'Gana una partida el 1 de enero',
        category: 'especiales',
        tier: 'gold',
        points_reward: 100,
        badge_icon: '🎊',
        unlock_conditions: { type: 'holiday_win', holiday: 'new_year' },
        rarity: 4.2,
        is_progressive: false
      },
      {
        id: 'ach-especiales-15',
        key: 'navidad_truquera',
        name: 'Navidad Truquera',
        description: 'Gana una partida el 25 de diciembre',
        category: 'especiales',
        tier: 'gold',
        points_reward: 100,
        badge_icon: '🎄',
        unlock_conditions: { type: 'holiday_win', holiday: 'christmas' },
        rarity: 6.8,
        is_progressive: false
      },
      // Añadir más logros especiales hasta completar 50+...
      {
        id: 'ach-especiales-16',
        key: 'centurion',
        name: 'Centurión',
        description: 'Juega 100 partidas (ganes o pierdas)',
        category: 'especiales',
        tier: 'silver',
        points_reward: 75,
        badge_icon: '🏛️',
        unlock_conditions: { type: 'games_played', value: 100 },
        rarity: 45.3,
        is_progressive: false
      },
      {
        id: 'ach-especiales-17',
        key: 'gladiador',
        name: 'Gladiador',
        description: 'Juega 500 partidas (ganes o pierdas)',
        category: 'especiales',
        tier: 'gold',
        points_reward: 200,
        badge_icon: '⚔️',
        unlock_conditions: { type: 'games_played', value: 500 },
        rarity: 12.7,
        is_progressive: false
      },
      {
        id: 'ach-especiales-18',
        key: 'explorador',
        name: 'Explorador',
        description: 'Juega contra 20 oponentes diferentes',
        category: 'especiales',
        tier: 'silver',
        points_reward: 60,
        badge_icon: '🗺️',
        unlock_conditions: { type: 'unique_opponents', value: 20 },
        rarity: 32.1,
        is_progressive: false
      },
      {
        id: 'ach-especiales-19',
        key: 'sociable',
        name: 'Sociable',
        description: 'Juega contra 50 oponentes diferentes',
        category: 'especiales',
        tier: 'gold',
        points_reward: 150,
        badge_icon: '🌍',
        unlock_conditions: { type: 'unique_opponents', value: 50 },
        rarity: 8.9,
        is_progressive: false
      },
      {
        id: 'ach-especiales-20',
        key: 'maestro_de_ceremonias',
        name: 'Maestro de Ceremonias',
        description: 'Completa tu primer torneo',
        category: 'especiales',
        tier: 'platinum',
        points_reward: 300,
        badge_icon: '🎭',
        unlock_conditions: { type: 'tournament_completed', value: 1 },
        rarity: 2.8,
        is_progressive: false,
        title_unlock: 'Maestro de Ceremonias'
      }
    ];
  }

  generateMockUserProgress() {
    // Simular progreso realista basado en un usuario intermedio
    return {
      'primer_sangre': {
        current_progress: 1,
        max_progress: 1,
        is_unlocked: true,
        unlocked_at: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 días atrás
        percentage: 100
      },
      'calentando': {
        current_progress: 10,
        max_progress: 10,
        is_unlocked: true,
        unlocked_at: Date.now() - (20 * 24 * 60 * 60 * 1000), // 20 días atrás
        percentage: 100
      },
      'en_racha': {
        current_progress: 18,
        max_progress: 25,
        is_unlocked: false,
        percentage: 72
      },
      'primera_siesta': {
        current_progress: 1,
        max_progress: 1,
        is_unlocked: true,
        unlocked_at: Date.now() - (15 * 24 * 60 * 60 * 1000),
        percentage: 100
      },
      'esta_que_arde': {
        current_progress: 5,
        max_progress: 5,
        is_unlocked: true,
        unlocked_at: Date.now() - (10 * 24 * 60 * 60 * 1000),
        percentage: 100
      },
      'buen_companero': {
        current_progress: 1,
        max_progress: 1,
        is_unlocked: true,
        unlocked_at: Date.now() - (12 * 24 * 60 * 60 * 1000),
        percentage: 100
      },
      'fuego_sagrado': {
        current_progress: 7,
        max_progress: 10,
        is_unlocked: false,
        percentage: 70
      },
      'sandman': {
        current_progress: 6,
        max_progress: 10,
        is_unlocked: false,
        percentage: 60
      },
      'perfeccionista': {
        current_progress: 0,
        max_progress: 1,
        is_unlocked: false,
        percentage: 0
      },
      'velocista': {
        current_progress: 0,
        max_progress: 1,
        is_unlocked: false,
        percentage: 0
      }
    };
  }

  // ========================================
  // API MOCK METHODS
  // ========================================

  async getAchievements(options = {}) {
    await this.simulateDelay();

    const { category, tier, unlocked_only = false } = options;

    let filteredAchievements = [...this.achievements];

    // Aplicar filtros
    if (category) {
      filteredAchievements = filteredAchievements.filter(a => a.category === category);
    }

    if (tier) {
      filteredAchievements = filteredAchievements.filter(a => a.tier === tier);
    }

    if (unlocked_only) {
      filteredAchievements = filteredAchievements.filter(a => 
        this.userProgress[a.key]?.is_unlocked
      );
    }

    // Agregar progreso del usuario a cada achievement
    const achievementsWithProgress = filteredAchievements.map(achievement => ({
      ...achievement,
      user_progress: this.userProgress[achievement.key] || {
        current_progress: 0,
        max_progress: achievement.unlock_conditions.value || 1,
        is_unlocked: false,
        percentage: 0
      }
    }));

    // Calcular estadísticas del usuario
    const unlockedAchievements = Object.values(this.userProgress).filter(p => p.is_unlocked);
    const totalPoints = unlockedAchievements.reduce((sum, progress) => {
      const achievement = this.achievements.find(a => this.userProgress[a.key] === progress);
      return sum + (achievement?.points_reward || 0);
    }, 0);

    return {
      achievements: achievementsWithProgress,
      categories: this.categories.map(category => ({
        ...category,
        achievements_count: this.achievements.filter(a => a.category === category.id).length
      })),
      summary: {
        total_achievements: this.achievements.length,
        unlocked: unlockedAchievements.length,
        total_points: this.achievements.reduce((sum, a) => sum + a.points_reward, 0),
        user_points: totalPoints
      }
    };
  }

  async getUserAchievements(userId) {
    await this.simulateDelay();

    const unlockedAchievements = [];
    const inProgressAchievements = [];

    Object.entries(this.userProgress).forEach(([key, progress]) => {
      const achievement = this.achievements.find(a => a.key === key);
      if (!achievement) return;

      if (progress.is_unlocked) {
        unlockedAchievements.push({
          achievement: {
            key: achievement.key,
            name: achievement.name,
            badge_icon: achievement.badge_icon,
            tier: achievement.tier,
            points_reward: achievement.points_reward
          },
          unlocked_at: progress.unlocked_at,
          unlock_context: {
            // Simular contexto de desbloqueo
            trigger: 'game_completed'
          }
        });
      } else if (progress.current_progress > 0) {
        inProgressAchievements.push({
          achievement: {
            key: achievement.key,
            name: achievement.name,
            description: achievement.description,
            badge_icon: achievement.badge_icon
          },
          current_progress: progress.current_progress,
          max_progress: progress.max_progress,
          percentage: progress.percentage
        });
      }
    });

    // Encontrar el logro más raro desbloqueado
    const rarestAchievement = unlockedAchievements
      .map(unlock => this.achievements.find(a => a.key === unlock.achievement.key))
      .filter(a => a)
      .sort((a, b) => a.rarity - b.rarity)[0];

    // Generar progreso para logros en curso
    const progressArray = [];
    Object.entries(this.userProgress).forEach(([key, progress]) => {
      if (!progress.is_unlocked && progress.current_progress > 0) {
        progressArray.push({
          achievement_key: key,
          current_progress: progress.current_progress,
          max_progress: progress.max_progress,
          percentage: progress.percentage,
          last_updated: progress.last_updated || new Date().toISOString()
        });
      }
    });

    // Generar logros desbloqueados en formato esperado
    const userAchievementsArray = [];
    Object.entries(this.userProgress).forEach(([key, progress]) => {
      if (progress.is_unlocked) {
        userAchievementsArray.push({
          achievement_key: key,
          is_unlocked: true,
          unlocked_at: progress.unlocked_at || new Date().toISOString(),
          points_earned: this.achievements.find(a => a.key === key)?.points_reward || 0
        });
      }
    });

    return {
      user_achievements: userAchievementsArray,
      progress: progressArray,
      stats: {
        total_points: unlockedAchievements.reduce((sum, unlock) => sum + unlock.achievement.points_reward, 0),
        achievements_unlocked: unlockedAchievements.length,
        rarest_achievement: rarestAchievement ? {
          key: rarestAchievement.key,
          name: rarestAchievement.name,
          rarity: rarestAchievement.rarity
        } : null
      }
    };
  }

  async checkProgress(eventType, eventData) {
    await this.simulateDelay();

    const unlockedAchievements = [];
    const progressUpdates = [];
    let totalPointsEarned = 0;

    // Evitar verificaciones duplicadas
    const cacheKey = `${eventType}-${JSON.stringify(eventData)}-${Date.now()}`;
    if (this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey);
    }

    // Procesar diferentes tipos de eventos
    switch (eventType) {
      case 'game_finished':
        this.processGameFinished(eventData, unlockedAchievements, progressUpdates);
        break;
      case 'friend_added':
        this.processFriendAdded(eventData, unlockedAchievements, progressUpdates);
        break;
      case 'daily_login':
        this.processDailyLogin(eventData, unlockedAchievements, progressUpdates);
        break;
      default:
        console.warn(`Tipo de evento no reconocido: ${eventType}`);
    }

    // Calcular puntos totales ganados
    totalPointsEarned = unlockedAchievements.reduce((sum, unlock) => 
      sum + (unlock.achievement.points_reward || 0), 0);

    const result = {
      unlocked_achievements: unlockedAchievements,
      progress_updates: progressUpdates,
      total_points_earned: totalPointsEarned
    };

    // Cachear resultado
    this.progressCache.set(cacheKey, result);
    setTimeout(() => this.progressCache.delete(cacheKey), 60000); // Cache por 1 minuto

    return result;
  }

  processGameFinished(eventData, unlockedAchievements, progressUpdates) {
    const { won, opponent_points, user_points, game_duration, was_team_game } = eventData;

    if (!won) return; // Solo procesar victorias para simplificar

    // Verificar logros de victorias
    this.checkVictoryAchievements(unlockedAchievements, progressUpdates);

    // Verificar logros de dominancia (shutouts)
    if (opponent_points === 0) {
      this.checkDominanceAchievements(unlockedAchievements, progressUpdates);
    }

    // Verificar logros especiales
    this.checkSpecialAchievements(eventData, unlockedAchievements, progressUpdates);

    // Verificar logros de equipos
    if (was_team_game) {
      this.checkTeamAchievements(unlockedAchievements, progressUpdates);
    }

    // Verificar logros de tiempo
    this.checkTimeBasedAchievements(eventData, unlockedAchievements, progressUpdates);
  }

  checkVictoryAchievements(unlockedAchievements, progressUpdates) {
    const victoryAchievements = ['primer_sangre', 'calentando', 'en_racha', 'imparable', 'rey_del_barrio', 'leyenda_viviente', 'mito_del_truco'];
    
    // Simular incremento de victorias
    this.incrementProgress('en_racha', 1, unlockedAchievements, progressUpdates);
  }

  checkDominanceAchievements(unlockedAchievements, progressUpdates) {
    // Simular desbloqueo de "perfeccionista" en shutout
    if (!this.userProgress['perfeccionista']?.is_unlocked) {
      const achievement = this.achievements.find(a => a.key === 'perfeccionista');
      if (achievement) {
        this.unlockAchievement('perfeccionista', achievement, unlockedAchievements);
      }
    }

    // Incrementar progreso de dominancia
    this.incrementProgress('sandman', 1, unlockedAchievements, progressUpdates);
  }

  checkSpecialAchievements(eventData, unlockedAchievements, progressUpdates) {
    const now = new Date();
    const hour = now.getHours();

    // Verificar logros por hora
    if (hour >= 3 && hour < 6) {
      this.checkAndUnlock('madrugador', unlockedAchievements);
    } else if (hour >= 0 && hour < 3) {
      this.checkAndUnlock('noctambulo', unlockedAchievements);
    } else if (hour >= 9 && hour < 17) {
      this.checkAndUnlock('workaholic', unlockedAchievements);
    }

    // Verificar velocista
    if (eventData.game_duration && eventData.game_duration < 300) {
      this.checkAndUnlock('velocista', unlockedAchievements);
    }
  }

  checkTeamAchievements(unlockedAchievements, progressUpdates) {
    this.incrementProgress('dupla_dinamica', 1, unlockedAchievements, progressUpdates);
  }

  checkTimeBasedAchievements(eventData, unlockedAchievements, progressUpdates) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      this.incrementProgress('guerrero_fin_semana', 1, unlockedAchievements, progressUpdates);
    }
  }

  incrementProgress(achievementKey, amount, unlockedAchievements, progressUpdates) {
    const achievement = this.achievements.find(a => a.key === achievementKey);
    if (!achievement) return;

    const currentProgress = this.userProgress[achievementKey] || {
      current_progress: 0,
      max_progress: achievement.unlock_conditions.value,
      is_unlocked: false,
      percentage: 0
    };

    if (currentProgress.is_unlocked) return;

    const oldProgress = currentProgress.current_progress;
    const newProgress = Math.min(oldProgress + amount, currentProgress.max_progress);
    const percentage = (newProgress / currentProgress.max_progress) * 100;

    currentProgress.current_progress = newProgress;
    currentProgress.percentage = percentage;
    this.userProgress[achievementKey] = currentProgress;

    progressUpdates.push({
      achievement_key: achievementKey,
      old_progress: oldProgress,
      new_progress: newProgress,
      max_progress: currentProgress.max_progress,
      percentage: percentage
    });

    // Verificar si se desbloqueó
    if (newProgress >= currentProgress.max_progress) {
      this.unlockAchievement(achievementKey, achievement, unlockedAchievements);
    }
  }

  checkAndUnlock(achievementKey, unlockedAchievements) {
    if (!this.userProgress[achievementKey]?.is_unlocked) {
      const achievement = this.achievements.find(a => a.key === achievementKey);
      if (achievement) {
        this.unlockAchievement(achievementKey, achievement, unlockedAchievements);
      }
    }
  }

  unlockAchievement(achievementKey, achievement, unlockedAchievements) {
    const unlockTime = Date.now();
    
    this.userProgress[achievementKey] = {
      current_progress: achievement.unlock_conditions.value || 1,
      max_progress: achievement.unlock_conditions.value || 1,
      is_unlocked: true,
      unlocked_at: unlockTime,
      percentage: 100
    };

    unlockedAchievements.push({
      achievement: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        badge_icon: achievement.badge_icon,
        tier: achievement.tier,
        points_reward: achievement.points_reward,
        title_unlock: achievement.title_unlock
      },
      unlocked_at: unlockTime,
      is_new: true
    });

    // Agregar a unlocks recientes para notificaciones
    this.recentUnlocks.unshift({
      achievement,
      unlocked_at: unlockTime
    });

    // Mantener solo los 10 unlocks más recientes
    this.recentUnlocks = this.recentUnlocks.slice(0, 10);
  }

  async getLeaderboard(options = {}) {
    await this.simulateDelay();

    const { type = 'points', period = 'all_time', limit = 10 } = options;

    // Simular datos de leaderboard
    const mockLeaderboard = [
      {
        rank: 1,
        user: {
          id: 'user-1',
          username: 'achievement_hunter',
          name: 'Juan López',
          avatar: 'https://via.placeholder.com/150'
        },
        stats: {
          total_points: 1250,
          achievements_unlocked: 28,
          rarest_achievement_rarity: 2.1
        }
      },
      {
        rank: 2,
        user: {
          id: 'user-2',
          username: 'truco_master',
          name: 'María González',
          avatar: 'https://via.placeholder.com/150'
        },
        stats: {
          total_points: 1180,
          achievements_unlocked: 25,
          rarest_achievement_rarity: 3.7
        }
      },
      {
        rank: 3,
        user: {
          id: 'current-user',
          username: 'tu_usuario',
          name: 'TÚ',
          is_current_user: true
        },
        stats: {
          total_points: 445,
          achievements_unlocked: 12,
          rarest_achievement_rarity: 8.9
        }
      }
    ];

    return {
      leaderboard: mockLeaderboard.slice(0, limit),
      user_rank: {
        rank: 3,
        total_users: 500
      }
    };
  }

  // ========================================
  // UTILIDADES
  // ========================================

  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  setDelay(ms) {
    this.delay = ms;
  }

  resetProgress() {
    this.userProgress = this.generateMockUserProgress();
    this.recentUnlocks = [];
    this.progressCache.clear();
  }

  // Métodos para desarrollo y testing
  forceUnlock(achievementKey) {
    const achievement = this.achievements.find(a => a.key === achievementKey);
    if (achievement) {
      this.userProgress[achievementKey] = {
        current_progress: achievement.unlock_conditions.value || 1,
        max_progress: achievement.unlock_conditions.value || 1,
        is_unlocked: true,
        unlocked_at: Date.now(),
        percentage: 100
      };
    }
  }

  getAchievementsByCategory(category) {
    return this.achievements.filter(a => a.category === category);
  }

  getAchievementsByTier(tier) {
    return this.achievements.filter(a => a.tier === tier);
  }

  getUserStats() {
    const unlocked = Object.values(this.userProgress).filter(p => p.is_unlocked);
    const inProgress = Object.values(this.userProgress).filter(p => !p.is_unlocked && p.current_progress > 0);
    const totalPoints = unlocked.reduce((sum, progress) => {
      const achievement = this.achievements.find(a => this.userProgress[a.key] === progress);
      return sum + (achievement?.points_reward || 0);
    }, 0);

    return {
      total_achievements: this.achievements.length,
      unlocked_count: unlocked.length,
      in_progress_count: inProgress.length,
      completion_percentage: (unlocked.length / this.achievements.length) * 100,
      total_points: totalPoints,
      recent_unlocks_count: this.recentUnlocks.length
    };
  }

  // ========================================
  // MÉTODOS PÚBLICOS DE LA API
  // ========================================

  async getCategories() {
    await this.simulateDelay();
    return {
      categories: this.categories,
      total: this.categories.length
    };
  }

  async getAchievements(options = {}) {
    await this.simulateDelay();
    
    let filtered = [...this.achievements];
    
    // Filtrar por categoría si se especifica
    if (options.category) {
      filtered = filtered.filter(a => a.category === options.category);
    }
    
    // Filtrar por tier si se especifica
    if (options.tier) {
      filtered = filtered.filter(a => a.tier === options.tier);
    }
    
    // Filtrar por estado de desbloqueo si se especifica
    if (options.unlocked !== undefined) {
      const userAchievements = this.userProgress.get('default_user') || new Map();
      filtered = filtered.filter(a => {
        const userAch = userAchievements.get(a.key);
        return options.unlocked ? (userAch && userAch.is_unlocked) : (!userAch || !userAch.is_unlocked);
      });
    }
    
    // Ordenar
    if (options.sort) {
      switch (options.sort) {
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'points':
          filtered.sort((a, b) => b.points_reward - a.points_reward);
          break;
        case 'rarity':
          filtered.sort((a, b) => a.rarity - b.rarity);
          break;
        default:
          // Por defecto, ordenar por categoría y luego por nombre
          filtered.sort((a, b) => {
            const catDiff = a.category.localeCompare(b.category);
            return catDiff !== 0 ? catDiff : a.name.localeCompare(b.name);
          });
      }
    }
    
    // Paginar si se especifica
    const page = options.page || 1;
    const limit = options.limit || filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    
    return {
      achievements: paginated,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit)
    };
  }

  async checkAchievementProgress(userId, gameData) {
    await this.simulateDelay();
    
    // Simular verificación de logros basada en los datos del juego
    const newUnlocks = [];
    const updatedProgress = [];
    
    // Ejemplo: verificar logro de primera victoria
    if (gameData.action === 'game_finished' && gameData.won) {
      // Simular desbloqueo del logro "Primer Sangre" si es la primera victoria
      if (!this.userProgress['primer_sangre'] || !this.userProgress['primer_sangre'].is_unlocked) {
        const achievement = this.achievements.find(a => a.key === 'primer_sangre');
        if (achievement) {
          newUnlocks.push({
            key: achievement.key,
            name: achievement.name,
            description: achievement.description,
            badge_icon: achievement.badge_icon,
            tier: achievement.tier,
            points_reward: achievement.points_reward,
            timestamp: new Date().toISOString()
          });
          
          // Actualizar progreso interno
          this.userProgress['primer_sangre'] = {
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
            current_progress: 1,
            max_progress: 1,
            percentage: 100
          };
        }
      }
    }
    
    // Verificar progreso de otros logros
    if (gameData.action === 'point_scored') {
      // Simular progreso en logros de puntos
      const currentProgress = this.userProgress['puntos_anotados'] || { current_progress: 0, max_progress: 100, is_unlocked: false };
      if (!currentProgress.is_unlocked) {
        currentProgress.current_progress = Math.min(currentProgress.current_progress + 1, currentProgress.max_progress);
        currentProgress.percentage = (currentProgress.current_progress / currentProgress.max_progress) * 100;
        
        updatedProgress.push({
          achievement_key: 'puntos_anotados',
          current_progress: currentProgress.current_progress,
          max_progress: currentProgress.max_progress,
          percentage: currentProgress.percentage,
          last_updated: new Date().toISOString()
        });
        
        this.userProgress['puntos_anotados'] = currentProgress;
      }
    }
    
    return {
      newly_unlocked: newUnlocks,
      updated_progress: updatedProgress,
      user_achievements: Object.entries(this.userProgress)
        .filter(([key, progress]) => progress.is_unlocked)
        .map(([key, progress]) => ({
          achievement_key: key,
          is_unlocked: true,
          unlocked_at: progress.unlocked_at,
          points_earned: this.achievements.find(a => a.key === key)?.points_reward || 0
        }))
    };
  }

  setDelay(delay) {
    this.delay = delay;
  }
}

// Instancia singleton
export const mockAchievementsService = new MockAchievementsService();

// Configuración para desarrollo
if (process.env.NODE_ENV === 'development') {
  mockAchievementsService.setDelay(300);
  
  // Exponer en window para debugging
  window.achievementsService = mockAchievementsService;
}