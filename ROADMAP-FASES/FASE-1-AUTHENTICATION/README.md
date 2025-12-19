# 🔐 FASE 1: AUTHENTICATION & USER FOUNDATION

**Tiempo estimado: 2-3 semanas**  
**Prioridad: CRÍTICA**  
**Estado: Pendiente**

## 🎯 OBJETIVO PRINCIPAL

Implementar autenticación real con Supabase, reemplazando completamente el sistema mock actual. Esta fase es CRÍTICA porque sin autenticación real, todos los datos se pierden al reinstalar la app.

## 📋 TAREAS PRINCIPALES

### 1.1 Backend Setup (3-4 días)
- [ ] Crear proyecto Supabase
- [ ] Configurar database schema
- [ ] Configurar authentication policies
- [ ] Setup environment variables

### 1.2 Database Schema (2-3 días)
- [ ] Crear tabla `users`
- [ ] Crear tabla `games` 
- [ ] Crear tabla `user_stats`
- [ ] Configurar Row Level Security (RLS)

### 1.3 Authentication Real (3-4 días)
- [ ] Implementar Google OAuth
- [ ] Implementar Apple Sign-In (requerido para iOS)
- [ ] Reemplazar `mockAuthService`
- [ ] Actualizar `AuthContext`

### 1.4 User Profiles (2-3 días)
- [ ] Crear `userService.js`
- [ ] Implementar profile management
- [ ] Migrar datos de localStorage
- [ ] Testing completo

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico
```
Backend: Supabase (PostgreSQL + Auth + Storage)
Authentication: Supabase Auth + Google + Apple
Client: @supabase/supabase-js
Storage: Supabase Storage (avatars, assets)
```

### Estructura de Archivos
```
src/
├── config/
│   ├── supabase.js          # Cliente Supabase
│   └── database.sql         # Schema completo
├── services/
│   ├── authService.js       # Reemplaza mockAuthService
│   └── userService.js       # CRUD usuarios
└── contexts/
    └── AuthContext.js       # Auth real state
```

---

## 📊 DATABASE SCHEMA

### Tabla `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'google',
  auth_uid TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  preferred_points INTEGER DEFAULT 30,
  is_premium BOOLEAN DEFAULT FALSE
);
```

### Tabla `games`
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  player1_name VARCHAR(100) DEFAULT 'Nosotros',
  player2_name VARCHAR(100) DEFAULT 'Ellos',
  points_us INTEGER DEFAULT 0,
  points_them INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 30,
  winner VARCHAR(10),
  game_data JSONB, -- historial completo
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);
```

### Tabla `user_stats`
```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  win_percentage DECIMAL(5,2) DEFAULT 0.00,
  current_win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  total_points_scored INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔑 AUTHENTICATION FLOW

### 1. Providers Requeridos
- **Google OAuth**: Principal método de login
- **Apple Sign-In**: Obligatorio para iOS App Store
- **Email/Password**: Opcional (mayor fricción)

### 2. Authentication States
```javascript
const authStates = {
  LOADING: 'loading',           // Checking session
  AUTHENTICATED: 'authenticated', // User logged in
  ANONYMOUS: 'anonymous',       // Guest mode
  ERROR: 'error'               // Auth error
};
```

### 3. User Session Management
```javascript
// Auto-refresh tokens
// Persist session across app restarts
// Handle network interruptions
// Graceful fallback to anonymous mode
```

---

## 🔒 SECURITY CONSIDERATIONS

### Row Level Security (RLS)
```sql
-- Users can only access their own data
CREATE POLICY "Users own data" ON users 
  FOR ALL USING (auth.uid()::TEXT = auth_uid);

CREATE POLICY "Users own games" ON games 
  FOR ALL USING (user_id = get_user_id_from_auth());
```

### Data Privacy
- Usuarios solo ven sus propios datos
- Profiles públicos opcionales para rankings
- Configuración de privacidad granular

---

## 📱 iOS CONSIDERATIONS

### Apple Sign-In
```javascript
// Requerido por App Store si hay login social
// Debe ser la opción más prominente
// Manejar casos donde usuario rechaza email
```

### Capacitor Integration
```javascript
// Native OAuth flows
// Keychain storage para tokens
// Background refresh handling
```

---

## 🔄 MIGRATION STRATEGY

### Datos Existentes
1. **Auto-migrate localStorage** → Supabase al primer login
2. **Preserve game history** donde sea posible
3. **Graceful fallback** si migration falla

### Backward Compatibility
- Mantener mock services como fallback
- Progressive enhancement approach
- No romper funcionalidad existente

---

## ✅ DEFINITION OF DONE

### Funcional
- [ ] Login con Google funciona en web e iOS
- [ ] Apple Sign-In funciona en iOS
- [ ] Profile creation automático
- [ ] Data persistence en Supabase
- [ ] Migration de localStorage exitosa

### Técnico
- [ ] Tests unitarios para auth flows
- [ ] Error handling completo
- [ ] Performance acceptable (<2s login)
- [ ] Security audit completo

### UX
- [ ] Loading states elegantes
- [ ] Error messages user-friendly
- [ ] Seamless migration experience
- [ ] Logout flow completo

---

## 🚨 RISKS & MITIGATION

### Risk: Usuarios pierden datos
**Mitigation**: Auto-migration + backup strategy

### Risk: Auth provider downtime
**Mitigation**: Multiple providers + graceful degradation

### Risk: iOS approval issues
**Mitigation**: Apple Sign-In compliance + testing

---

## 📈 SUCCESS METRICS

- **Technical**: 99%+ login success rate
- **Performance**: <2 segundos average login time
- **User**: 0% data loss durante migration
- **Business**: Foundation para monetization

---

## 🔗 DEPENDENCIES

### External
- Supabase project setup
- Google OAuth credentials
- Apple Developer account
- DNS configuration

### Internal
- No romper funcionalidad existente
- Mantener performance actual
- Preservar UX cinematográfico

---

## 📞 NEXT STEPS

1. **Setup Supabase project** (Day 1)
2. **Configure authentication providers** (Day 2)
3. **Implement basic auth flow** (Day 3-4)
4. **Add profile management** (Day 5-6)
5. **Testing & refinement** (Day 7-10)

**¿Todo claro? ¿Empezamos con el setup de Supabase?**