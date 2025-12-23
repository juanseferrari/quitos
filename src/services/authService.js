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
      // Get current user if not passed and not already set
      let targetUserId = userId || this.currentUser?.id;

      if (!targetUserId) {
        // Try to get current user from Supabase session
        const user = await this.getCurrentUser();
        if (!user) {
          console.log('⚠️ getUserProfile: No user found');
          return null;
        }
        this.currentUser = user;
        targetUserId = user.id;
      }

      // Return cached profile if we have it and it's the same user
      if (this.userProfile && this.userProfile.auth_uid === targetUserId) {
        console.log('📋 getUserProfile: Returning cached profile');
        return this.userProfile;
      }

      console.log('📋 getUserProfile: Fetching profile for auth_uid:', targetUserId);

      const { data: profile, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_uid', targetUserId)
        .single();

      console.log('📋 getUserProfile: Query result - profile:', profile?.id, 'error:', error?.message);

      if (error) {
        console.error('🔥 Get profile error:', error);
        console.error('🔥 Error details:', JSON.stringify(error));
        throw error;
      }

      console.log('✅ getUserProfile: Found profile with display_name:', profile?.display_name);
      this.userProfile = profile;
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

  // Search users by username or name
  async searchUsers(query) {
    console.log('🔍 searchUsers called with query:', query);

    if (!this.isConfigured) {
      console.log('❌ Supabase not configured');
      return [];
    }

    // Get current user if not already set
    if (!this.currentUser) {
      console.log('⚠️ currentUser not set, fetching...');
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('❌ Could not get current user');
        return [];
      }
      this.currentUser = user;
    }

    try {
      if (!query || query.length < 2) {
        console.log('❌ Query too short');
        return [];
      }

      console.log('🔍 Searching for users matching:', query);

      // Get current user profile to exclude from results
      console.log('🔍 searchUsers: Getting current profile...');
      const currentProfile = await this.getUserProfile();
      console.log('🔍 searchUsers: Got current profile:', currentProfile?.id);

      // Search by display_name OR name (case insensitive)
      // Using separate ilike filters instead of .or() which can have syntax issues
      const searchPattern = `%${query}%`;

      console.log('🔍 searchUsers: Querying users table...');

      const { data, error } = await this.supabase
        .from('users')
        .select('id, display_name, name, avatar_url, email')
        .or(`display_name.ilike.${searchPattern},name.ilike.${searchPattern}`)
        .limit(20);

      console.log('🔍 searchUsers: Query result - data:', data?.length, 'error:', error?.message);

      if (error) {
        console.error('🔥 Error searching users:', error);
        console.error('🔥 Error details:', JSON.stringify(error));
        return [];
      }

      // Filter out current user from results
      const filteredData = (data || []).filter(user =>
        currentProfile ? user.id !== currentProfile.id : true
      );

      console.log('✅ Search results:', filteredData.length, 'users found');
      console.log('📋 Search results data:', filteredData);
      return filteredData;
    } catch (error) {
      console.error('🔥 searchUsers error:', error);
      return [];
    }
  }

  // Get user's friends
  async getFriends() {
    if (!this.isConfigured) {
      console.log('❌ getFriends: Supabase not configured');
      return [];
    }

    // Get current user if not already set
    if (!this.currentUser) {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('❌ getFriends: No current user');
        return [];
      }
      this.currentUser = user;
    }

    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) {
        console.log('❌ getFriends: No current profile');
        return [];
      }

      console.log('🔍 getFriends: Looking for friendships for user:', currentProfile.id);

      // Step 1: Get friendships where user is either user_id or friend_id and status is accepted
      const { data: friendships, error: friendshipsError } = await this.supabase
        .from('friendships')
        .select('id, user_id, friend_id, status, created_at')
        .or(`user_id.eq.${currentProfile.id},friend_id.eq.${currentProfile.id}`)
        .eq('status', 'accepted');

      if (friendshipsError) {
        console.error('🔥 Error getting friendships:', friendshipsError);
        return [];
      }

      console.log('📋 getFriends: Found friendships:', friendships?.length || 0);

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Step 2: Get the friend user IDs (the other person in each friendship)
      const friendIds = friendships.map(f =>
        f.user_id === currentProfile.id ? f.friend_id : f.user_id
      );

      console.log('📋 getFriends: Friend IDs to fetch:', friendIds);

      // Step 3: Fetch friend profiles
      const { data: friendProfiles, error: profilesError } = await this.supabase
        .from('users')
        .select('id, display_name, name, avatar_url')
        .in('id', friendIds);

      if (profilesError) {
        console.error('🔥 Error getting friend profiles:', profilesError);
        return [];
      }

      // Step 4: Map friendships to friend objects with friendship_id
      const friends = friendships.map(friendship => {
        const friendId = friendship.user_id === currentProfile.id ? friendship.friend_id : friendship.user_id;
        const friendProfile = friendProfiles?.find(p => p.id === friendId);
        return {
          ...friendProfile,
          friendship_id: friendship.id
        };
      }).filter(f => f.id); // Filter out any that didn't have a profile

      console.log('✅ getFriends: Returning', friends.length, 'friends');
      return friends;
    } catch (error) {
      console.error('🔥 getFriends error:', error);
      return [];
    }
  }

  // Get pending friend requests (received)
  async getPendingRequests() {
    if (!this.isConfigured) {
      console.log('❌ getPendingRequests: Supabase not configured');
      return [];
    }

    // Get current user if not already set
    if (!this.currentUser) {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('❌ getPendingRequests: No current user');
        return [];
      }
      this.currentUser = user;
    }

    try {
      const currentProfile = await this.getUserProfile();
      if (!currentProfile) {
        console.log('❌ getPendingRequests: No current profile');
        return [];
      }

      console.log('🔍 getPendingRequests: Looking for pending requests for user:', currentProfile.id);

      // Step 1: Get pending friendships where current user is the friend (receiver)
      const { data: pendingRequests, error: requestsError } = await this.supabase
        .from('friendships')
        .select('id, user_id, created_at')
        .eq('friend_id', currentProfile.id)
        .eq('status', 'pending');

      if (requestsError) {
        console.error('🔥 Error getting pending requests:', requestsError);
        return [];
      }

      console.log('📋 getPendingRequests: Found pending requests:', pendingRequests?.length || 0);

      if (!pendingRequests || pendingRequests.length === 0) {
        return [];
      }

      // Step 2: Get the sender user IDs
      const senderIds = pendingRequests.map(r => r.user_id);

      console.log('📋 getPendingRequests: Sender IDs to fetch:', senderIds);

      // Step 3: Fetch sender profiles
      const { data: senderProfiles, error: profilesError } = await this.supabase
        .from('users')
        .select('id, display_name, name, avatar_url')
        .in('id', senderIds);

      if (profilesError) {
        console.error('🔥 Error getting sender profiles:', profilesError);
        return [];
      }

      // Step 4: Map requests to user objects with friendship_id
      const requests = pendingRequests.map(req => {
        const senderProfile = senderProfiles?.find(p => p.id === req.user_id);
        return {
          ...senderProfile,
          friendship_id: req.id,
          requested_at: req.created_at
        };
      }).filter(r => r.id); // Filter out any that didn't have a profile

      console.log('✅ getPendingRequests: Returning', requests.length, 'pending requests');
      return requests;
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