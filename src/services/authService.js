// src/services/authService.js - Real authentication service with Supabase
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Browser } from '@capacitor/browser';

class AuthService {
  constructor() {
    this.supabase = supabase;
    this.isConfigured = isSupabaseConfigured();
    this.currentUser = null;
    this.userProfile = null;
    
    // Initialize auth state listener
    this.initializeAuthListener();
  }

  // Initialize auth state listener
  initializeAuthListener() {
    if (!this.isConfigured) return;

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        this.currentUser = session.user;
        // Load or create user profile
        await this.ensureUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.userProfile = null;
      }
    });
  }

  // Sign in with Google
  async signInWithGoogle() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      // Detect if running in Capacitor iOS app
      const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
      const isIOS = window.Capacitor && window.Capacitor.getPlatform() === 'ios';
      
      console.log('🔐 Starting Google OAuth', { isCapacitor, isIOS });

      if (isCapacitor && isIOS) {
        // iOS Native Flow: Use Browser plugin for OAuth
        return await this._handleIOSOAuth();
      } else {
        // Web Flow: Standard OAuth
        return await this._handleWebOAuth();
      }
    } catch (error) {
      console.error('🔥 Google sign in error:', error);
      throw error;
    }
  }

  // Handle iOS OAuth using Browser plugin
  async _handleIOSOAuth() {
    console.log('🔐 Starting iOS OAuth flow with Browser plugin');
    
    // Check if user has been authenticated before
    const hasBeenAuthenticated = localStorage.getItem('trucoapp_had_auth') === 'true';
    const promptType = hasBeenAuthenticated ? 'select_account' : 'consent';
    
    console.log('🔐 OAuth prompt type:', promptType);
    
    // ✅ SOLUCIÓN: NO usar skipBrowserRedirect en iOS
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'reydeltruco://oauth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: promptType
        }
        // ✅ CRÍTICO: Dejar que Supabase maneje el redirect automáticamente
        // skipBrowserRedirect: false (por defecto)
      }
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL received from Supabase');

    console.log('🔐 Opening OAuth URL in browser:', data.url);
    
    // ✅ CRÍTICO: Configuración correcta para Safari iOS
    await Browser.open({
      url: data.url,
      windowName: '_blank',
      presentationStyle: 'fullscreen',
      toolbarColor: '#1a1a1a',
      showTitle: true,
      showUrl: false
    });

    // Return success - actual authentication will be handled by IOSOAuthHandler
    return { 
      success: true, 
      data, 
      note: 'iOS OAuth initiated - waiting for callback' 
    };
  }

  // Handle Web OAuth (standard flow)
  async _handleWebOAuth() {
    // Determine redirect URL based on environment
    let redirectUrl;
    if (window.location.hostname === 'localhost') {
      redirectUrl = 'http://localhost:3000';
    } else if (window.location.hostname.includes('herokuapp.com')) {
      redirectUrl = 'https://quitos-a390d6350cca.herokuapp.com';
    } else {
      redirectUrl = window.location.origin;
    }

    console.log('🔐 Starting web OAuth with redirect:', redirectUrl);
    console.log('🔐 Current origin:', window.location.origin);
    console.log('🔐 Current hostname:', window.location.hostname);

    // Check if user has been authenticated before
    const hasBeenAuthenticated = localStorage.getItem('trucoapp_had_auth') === 'true';
    const promptType = hasBeenAuthenticated ? 'select_account' : 'consent';
    
    console.log('🔐 OAuth prompt type:', promptType);

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: promptType,
        }
      }
    });

    if (error) throw error;
    return { success: true, data };
  }

  // Sign in with Email/Password
  async signInWithEmail(email, password) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      console.log('🔐 Starting email sign in for:', email);

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      await this.ensureUserProfile(data.user);

      return { success: true, data };
    } catch (error) {
      console.error('🔥 Email sign in error:', error);
      throw error;
    }
  }

  // Sign up with Email/Password
  async signUpWithEmail(email, password, name = null) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      console.log('🔐 Starting email sign up for:', email);

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          data,
          needsEmailConfirmation: true,
          message: 'Revisá tu email para confirmar tu cuenta'
        };
      }

      this.currentUser = data.user;
      await this.ensureUserProfile(data.user);

      return { success: true, data };
    } catch (error) {
      console.error('🔥 Email sign up error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    console.log('🔐 AuthService signOut called');
    
    if (!this.isConfigured) {
      console.log('❌ Supabase not configured');
      throw new Error('Supabase not configured');
    }

    try {
      console.log('🔄 Calling supabase.auth.signOut()...');
      const { error } = await this.supabase.auth.signOut();
      console.log('📋 Supabase signOut response:', { error });
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        throw error;
      }
      
      console.log('✅ Supabase signOut successful, clearing local data...');
      this.currentUser = null;
      this.userProfile = null;
      
      console.log('✅ AuthService signOut completed');
      return { success: true };
    } catch (error) {
      console.error('🔥 Sign out error:', error);
      throw error;
    }
  }

  // Get current session
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

  // Get current user
  async getCurrentUser() {
    if (!this.isConfigured) return null;

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      
      return user;
    } catch (error) {
      console.error('🔥 Get user error:', error);
      return null;
    }
  }

  // Ensure user profile exists in database
  async ensureUserProfile(authUser) {
    if (!authUser) return null;

    try {
      // First, try to get existing profile
      let { data: profile, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_uid', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('📝 Creating user profile for:', authUser.email);
        
        const newProfile = {
          auth_uid: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
          auth_provider: authUser.app_metadata?.provider || 'email',
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

  // Get user profile
  async getUserProfile(userId = null) {
    if (!this.isConfigured) return null;

    try {
      const targetUserId = userId || this.currentUser?.id;
      if (!targetUserId) return null;

      const { data: profile, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_uid', targetUserId)
        .single();

      if (error) throw error;
      
      return profile;
    } catch (error) {
      console.error('🔥 Get profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    if (!this.isConfigured || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('auth_uid', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;
      
      this.userProfile = data;
      return data;
    } catch (error) {
      console.error('🔥 Update profile error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if using mock services
  isMockMode() {
    return !this.isConfigured;
  }

  // Check if username is available
  async isUsernameAvailable(username) {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    // Normalize username (lowercase, remove spaces)
    const normalizedUsername = username.toLowerCase().trim().replace(/\s+/g, '');

    // Validate format (alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return {
        available: false,
        error: 'El username debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guiones bajos'
      };
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('display_name', normalizedUsername)
        .maybeSingle();

      if (error) throw error;

      // If data exists, username is taken (unless it's the current user)
      if (data) {
        // Check if it's the current user's username
        const currentProfile = await this.getUserProfile();
        if (currentProfile && currentProfile.display_name === normalizedUsername) {
          return { available: true, username: normalizedUsername };
        }
        return { available: false, error: 'Este username ya está en uso' };
      }

      return { available: true, username: normalizedUsername };
    } catch (error) {
      console.error('🔥 Check username error:', error);
      throw error;
    }
  }

  // Set username (one-time or update)
  async setUsername(username) {
    if (!this.isConfigured || !this.currentUser) {
      throw new Error('Not authenticated');
    }

    // Check availability first
    const availabilityCheck = await this.isUsernameAvailable(username);
    if (!availabilityCheck.available) {
      throw new Error(availabilityCheck.error);
    }

    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ display_name: availabilityCheck.username })
        .eq('auth_uid', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      this.userProfile = data;
      console.log('✅ Username set successfully:', availabilityCheck.username);
      return data;
    } catch (error) {
      console.error('🔥 Set username error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;