// src/services/mockSocialService.js
// Mock service para desarrollo del sistema social
// Integrado con el tema cinematográfico "Rey del Truco"

class MockSocialService {
  constructor() {
    this.friends = new Map();
    this.friendRequests = new Map();
    this.blockedUsers = new Set();
    this.challenges = new Map();
    this.users = this.generateMockUsers();
    this.rankings = this.generateMockRankings();
    this.delay = 800; // Simular latencia de red
  }

  generateMockUsers() {
    return [
      {
        id: 'user-1',
        username: 'el_mago_carlos',
        name: 'Carlos "El Mago" Martínez',
        avatar: '/images/avatars/carlos.jpg',
        city: 'Rosario',
        province: 'Santa Fe',
        games_played: 89,
        games_won: 60,
        win_rate: 67.4,
        current_streak: 3,
        best_streak: 12,
        rank_local: 1,
        rank_national: 45,
        is_online: true,
        last_seen: null,
        relationship_status: 'none',
        badges: ['👑', '🔥', '💀'],
        achievements: 23,
        joined_date: '2024-01-15',
        favorite_quote: '"En el truco, como en la vida, el que se queda callado no gana"'
      },
      {
        id: 'user-2',
        username: 'maria_silenciosa',
        name: 'María "La Silenciosa" González',
        avatar: '/images/avatars/maria.jpg',
        city: 'Córdoba',
        province: 'Córdoba',
        games_played: 156,
        games_won: 122,
        win_rate: 78.2,
        current_streak: 7,
        best_streak: 15,
        rank_local: 2,
        rank_national: 12,
        is_online: true,
        last_seen: null,
        relationship_status: 'none',
        badges: ['🥈', '⚡', '🎯'],
        achievements: 31,
        joined_date: '2024-01-10',
        favorite_quote: '"Las cartas hablan por mí"'
      },
      {
        id: 'user-3',
        username: 'pedro_terrible',
        name: 'Pedro "El Terrible" López',
        avatar: '/images/avatars/pedro.jpg',
        city: 'Buenos Aires',
        province: 'Buenos Aires',
        games_played: 203,
        games_won: 119,
        win_rate: 58.6,
        current_streak: 1,
        best_streak: 8,
        rank_local: 4,
        rank_national: 89,
        is_online: false,
        last_seen: Date.now() - (2 * 60 * 60 * 1000), // 2 horas atrás
        relationship_status: 'friend',
        badges: ['🥉', '💪', '🚀'],
        achievements: 18,
        joined_date: '2024-01-05',
        favorite_quote: '"Me dicen terrible por algo"'
      },
      {
        id: 'user-4',
        username: 'luis_manos_frias',
        name: 'Luis "Manos Frías" Rodríguez',
        avatar: '/images/avatars/luis.jpg',
        city: 'Rosario',
        province: 'Santa Fe',
        games_played: 98,
        games_won: 60,
        win_rate: 61.2,
        current_streak: 0,
        best_streak: 6,
        rank_local: 5,
        rank_national: 156,
        is_online: true,
        last_seen: null,
        relationship_status: 'none',
        badges: ['🎭', '❄️', '🎪'],
        achievements: 12,
        joined_date: '2024-01-20',
        favorite_quote: '"Frías las manos, caliente el juego"'
      },
      {
        id: 'user-5',
        username: 'ana_la_reina',
        name: 'Ana "La Reina" Fernández',
        avatar: '/images/avatars/ana.jpg',
        city: 'Mendoza',
        province: 'Mendoza',
        games_played: 145,
        games_won: 98,
        win_rate: 67.6,
        current_streak: 5,
        best_streak: 11,
        rank_local: 1,
        rank_national: 67,
        is_online: false,
        last_seen: Date.now() - (45 * 60 * 1000), // 45 minutos atrás
        relationship_status: 'none',
        badges: ['👸', '🏆', '💎'],
        achievements: 27,
        joined_date: '2024-01-08',
        favorite_quote: '"En mi reino, yo hago las reglas"'
      }
    ];
  }

