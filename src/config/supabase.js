// src/config/supabase.js - Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - works in both web and iOS
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://pmymvwpgjacrkbimccao.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteW12d3BnamFjcmtiaW1jY2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzA3OTksImV4cCI6MjA4MTY0Njc5OX0.PJF9HEINW2DJJmFrYCrM_OkTSH9YoYHjYKVnJuw1o0Y';

console.log('🔐 Supabase config:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseAnonKey ? 'configured' : 'missing',
  platform: window.Capacitor ? window.Capacitor.getPlatform() : 'web'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Using mock services.');
}

// Storage key para la sesión de Supabase
const STORAGE_KEY = 'rey-del-truco-auth';

// Create Supabase client with session persistence
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // DESHABILITADO: Manejaremos manualmente en AuthCallbackPage
        flowType: 'pkce',
        storageKey: STORAGE_KEY, // Key específica para evitar conflictos
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      global: {
        headers: {
          'X-Client-Info': window.Capacitor
            ? `rey-del-truco-ios/${window.Capacitor.getPlatform()}`
            : 'rey-del-truco-web'
        }
      }
    })
  : null;

// Debug y migración de sesión: verificar en múltiples keys
if (typeof window !== 'undefined') {
  // Keys donde Supabase podría haber guardado la sesión
  const possibleKeys = [
    STORAGE_KEY,
    'sb-pmymvwpgjacrkbimccao-auth-token', // Key default de Supabase (sb-{project-ref}-auth-token)
    'supabase.auth.token'
  ];

  let foundSession = null;
  let foundKey = null;

  for (const key of possibleKeys) {
    const saved = localStorage.getItem(key);
    if (saved) {
      console.log(`🔍 Found session in localStorage key: ${key}`);
      foundSession = saved;
      foundKey = key;
      break;
    }
  }

  if (foundSession) {
    try {
      const parsed = JSON.parse(foundSession);
      console.log('🔍 Session user:', parsed?.user?.email || parsed?.currentSession?.user?.email || 'parsing...');

      // Si la sesión estaba en otra key, migrarla a nuestra key
      if (foundKey !== STORAGE_KEY) {
        console.log(`🔄 Migrating session from ${foundKey} to ${STORAGE_KEY}`);
        localStorage.setItem(STORAGE_KEY, foundSession);
      }
    } catch (e) {
      console.log('🔍 Could not parse saved session:', e.message);
    }
  } else {
    console.log('🔍 No Supabase session found in localStorage');
    // Mostrar todas las keys que empiecen con 'sb-' para debug
    const sbKeys = Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase'));
    if (sbKeys.length > 0) {
      console.log('🔍 Found Supabase-related keys:', sbKeys);
    }
  }

  // PWA Detection: Check if running as installed PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
  console.log('📱 Running as PWA:', isPWA);

  // Check for OAuth tokens in URL (PWA callback)
  if (window.location.hash.includes('access_token') || window.location.search.includes('access_token')) {
    console.log('🔐 OAuth tokens detected in URL - callback in progress');
  }
}

// Configuration constants
export const SUPABASE_CONFIG = {
  // Tables
  TABLES: {
    USERS: 'users',
    GAMES: 'games',
    USER_STATS: 'user_stats',
    ACHIEVEMENTS: 'achievements',
    USER_ACHIEVEMENTS: 'user_achievements',
    FRIENDSHIPS: 'friendships',
    CHALLENGES: 'challenges'
  },
  
  // Auth providers
  AUTH_PROVIDERS: {
    GOOGLE: 'google',
    APPLE: 'apple'
  },
  
  // Policies and permissions
  POLICIES: {
    ENABLE_RLS: true,
    USER_BASED_ACCESS: true
  }
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Helper function for error handling
export const handleSupabaseError = (error, context = '') => {
  console.error(`🔥 Supabase Error${context ? ` (${context})` : ''}:`, error);
  
  // Return user-friendly error messages
  if (error?.message?.includes('Invalid login credentials')) {
    return 'Credenciales inválidas. Por favor, intentá de nuevo.';
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return 'Por favor, confirmá tu email antes de iniciar sesión.';
  }
  
  if (error?.message?.includes('Network')) {
    return 'Error de conexión. Verificá tu internet.';
  }
  
  return error?.message || 'Error inesperado. Intentá de nuevo.';
};

export default supabase;