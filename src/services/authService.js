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
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000'
      : `${window.location.origin}`;
      
    console.log('🔐 Starting web OAuth with redirect:', redirectUrl);

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

  // Sign in with Apple (for future implementation)
  async signInWithApple() {
    if (!this.isConfigured) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('🔥 Apple sign in error:', error);
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
      return { available: true };
    }

    try {
      // Validate username format
      if (!username || username.length < 3) {
        return { available: false, error: 'El username debe tener al menos 3 caracteres' };
      }

      if (username.length > 20) {
        return { available: false, error: 'El username no puede tener más de 20 caracteres' };
      }

      if (!/^[a-z0-9_]+$/.test(username)) {
        return { available: false, error: 'Solo se permiten letras minúsculas, números y guiones bajos' };
      }

      // Check if username exists in database
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('display_name', username)
        .maybeSingle();

      if (error) {
        console.error('🔥 Error checking username:', error);
        return { available: false, error: 'Uff, terrible error' };
      }

      // If data exists, check if it's the current user's username
      if (data) {
        // Check if this is the current user's own username
        const currentProfile = await this.getUserProfile();
        if (currentProfile && currentProfile.id === data.id) {
          return { available: true }; // User can keep their own username
        }
        return { available: false, error: 'Este username ya existe pa' };
      }

      return { available: true };
    } catch (error) {
      console.error('🔥 isUsernameAvailable error:', error);
      return { available: false, error: 'Error al verificar username' };
    }
  }

  // Set username for current user
  async setUsername(username) {
    if (!this.isConfigured || !this.currentUser) {
      throw new Error('No autenticado');
    }

    try {
      // Validate and check availability first
      const availability = await this.isUsernameAvailable(username);
      if (!availability.available) {
        throw new Error(availability.error);
      }

      // Update the display_name in database
      const { data, error } = await this.supabase
        .from('users')
        .update({ display_name: username })
        .eq('auth_uid', this.currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('🔥 Error setting username:', error);
        throw new Error('No pude guardar username viejo');
      }

      this.userProfile = data;
      return data;
    } catch (error) {
      console.error('🔥 setUsername error:', error);
      throw error;
    }
  }

  // Search users by username
  async searchUsers(query) {
    if (!this.isConfigured || !this.currentUser) {
      return [];
    }

    try {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('id, display_name, name, avatar_url')
        .neq('auth_uid', this.currentUser.id) // Exclude current user
        .ilike('display_name', `%${query}%`)
        .limit(10);

      if (error) {
        console.error('🔥 Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('🔥 searchUsers error:', error);
      return [];
    }
  }

  // Get user's friends
  async getFriends() {
    if (!this.isConfigured || !this.currentUser) {
      return [];
    }

    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) return [];

      // Get friendships where user is either user_id or friend_id and status is accepted
      const { data, error } = await this.supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          user:users!friendships_user_id_fkey(id, display_name, name, avatar_url),
          friend:users!friendships_friend_id_fkey(id, display_name, name, avatar_url)
        `)
        .or(`user_id.eq.${currentProfile.id},friend_id.eq.${currentProfile.id}`)
        .eq('status', 'accepted');

      if (error) {
        console.error('🔥 Error getting friends:', error);
        return [];
      }

      // Map to friend objects (return the other user in the friendship)
      const friends = (data || []).map(friendship => {
        if (friendship.user_id === currentProfile.id) {
          return { ...friendship.friend, friendship_id: friendship.id };
        } else {
          return { ...friendship.user, friendship_id: friendship.id };
        }
      });

      return friends;
    } catch (error) {
      console.error('🔥 getFriends error:', error);
      return [];
    }
  }

  // Get pending friend requests (received)
  async getPendingRequests() {
    if (!this.isConfigured || !this.currentUser) {
      return [];
    }

    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) return [];

      const { data, error } = await this.supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          created_at,
          user:users!friendships_user_id_fkey(id, display_name, name, avatar_url)
        `)
        .eq('friend_id', currentProfile.id)
        .eq('status', 'pending');

      if (error) {
        console.error('🔥 Error getting pending requests:', error);
        return [];
      }

      return (data || []).map(req => ({
        ...req.user,
        friendship_id: req.id,
        requested_at: req.created_at
      }));
    } catch (error) {
      console.error('🔥 getPendingRequests error:', error);
      return [];
    }
  }

  // Send friend request
  async sendFriendRequest(friendUserId) {
    if (!this.isConfigured || !this.currentUser) {
      throw new Error('No autenticado');
    }

    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) throw new Error('Perfil no encontrado');

      // Check if friendship already exists
      const { data: existing } = await this.supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${currentProfile.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${currentProfile.id})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          throw new Error('Ya son amigos');
        } else if (existing.status === 'pending') {
          throw new Error('Ya hay una solicitud pendiente');
        }
      }

      const { data, error } = await this.supabase
        .from('friendships')
        .insert([{
          user_id: currentProfile.id,
          friend_id: friendUserId,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('🔥 Error sending friend request:', error);
        throw new Error('Error al enviar solicitud');
      }

      return data;
    } catch (error) {
      console.error('🔥 sendFriendRequest error:', error);
      throw error;
    }
  }

  // Accept friend request
  async acceptFriendRequest(friendshipId) {
    if (!this.isConfigured || !this.currentUser) {
      throw new Error('No autenticado');
    }

    try {
      const { data, error } = await this.supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) {
        console.error('🔥 Error accepting friend request:', error);
        throw new Error('Error al aceptar solicitud');
      }

      return data;
    } catch (error) {
      console.error('🔥 acceptFriendRequest error:', error);
      throw error;
    }
  }

  // Reject/remove friendship
  async removeFriendship(friendshipId) {
    if (!this.isConfigured || !this.currentUser) {
      throw new Error('No autenticado');
    }

    try {
      const { error } = await this.supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('🔥 Error removing friendship:', error);
        throw new Error('Error al eliminar amistad');
      }

      return true;
    } catch (error) {
      console.error('🔥 removeFriendship error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;