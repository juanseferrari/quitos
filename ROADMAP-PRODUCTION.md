# 🏆 REY DEL TRUCO - ROADMAP TO PRODUCTION
## Documento de Definición y Arquitectura Técnica

### 📋 **SITUACIÓN ACTUAL**
- ✅ **Frontend funcional** con mocks
- ✅ **UI/UX cinematográfico** implementado
- ✅ **Anotador core** funcionando
- ❌ **Todo en localStorage** (se pierde al reinstalar)
- ❌ **Authentication mock** (no es real)
- ❌ **Social features mock** (no hay usuarios reales)

---

## 🎯 **FASE 1: AUTHENTICATION & USER FOUNDATION**
**Tiempo estimado: 2-3 semanas**
**Prioridad: CRÍTICA**

### **¿Por qué primero?**
Sin auth real, todos los datos se pierden. Es el foundation de TODO lo demás.

### **1.1 Backend Setup (3-4 días)**
```bash
# Servicios a crear/configurar:
- Supabase project setup
- Database schema design
- API routes planning
- Authentication policies
```

**Archivos a crear:**
```
/src/config/
  ├── supabase.js          # Cliente Supabase
  └── database.sql         # Schema inicial

/src/services/
  ├── authService.js       # Reemplaza mockAuthService
  └── userService.js       # CRUD usuarios
```

**Challenge:** ¿Supabase vs Firebase vs custom backend?
- **Supabase**: Más fácil, PostgreSQL, muy bueno para MVPs
- **Firebase**: Más popular, mejor para tiempo real
- **Custom (Node.js)**: Más control, más complejo

**Mi recomendación: Supabase** por velocidad de desarrollo.

### **1.2 Database Schema (2-3 días)**
```sql
-- Usuarios básicos
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Games (reemplaza localStorage)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  player1_name VARCHAR(100),
  player2_name VARCHAR(100),
  points_us INTEGER,
  points_them INTEGER,
  total_points INTEGER,
  winner VARCHAR(10), -- 'nos' | 'ellos'
  game_data JSONB, -- historial completo
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Challenge:** ¿Estructura de game_data?
- **Opción A:** Todo en JSONB (más flexible)
- **Opción B:** Tablas separadas (más normalizado)

**Mi recomendación: JSONB** para empezar, normalizar después.

### **1.3 Authentication Real (3-4 días)**
```javascript
// Reemplazar mockAuthService.js
class SupabaseAuthService {
  async signInWithGoogle() {
    // Google OAuth real
  }
  
  async signInWithApple() {
    // Apple Sign-In (iOS requirement)
  }
  
  async signOut() {
    // Logout + clear local data
  }
}
```

**Archivos a modificar:**
- `src/hooks/useAuth.js` - Conectar con Supabase
- `src/contexts/AuthContext.jsx` - Real auth state
- `src/components/AuthSelectionScreen.jsx` - Botones reales

**Challenge:** ¿Qué providers de auth?
- **Google**: OBLIGATORIO (principal)
- **Apple**: OBLIGATORIO (iOS App Store requirement)
- **Email/Password**: OPCIONAL (más fricción)

### **1.4 User Profiles (2-3 días)**
```javascript
// src/services/userService.js
class UserService {
  async createProfile(authUser) {
    // Crear perfil inicial
  }
  
  async updateProfile(updates) {
    // Actualizar nombre, avatar, etc.
  }
  
  async getUserStats(userId) {
    // Stats reales desde DB
  }
}
```

**Challenge:** ¿Cuánta info pedir al registro?
- **Mínima**: Solo nombre (recomendado)
- **Completa**: Nombre, ciudad, edad, etc.

---

## 🎨 **FASE 2: VISUAL & BRAND ENHANCEMENT**
**Tiempo estimado: 2-3 semanas**
**Prioridad: ALTA**

### **2.1 Professional Assets (1 semana)**
```
Crear/Obtener:
├── Logo oficial (.svg)
├── App icon (1024x1024)
├── Splash screen
├── Tab icons custom
└── Loading animations
```

**Archivos a crear:**
```
/public/assets/
  ├── logo.svg
  ├── app-icon.png
  └── splash-screen.png

/src/components/
  ├── LoadingSpinner.jsx
  └── SplashScreen.jsx
```

**Challenge:** ¿Contratar diseñador o usar AI/templates?
- **Diseñador**: $500-2000, resultado profesional
- **AI (Midjourney)**: $20/mes, más control
- **Templates**: Gratis, menos único

### **2.2 Animation System (1 semana)**
```javascript
// src/utils/animations.js
export const celebrationEffects = {
  victory: () => {/* confetti */},
  point: () => {/* sparkles */},
  achievement: () => {/* golden burst */}
};
```

**Libraries a evaluar:**
- **Framer Motion**: Más potente
- **React Spring**: Más ligero
- **Lottie**: Para animaciones complejas

**Challenge:** ¿Performance vs. visual appeal?

### **2.3 Micro-interactions (3-4 días)**
- Haptic feedback en botones
- Smooth transitions
- Loading states elegantes
- Error states informativos

---

## 🎮 **FASE 3: REAL DATA PERSISTENCE**
**Tiempo estimado: 1-2 semanas**
**Prioridad: ALTA**

### **3.1 Game Storage Real (1 semana)**
```javascript
// Reemplazar useGamePersistence.js
class GamePersistenceService {
  async saveGame(gameState) {
    // Guardar en Supabase
  }
  
