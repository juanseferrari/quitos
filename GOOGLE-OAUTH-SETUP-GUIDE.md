# Guía Completa: Configuración de Google OAuth con Supabase

Esta guía detalla el proceso completo para configurar Google OAuth en una app React con Supabase, incluyendo todos los problemas comunes y sus soluciones.

## 📋 Requisitos Previos

- Proyecto en Supabase creado
- App React con Create React App
- Cuenta de Google Cloud Platform

## 🎯 Paso 1: Configuración en Google Cloud Console

### 1.1 Crear Credenciales OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services → Credentials**
4. Click **"+ CREATE CREDENTIALS" → "OAuth client ID"**
5. **Tipo de aplicación**: Selecciona **"Web application"** (NO Android/iOS)
6. **Nombre**: `Rey del Truco Web Client`

### 1.2 Configurar URIs de Redirección

**Orígenes de JavaScript autorizados:**
```
http://localhost:3000
https://tu-dominio.com
```

**URIs de redirección autorizadas:**
```
https://TU-PROYECTO-ID.supabase.co/auth/v1/callback
http://localhost:3000
```

> ⚠️ **Importante**: Usa exactamente estas URLs. Capacitor URLs como `capacitor://localhost` NO funcionan en desarrollo web.

### 1.3 Guardar Credenciales

Guarda:
- **Client ID**: `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxx`

## 🗄️ Paso 2: Configuración en Supabase

### 2.1 Activar Google OAuth

1. Ve a tu **Supabase Dashboard**
2. **Authentication → Providers**
3. Busca **Google** y habilítalo
4. Ingresa tu **Client ID** y **Client Secret**
5. **Redirect URL**: Se genera automáticamente
6. **Skip nonce checks**: ✅ **Habilitado** (para desarrollo)

### 2.2 Configurar Variables de Entorno

