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

// Create Supabase client with iOS-specific configuration
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: window.Capacitor ? false : true, // Disable URL detection in native apps
        flowType: 'pkce',
        // iOS compatible storage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      // iOS network configuration
      global: {
        headers: {
          'X-Client-Info': window.Capacitor 
            ? `rey-del-truco-ios/${window.Capacitor.getPlatform()}`
            : 'rey-del-truco-web'
        }
      }
    })
  : null;

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