  async loadUserGames(userId) {
    // Cargar historial real
  }
  
  async syncOfflineGames() {
    // Sync cuando vuelve conexión
  }
}
```

**Challenge:** ¿Sync strategy?
- **Real-time**: Cada punto se guarda
- **Batch**: Solo al finalizar partida
- **Hybrid**: Real-time + fallback

### **3.2 Stats Real (3-4 días)**
```sql
-- Stats table
CREATE TABLE user_stats (
  user_id UUID REFERENCES users(id),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 👥 **FASE 4: SOCIAL FEATURES REAL**
**Tiempo estimado: 3-4 semanas**
**Prioridad: MEDIA**

### **4.1 User Discovery (1 semana)**
```javascript
// src/services/socialService.js
class SocialService {
  async searchUsers(query) {
    // Búsqueda real con debounce
  }
  
  async getNearbyUsers() {
    // Por ubicación (opcional)
  }
  
  async getSuggestedFriends() {
    // ML-based suggestions
  }
}
```

**Challenge:** ¿Privacy vs. discoverability?

### **4.2 Friend System (1 semana)**
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  addressee_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **4.3 Challenges Real (1-2 semanas)**
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES users(id),
  challenged_id UUID REFERENCES users(id),
  challenge_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  game_id UUID REFERENCES games(id), -- cuando se acepta
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🏆 **FASE 5: ACHIEVEMENTS & GAMIFICATION**
**Tiempo estimado: 2-3 semanas**
**Prioridad: MEDIA**

### **5.1 Achievement Engine (2 semanas)**
```javascript
// src/services/achievementEngine.js
class AchievementEngine {
  async checkAchievements(userId, gameData) {
    // Server-side verification
    // Anti-cheat measures
  }
  
  async unlockAchievement(userId, achievementId) {
    // Real unlock with timestamp
  }
}
```

**Challenge:** ¿Client-side vs. server-side verification?
- **Client**: Más rápido, pero hackeable
- **Server**: Más seguro, pero latencia

### **5.2 Push Notifications (3-4 días)**
```javascript
// Achievement unlocks
// Friend requests
// Challenge invitations
```

---

## 📱 **FASE 6: PRODUCTION READINESS**
**Tiempo estimado: 2-3 semanas**
**Prioridad: MEDIA**

### **6.1 Error Handling & Monitoring (1 semana)**
```javascript
// src/utils/errorHandler.js
// src/utils/analytics.js (opcional)
```

### **6.2 Performance Optimization (3-4 días)**
- Bundle size optimization
- Image optimization
- Lazy loading
- Caching strategies

### **6.3 iOS App Store Preparation (1 semana)**
- Privacy policy
- Terms of service
- App Store screenshots
- App Store Connect setup

---

## 🎯 **CHALLENGES & DECISIONES CLAVE**

### **Technology Stack**
| Aspecto | Opción A | Opción B | Recomendación |
|---------|----------|----------|---------------|
| **Backend** | Supabase | Firebase | **Supabase** (PostgreSQL + más barato) |
| **Auth** | Firebase Auth | Supabase Auth | **Supabase** (consistencia) |
| **Storage** | Supabase Storage | Cloudinary | **Supabase** (todo integrado) |
| **Animations** | Framer Motion | React Spring | **Framer Motion** (más features) |
| **Push Notifications** | OneSignal | Native | **OneSignal** (más fácil) |

### **Costos Estimados**
```
Supabase Pro: $25/mes
Dominio: $12/año
Apple Developer: $99/año
Google Play: $25 one-time
OneSignal: Free hasta 10k users

Total: ~$40/mes + $136 setup
```

### **MVP vs. Full Feature Set**
**MVP (3-4 semanas):**
- Auth real
- Game persistence
- Basic stats
- Visual polish

**Full (8-10 semanas):**
- Social features
- Achievements
- Push notifications
- Advanced analytics

---

## 🚀 **RECOMMENDED START: FASE 1.1**

**Comenzar con Authentication porque:**
1. **Sin auth, todo es temporal**
2. **iOS App Store requiere Apple Sign-In**
3. **Base para todas las otras features**
4. **Mayor impacto en user experience**

**Primera semana breakdown:**
- **Día 1-2**: Supabase setup + schema
- **Día 3-4**: Google Auth implementation
- **Día 5-7**: Profile management + testing

¿Qué opinas? ¿Empezamos con Supabase setup o prefieres challengear alguna decisión?