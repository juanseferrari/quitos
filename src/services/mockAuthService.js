// services/mockAuthService.js
class MockAuthService {
  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.delay = 1000; // Simular latencia de red
    
    // Usuario de prueba predefinido
    this.users.set('test@example.com', {
      id: 'mock-user-1',
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      username: 'test_user',
      avatar: 'https://via.placeholder.com/150',
      city: 'Córdoba',
      provider: 'email',
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    });
  }
  
  async signInWithEmail({ email, password }) {
    await this.simulateDelay();
    
    if (email === 'test@example.com' && password === 'password') {
      const user = this.users.get(email);
      const token = this.generateMockToken(user);
      const refreshToken = this.generateMockRefreshToken(user);
      
      return {
        user: { ...user, lastLoginAt: Date.now() },
        token,
        refreshToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      };
    }
    
    throw new Error('Credenciales inválidas');
  }
  
  async signUp(userData) {
    await this.simulateDelay();
    
    if (this.users.has(userData.email)) {
      throw new Error('El email ya está registrado');
    }
    
    const user = {
      id: `mock-user-${Date.now()}`,
      ...userData,
      provider: 'email',
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };
    
    this.users.set(userData.email, user);
    
    const token = this.generateMockToken(user);
    const refreshToken = this.generateMockRefreshToken(user);
    
    return {
      user,
      token,
      refreshToken,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
  }
  
  async verifyToken(token) {
    await this.simulateDelay();
    
    const userData = this.tokens.get(token);
    if (!userData) {
      throw new Error('Token inválido');
    }
    
    return userData;
  }
  
  async signOut(token) {
    await this.simulateDelay();
    this.tokens.delete(token);
    return { success: true };
  }
  
  async updateProfile(userId, updates) {
    await this.simulateDelay();
    
    // Buscar usuario por ID en todos los users
    for (const [email, user] of this.users.entries()) {
      if (user.id === userId) {
        const updatedUser = { ...user, ...updates };
        this.users.set(email, updatedUser);
        return updatedUser;
      }
    }
    
    throw new Error('Usuario no encontrado');
  }
  
  async migrateGameData(userId, gameData) {
    await this.simulateDelay();
    
    console.log(`Mock: Migrando ${gameData.games.length} partidas para usuario ${userId}`);
    
    return {
      success: true,
      migrated: gameData.games.length,
      stats: gameData.stats,
      message: 'Datos migrados exitosamente (mock)'
    };
  }
  
  generateMockToken(user) {
    const token = `mock_token_${user.id}_${Date.now()}`;
    this.tokens.set(token, user);
    return token;
  }
  
  generateMockRefreshToken(user) {
    return `mock_refresh_${user.id}_${Date.now()}`;
  }
  
  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}

export const mockAuthService = new MockAuthService();