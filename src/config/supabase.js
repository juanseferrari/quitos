// src/config/supabase.js - Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - works in both web and iOS
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://pmymvwpgjacrkbimccao.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteW12d3BnamFjcmtiaW1jY2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNzA3OTksImV4cCI6MjA4MTY0Njc5OX0.PJF9HEINW2DJJmFrYCrM_OkTSH9YoYHjYKVnJuw1o0Y';

console.log('🔐 Supabase config:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseAnonKey ? 'configured' : 'missing',
  platform: typeof window !== 'undefined' && window.Capacitor ? window.Capacitor.getPlatform() : 'web'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Using mock services.');
}

// Storage key para la sesión de Supabase - use default Supabase key format
const STORAGE_KEY = `sb-pmymvwpgjacrkbimccao-auth-token`;

// Create Supabase client with simplified configuration
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': typeof window !== 'undefined' && window.Capacitor
            ? `rey-del-truco-ios/${window.Capacitor.getPlatform()}`
            : 'rey-del-truco-web'
        },
        // Add fetch with timeout to prevent hanging requests
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

          return fetch(url, {
            ...options,
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
        }
      }
    })
  : null;

// Debug session on load
if (typeof window !== 'undefined') {
  // Check for existing session
  const sessionKey = STORAGE_KEY;
  const savedSession = localStorage.getItem(sessionKey);

  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      console.log('🔍 Found Supabase session for:', parsed?.user?.email || 'unknown');
    } catch (e) {
      console.log('🔍 Could not parse saved session');
    }
  } else {
    console.log('🔍 No Supabase session found');
    // Check for old keys and migrate if needed
    const oldKey = 'rey-del-truco-auth';
    const oldSession = localStorage.getItem(oldKey);
    if (oldSession) {
      console.log('🔄 Migrating session from old key');
      localStorage.setItem(sessionKey, oldSession);
      localStorage.removeItem(oldKey);
    }
  }

  // Check for OAuth tokens in URL
  if (window.location.hash.includes('access_token') || window.location.search.includes('access_token')) {
    console.log('🔐 OAuth callback in progress');
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