Crea `.env.local`:
```env
REACT_APP_SUPABASE_URL=https://tu-proyecto-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🏗️ Paso 3: Estructura de Base de Datos

### 3.1 Tabla Users (Requerida)

```sql
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    auth_provider TEXT DEFAULT 'google',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
```

### 3.2 Tabla User Stats (Si es requerida por triggers)

Si tu migración inicial creó triggers que referencian `user_stats`, necesitas esta tabla:

```sql
CREATE TABLE public.user_stats (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    win_percentage NUMERIC DEFAULT 0.00,
    current_win_streak INTEGER DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    current_loss_streak INTEGER DEFAULT 0,
    total_points_scored INTEGER DEFAULT 0,
    total_points_conceded INTEGER DEFAULT 0,
    average_points_per_game NUMERIC DEFAULT 0.00,
    falta_envidos_played INTEGER DEFAULT 0,
    falta_envidos_won INTEGER DEFAULT 0,
    total_play_time_minutes INTEGER DEFAULT 0,
    average_game_duration NUMERIC DEFAULT 0.00,
    current_rank INTEGER DEFAULT 1000,
    highest_rank INTEGER DEFAULT 1000,
    rank_points INTEGER DEFAULT 0,
    last_game_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 3.3 Políticas RLS (Row Level Security)

```sql
-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "oauth_user_insert" ON public.users;
DROP POLICY IF EXISTS "oauth_user_select" ON public.users;
DROP POLICY IF EXISTS "oauth_user_update" ON public.users;

-- Crear políticas para OAuth
CREATE POLICY "oauth_full_access" 
ON public.users 
FOR ALL 
TO authenticated
USING (auth.uid()::text = auth_uid)
WITH CHECK (auth.uid()::text = auth_uid);

CREATE POLICY "oauth_signup_insert" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = auth_uid);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.users TO authenticated;
```

### 3.4 Trigger para User Stats (Si aplica)

```sql
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (
        user_id, games_played, games_won, games_lost, 
        win_percentage, current_win_streak, longest_win_streak,
        current_loss_streak, total_points_scored, total_points_conceded,
        average_points_per_game, falta_envidos_played, falta_envidos_won,
        total_play_time_minutes, average_game_duration, current_rank,
        highest_rank, rank_points, updated_at
    ) VALUES (
        NEW.id, 0, 0, 0, 0.00, 0, 0, 0, 0, 0, 0.00, 0, 0, 0, 0.00, 1000, 1000, 0, NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_stats_trigger ON public.users;
CREATE TRIGGER create_user_stats_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_stats();
```

## 💻 Paso 4: Implementación en React

### 4.1 Configuración de Supabase

`src/config/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null;
```

### 4.2 Servicio de Autenticación

`src/services/authService.js`:
```javascript
import { supabase, isSupabaseConfigured } from '../config/supabase';

class AuthService {
  constructor() {
    this.supabase = supabase;
    this.isConfigured = isSupabaseConfigured();
    this.currentUser = null;
    this.userProfile = null;
    
    this.initializeAuthListener();
  }

  initializeAuthListener() {
    if (!this.isConfigured) return;

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser = session.user;
        await this.ensureUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.userProfile = null;
      }
    });
  }

  async signInWithGoogle() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      const redirectUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : `${window.location.origin}`;
        
      console.log('🔐 Starting Google OAuth with redirect:', redirectUrl);

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('🔥 Google sign in error:', error);
      throw error;
    }
  }

  async ensureUserProfile(authUser) {
    if (!authUser) return null;

    try {
      let { data: profile, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_uid', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('📝 Creating user profile for:', authUser.email);
        
        const newProfile = {
          auth_uid: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || 
                authUser.user_metadata?.name || 
                authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || 
                     authUser.user_metadata?.picture,
          auth_provider: authUser.app_metadata?.provider || 'google',
          last_login: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await this.supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('🔥 Error creating profile:', createError);
          throw createError;
        }

        profile = createdProfile;
      } else if (error) {
        throw error;
      } else {
        // Update last login
        await this.supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('auth_uid', authUser.id);
      }

      this.userProfile = profile;
      return profile;
    } catch (error) {
      console.error('🔥 Ensure profile error:', error);
      return null;
    }
  }

  async getSession() {
    if (!this.isConfigured) {
      return { session: null, user: null };
    }

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      
      return { 
        session, 
        user: session?.user || null 
      };
    } catch (error) {
      console.error('🔥 Get session error:', error);
      return { session: null, user: null };
    }
  }

  async signOut() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
      this.userProfile = null;
      
      return { success: true };
    } catch (error) {
      console.error('🔥 Sign out error:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isMockMode() {
    return !this.isConfigured;
  }
}

const authService = new AuthService();
export default authService;
```

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "Database error saving new user"

**Causa**: Tabla `user_stats` no existe pero hay triggers que la referencian.

**Solución**: Crear la tabla `user_stats` y el trigger como se muestra en el Paso 3.

### Problema 2: "Policy X already exists"

**Causa**: Políticas RLS duplicadas.

**Solución**: Ejecutar `DROP POLICY IF EXISTS` antes de crear nuevas políticas.

### Problema 3: OAuth funciona pero no crea sesión

**Causa**: URL de redirección incorrecta.

**Solución**: Verificar que las URLs en Google Cloud Console coincidan exactamente con las configuradas.

### Problema 4: "Skip nonce checks"

**Causa**: Verificación adicional de seguridad en Supabase.

**Solución**: Habilitar "Skip nonce checks" en Supabase Auth Settings para desarrollo.

## ✅ Testing y Verificación

### Script de Prueba SQL

```sql
-- Probar creación de usuario completa
INSERT INTO public.users (auth_uid, email, name, auth_provider) 
VALUES ('test-oauth-flow', 'test@example.com', 'Test User', 'google');

-- Verificar que se crearon ambos registros
SELECT 
    u.email,
    s.games_played,
    s.current_rank
FROM public.users u
LEFT JOIN public.user_stats s ON u.id = s.user_id
WHERE u.auth_uid = 'test-oauth-flow';

-- Limpiar
DELETE FROM public.users WHERE auth_uid = 'test-oauth-flow';
```

### Logs de Éxito

Cuando funciona correctamente debes ver:
```
🔐 Starting Google OAuth with redirect: http://localhost:3000
✅ OAuth initiated, redirecting to Google...
🔄 Auth state changed: SIGNED_IN
👤 Session user: usuario@gmail.com
✅ Active session found! User: usuario@gmail.com
```

## 📝 Checklist Final

- [ ] Google Cloud Console configurado con URLs correctas
- [ ] Supabase OAuth habilitado con credenciales correctas
- [ ] Skip nonce checks habilitado en Supabase
- [ ] Tabla `users` creada con políticas RLS
- [ ] Tabla `user_stats` creada (si es necesaria)
- [ ] Trigger `create_user_stats` configurado
- [ ] Variables de entorno configuradas
- [ ] AuthService implementado
- [ ] OAuth probado y funcionando

## 🚀 Resultado Final

Una vez completado, tendrás:
- ✅ Login con Google funcional
- ✅ Creación automática de perfil de usuario
- ✅ Gestión de sesiones persistente
- ✅ Base de datos sincronizada
- ✅ Estadísticas de usuario inicializadas

---

*Esta guía cubre todos los problemas encontrados durante la implementación real y sus soluciones definitivas.*