  generateMockRankings() {
    return {
      cordoba: {
        location: 'Córdoba',
        type: 'local',
        total_players: 1247,
        min_games: 10,
        last_updated: Date.now() - (30 * 60 * 1000),
        players: [
          {
            rank: 1,
            user: this.users[0],
            stats: {
              total_games: 489,
              total_wins: 401,
              win_rate: 82.0,
              ranking_score: 892.5,
              current_streak: 8
            },
            rank_change: 0,
            trend: 'stable',
            badge: '👑'
          },
          {
            rank: 2,
            user: this.users[1],
            stats: {
              total_games: 356,
              total_wins: 278,
              win_rate: 78.1,
              ranking_score: 845.2,
              current_streak: 5
            },
            rank_change: 1,
            trend: 'up',
            badge: '🥈'
          },
          {
            rank: 3,
            user: {
              id: 'current-user',
              username: 'juantruco',
              name: 'JUAN (VOS)',
              is_current_user: true,
              city: 'Córdoba'
            },
            stats: {
              total_games: 127,
              total_wins: 87,
              win_rate: 68.5,
              ranking_score: 712.3,
              current_streak: 3
            },
            rank_change: 2,
            trend: 'up',
            badge: '🥉'
          }
        ]
      },
      argentina: {
        location: 'Argentina',
        type: 'national',
        total_players: 45239,
        min_games: 25,
        last_updated: Date.now() - (60 * 60 * 1000),
        players: [
          {
            rank: 847,
            user: {
              id: 'current-user',
              username: 'juantruco',
              name: 'JUAN (VOS)',
              is_current_user: true,
              city: 'Córdoba'
            },
            stats: {
              total_games: 127,
              total_wins: 87,
              win_rate: 68.5,
              ranking_score: 712.3,
              current_streak: 3
            },
            rank_change: -15,
            trend: 'down',
            progress_percentage: 98.13
          }
        ]
      }
    };
  }

  // ========================================
  // SISTEMA DE AMIGOS
  // ========================================

  async getFriends(options = {}) {
    await this.simulateDelay();
    
    const { limit = 50, offset = 0, search = '', online_only = false } = options;
    
    let friends = this.users
      .filter(user => user.relationship_status === 'friend')
      .map(user => ({
        ...user,
        friendship_since: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
        mutual_friends: Math.floor(Math.random() * 8) + 1,
        games_played_together: Math.floor(Math.random() * 25) + 1,
        head_to_head: {
          wins: Math.floor(Math.random() * 15) + 1,
          losses: Math.floor(Math.random() * 15) + 1
        }
      }));

    // Filtros
    if (search) {
      friends = friends.filter(friend => 
        friend.name.toLowerCase().includes(search.toLowerCase()) ||
        friend.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (online_only) {
      friends = friends.filter(friend => friend.is_online);
    }

    // Paginación
    const total = friends.length;
    friends = friends.slice(offset, offset + limit);

    return {
      friends,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total
      }
    };
  }

  async getFriendRequests(options = {}) {
    await this.simulateDelay();
    
    const { type = 'received', limit = 20 } = options;
    
    const mockRequests = [
      {
        id: 'req-1',
        type: 'received',
        user: this.users[0],
        message: '¡Hola! Jugamos ayer en el club, ¿te acordás?',
        mutual_friends: 2,
        created_at: Date.now() - (2 * 60 * 60 * 1000)
      },
      {
        id: 'req-2',
        type: 'received',
        user: this.users[1],
        message: 'Vi que también jugás truco. ¡Agreguemonos!',
        mutual_friends: 1,
        created_at: Date.now() - (5 * 60 * 60 * 1000)
      },
      {
        id: 'req-3',
        type: 'sent',
        user: this.users[4],
        message: '¡Hola Ana! ¿Jugamos una partida?',
        mutual_friends: 0,
        created_at: Date.now() - (24 * 60 * 60 * 1000)
      }
    ];

    let requests = mockRequests;
    if (type !== 'all') {
      requests = requests.filter(req => req.type === type);
    }

    return {
      requests: requests.slice(0, limit),
      counts: {
        received: mockRequests.filter(r => r.type === 'received').length,
        sent: mockRequests.filter(r => r.type === 'sent').length
      }
    };
  }

  async sendFriendRequest(userId, message = '') {
    await this.simulateDelay();
    
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.relationship_status === 'friend') {
      throw new Error('Ya son amigos');
    }

    if (user.relationship_status === 'blocked') {
      throw new Error('No puedes enviar solicitudes a usuarios bloqueados');
    }

    // Simular envío exitoso
    user.relationship_status = 'pending_sent';
    
    return {
      request: {
        id: `req-${Date.now()}`,
        to_user: user,
        message,
        status: 'pending',
        created_at: Date.now()
      }
    };
  }

  async respondToFriendRequest(requestId, action, message = '') {
    await this.simulateDelay();
    
    if (action === 'accept') {
      // Simular aceptación
      const user = this.users.find(u => u.relationship_status === 'pending_received');
      if (user) {
        user.relationship_status = 'friend';
      }
      
      return {
        request: {
          id: requestId,
          status: 'accepted',
          responded_at: Date.now()
        },
        friendship: {
          id: `friendship-${Date.now()}`,
          friend: user,
          created_at: Date.now()
        }
      };
    } else if (action === 'reject') {
      return {
        request: {
          id: requestId,
          status: 'rejected',
          responded_at: Date.now()
        }
      };
    }
  }

  async removeFriend(friendId) {
    await this.simulateDelay();
    
    const user = this.users.find(u => u.id === friendId);
    if (user) {
      user.relationship_status = 'none';
    }
    
    return { success: true };
  }

  async blockUser(userId, reason = '') {
    await this.simulateDelay();
    
    this.blockedUsers.add(userId);
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.relationship_status = 'blocked';
    }
    
    return { success: true };
  }

  // ========================================
  // BÚSQUEDA DE USUARIOS
  // ========================================

  async searchUsers(term, options = {}) {
    await this.simulateDelay();
    
    const { limit = 10, exclude_friends = true, location_radius } = options;
    
    let results = this.users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.username.toLowerCase().includes(term.toLowerCase());
      
      const notBlocked = !this.blockedUsers.has(user.id);
      const notFriend = exclude_friends ? user.relationship_status !== 'friend' : true;
      
      return matchesSearch && notBlocked && notFriend;
    });

    // Simular distancia si se especifica radio
    if (location_radius) {
      results = results.map(user => ({
        ...user,
        distance_km: Math.random() * location_radius
      }));
    }

    // Agregar datos de mutual friends
    results = results.map(user => ({
      ...user,
      mutual_friends: Math.floor(Math.random() * 5)
    }));

    return {
      users: results.slice(0, limit),
      total: results.length,
      suggestions: {
        by_mutual_friends: Math.floor(results.length * 0.4),
        by_location: Math.floor(results.length * 0.3),
        by_activity: Math.floor(results.length * 0.3)
      }
    };
  }

  async getFriendSuggestions() {
    await this.simulateDelay();
    
    const suggestions = this.users
      .filter(user => user.relationship_status === 'none')
      .slice(0, 5)
      .map(user => ({
        ...user,
        reason: this.generateSuggestionReason(user),
        mutual_friends: Math.floor(Math.random() * 6) + 1,
        confidence_score: Math.random() * 0.4 + 0.6
      }));

    return {
      suggestions,
      categories: {
        mutual_friends: Math.floor(suggestions.length * 0.6),
        location_based: Math.floor(suggestions.length * 0.4),
        similar_playstyle: Math.floor(suggestions.length * 0.3)
      }
    };
  }

  generateSuggestionReason(user) {
    const reasons = [
      `${user.mutual_friends || 2} amigos en común`,
      `Mismo nivel de juego (${user.win_rate}% WR)`,
      `También juega en ${user.city}`,
      'Actividad similar',
      'Recomendado por el algoritmo'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  // ========================================
  // RANKINGS Y LEADERBOARDS
  // ========================================

  async getRanking(location, options = {}) {
    await this.simulateDelay();
    
    const { limit = 20, include_user = true } = options;
    
    const ranking = this.rankings[location.toLowerCase()];
    if (!ranking) {
      throw new Error('Ranking no encontrado para esta ubicación');
    }

    let players = ranking.players.slice(0, limit);
    
    // Incluir posición del usuario actual si no está en el top
    let userPosition = null;
    if (include_user) {
      const currentUserRank = ranking.players.find(p => p.user.is_current_user);
      if (currentUserRank) {
        userPosition = {
          rank: currentUserRank.rank,
          total_players: ranking.total_players,
          progress_to_next: {
            rank_target: currentUserRank.rank - 1,
            target_user: ranking.players[currentUserRank.rank - 2]?.user.name || 'Líder',
            wins_needed: Math.floor(Math.random() * 50) + 20,
            win_rate_needed: Math.random() * 10 + 70,
            estimated_months: Math.random() * 3 + 1,
            games_behind: Math.floor(Math.random() * 100) + 50
          },
          recent_changes: {
            positions_gained: currentUserRank.rank_change,
            period: 'last_week'
          }
        };
      }
    }

    return {
      ranking: {
        location: ranking.location,
        type: ranking.type,
        total_players: ranking.total_players,
        min_games: ranking.min_games,
        last_updated: ranking.last_updated
      },
      players,
      user_position: userPosition
    };
  }

  async getUserRankingProgress(userId) {
    await this.simulateDelay();
    
    return {
      current_rankings: [
        {
          location: 'Córdoba',
          type: 'local',
          rank: 3,
          total_players: 1247,
          progress_percentage: 99.76
        },
        {
          location: 'Argentina',
          type: 'national',
          rank: 847,
          total_players: 45239,
          progress_percentage: 98.13
        }
      ],
      climbing_analysis: {
        best_location: 'Córdoba',
        fastest_climb: {
          location: 'Córdoba',
          positions_gained: 15,
          period_days: 30
        },
        next_milestone: {
          target: 'Top 2 Córdoba',
          requirements: {
            wins_needed: 229,
            win_rate_target: 78.0,
            estimated_completion: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString()
          }
        }
      }
    };
  }

  // ========================================
  // SISTEMA DE DESAFÍOS
  // ========================================

  async getChallenges(options = {}) {
    await this.simulateDelay();
    
    const { status = 'pending', type = 'received' } = options;
    
    const mockChallenges = [
      {
        id: 'challenge-1',
        type: 'received',
        challenger: this.users[0],
        challenge_details: {
          type: 'revenge',
          message: 'Esta vez te gano, preparate',
          context: {
            last_game: {
              result: 'lost', // Carlos perdió
              score: '30-18',
              description: 'Lo dormiste afuera'
            },
            head_to_head: {
              record: '14-8',
              winner: 'you',
              win_rate: 63.6
            }
          }
        },
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
        created_at: Date.now() - (2 * 60 * 60 * 1000)
      },
      {
        id: 'challenge-2',
        type: 'received',
        challenger: this.users[1],
        challenge_details: {
          type: 'friendly',
          message: '¿Jugamos una partida rápida?',
          context: {
            last_game: {
              result: 'won',
              score: '30-24',
              description: 'Victoria cerrada'
            },
            head_to_head: {
              record: '5-5',
              winner: 'tie',
              win_rate: 50.0
            }
          }
        },
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
        created_at: Date.now() - (45 * 60 * 1000)
      }
    ];

    let challenges = mockChallenges;
    if (type !== 'all') {
      challenges = challenges.filter(c => c.type === type);
    }

    return {
      challenges,
      summary: {
        pending_received: mockChallenges.filter(c => c.type === 'received').length,
        pending_sent: 1,
        completed_today: 0
      }
    };
  }

  async sendChallenge(challengedUserId, challengeType = 'friendly', message = '') {
    await this.simulateDelay();
    
    const user = this.users.find(u => u.id === challengedUserId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const challenge = {
      id: `challenge-${Date.now()}`,
      challenged_user: user,
      challenge_type: challengeType,
      message,
      context: {
        last_game: {
          result: Math.random() > 0.5 ? 'won' : 'lost',
          score: '30-24',
          description: 'Victoria cerrada'
        },
        head_to_head: {
          record: '15-8',
          winner: 'you'
        }
      },
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000),
      created_at: Date.now()
    };

    return { challenge };
  }

  async respondToChallenge(challengeId, action, message = '') {
    await this.simulateDelay();
    
    return {
      challenge: {
        id: challengeId,
        status: action === 'accept' ? 'accepted' : 'rejected',
        response_message: message,
        responded_at: Date.now(),
        next_steps: action === 'accept' ? {
          action: 'start_game',
          deep_link: '/play/challenge/' + challengeId
        } : null
      }
    };
  }

  // ========================================
  // ACTIVITY FEED
  // ========================================

  async getActivityFeed(options = {}) {
    await this.simulateDelay();
    
    const { limit = 20, type = 'all' } = options;
    
    const activities = [
      {
        id: 'activity-1',
        type: 'game_won',
        user: this.users[0],
        data: {
          opponent: 'Pedro López',
          score: '30-18',
          result: 'won',
          achievement: 'Lo durmió afuera'
        },
        created_at: Date.now() - (30 * 60 * 1000),
        visibility: 'friends'
      },
      {
        id: 'activity-2',
        type: 'rank_up',
        user: this.users[1],
        data: {
          old_rank: 3,
          new_rank: 2,
          location: 'Córdoba'
        },
        created_at: Date.now() - (2 * 60 * 60 * 1000),
        visibility: 'friends'
      },
      {
        id: 'activity-3',
        type: 'achievement_unlocked',
        user: this.users[2],
        data: {
          achievement: 'Rey del Barrio',
          description: '100 victorias',
          badge: '👑'
        },
        created_at: Date.now() - (4 * 60 * 60 * 1000),
        visibility: 'friends'
      },
      {
        id: 'activity-4',
        type: 'streak_started',
        user: this.users[3],
        data: {
          streak_length: 5,
          streak_type: 'winning'
        },
        created_at: Date.now() - (6 * 60 * 60 * 1000),
        visibility: 'friends'
      }
    ];

    return {
      activities: activities.slice(0, limit),
      has_more: activities.length > limit
    };
  }

  // ========================================
  // UTILIDADES
  // ========================================

  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  // Método para cambiar el delay en desarrollo
  setDelay(ms) {
    this.delay = ms;
  }

  // Método para resetear datos mock
  resetMockData() {
    this.friends.clear();
    this.friendRequests.clear();
    this.blockedUsers.clear();
    this.challenges.clear();
    this.users = this.generateMockUsers();
    this.rankings = this.generateMockRankings();
  }
}

// Instancia singleton para usar en toda la app
export const mockSocialService = new MockSocialService();

// Configurar para desarrollo más rápido
if (process.env.NODE_ENV === 'development') {
  mockSocialService.setDelay(300);
}