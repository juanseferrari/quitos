// components/ProfileScreen.jsx - Pantalla de perfil con avatar, username y amigos
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import ScreenContainer from './ScreenContainer';
import { APP_NAME, APP_VERSION } from '../config/version';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getUserProfile();
        if (profile) {
          setUserProfile(profile);
          setNewUsername(profile.display_name || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Load friends and pending requests
  useEffect(() => {
    const loadFriends = async () => {
      setFriendsLoading(true);
      try {
        const [friendsList, pending] = await Promise.all([
          authService.getFriends(),
          authService.getPendingRequests()
        ]);
        setFriends(friendsList);
        setPendingRequests(pending);
      } catch (error) {
        console.error('Error loading friends:', error);
      } finally {
        setFriendsLoading(false);
      }
    };
    loadFriends();
  }, []);

  // Search users with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const results = await authService.searchUsers(searchQuery);
        // Filter out users that are already friends or have pending requests
        const friendIds = friends.map(f => f.id);
        const pendingIds = pendingRequests.map(p => p.id);
        const filtered = results.filter(u => !friendIds.includes(u.id) && !pendingIds.includes(u.id));
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, friends, pendingRequests]);

  // Check username availability with debounce
  useEffect(() => {
    // Reset states when not editing or username too short
    if (!isEditingUsername || !newUsername || newUsername.length < 3) {
      setUsernameError('');
      setUsernameSuccess('');
      setIsCheckingUsername(false);
      return;
    }

    // If username is the same as current, no need to check
    if (userProfile?.display_name && newUsername === userProfile.display_name) {
      setUsernameError('');
      setUsernameSuccess('');
      setIsCheckingUsername(false);
      return;
    }

    let isCancelled = false;

    const checkUsername = async () => {
      setIsCheckingUsername(true);
      setUsernameError('');
      setUsernameSuccess('');

      try {
        const result = await authService.isUsernameAvailable(newUsername);

        // Only update state if not cancelled
        if (!isCancelled) {
          if (result.available) {
            setUsernameSuccess('Username disponible');
          } else {
            setUsernameError(result.error || 'Username no disponible');
          }
          setIsCheckingUsername(false);
        }
      } catch (error) {
        if (!isCancelled) {
          setUsernameError('Error al verificar username');
          setIsCheckingUsername(false);
        }
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      setIsCheckingUsername(false);
    };
  }, [newUsername, isEditingUsername, userProfile?.display_name]);

  const handleSaveUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameError('El username debe tener al menos 3 caracteres');
      return;
    }

    setIsSavingUsername(true);
    setUsernameError('');

    try {
      const updatedProfile = await authService.setUsername(newUsername);
      setUserProfile(updatedProfile);
      setIsEditingUsername(false);
      setUsernameSuccess('Username guardado correctamente');
      setTimeout(() => setUsernameSuccess(''), 3000);
    } catch (error) {
      setUsernameError(error.message);
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await authService.sendFriendRequest(userId);
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(error.message);
    }
  };

  const handleAcceptRequest = async (friendshipId) => {
    try {
      await authService.acceptFriendRequest(friendshipId);
      // Reload friends
      const [friendsList, pending] = await Promise.all([
        authService.getFriends(),
        authService.getPendingRequests()
      ]);
      setFriends(friendsList);
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (friendshipId) => {
    try {
      await authService.removeFriendship(friendshipId);
      setPendingRequests(prev => prev.filter(p => p.friendship_id !== friendshipId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    if (!window.confirm('¿Seguro que querés eliminar este amigo?')) return;
    try {
      await authService.removeFriendship(friendshipId);
      setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId));
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const displayName = userProfile?.display_name || user?.name || user?.username || 'Usuario';
  const hasUsername = !!userProfile?.display_name;
  const avatarUrl = userProfile?.avatar_url || user?.avatar;
  const memberSince = userProfile?.created_at || user?.createdAt;

  // Avatar component for reuse
  const UserAvatar = ({ url, name, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-10 h-10 text-lg',
      md: 'w-12 h-12 text-xl',
      lg: 'w-24 h-24 text-4xl'
    };

    return url ? (
      <img
        src={url}
        alt={name}
        className={`${sizeClasses[size]} rounded-full border-2 border-[#D4A574] object-cover`}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    ) : (
      <div className={`${sizeClasses[size]} rounded-full border-2 border-[#D4A574] bg-gradient-to-br from-[#D4A574] to-[#C59660] flex items-center justify-center`}>
        <span className="text-[#0a0a0a] font-bold">
          {(name || 'U').charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        <h1 className="text-2xl font-bold text-[#D4A574] text-center">
          MI PERFIL
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar y Nombre Principal */}
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl p-6 border border-[#D4A574] border-opacity-30 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full border-4 border-[#D4A574] shadow-lg object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-24 h-24 rounded-full border-4 border-[#D4A574] shadow-lg bg-gradient-to-br from-[#D4A574] to-[#C59660] items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
            >
              <span className="text-4xl text-[#0a0a0a] font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1a1a1a]"></div>
          </div>

          {/* Nombre */}
          <h2 className="text-2xl font-bold text-[#F5DEB3] mb-1">
            {userProfile?.name || user?.name || 'Usuario'}
          </h2>

          {/* Username */}
          {!isEditingUsername ? (
            <div className="mb-4">
              {hasUsername ? (
                <p className="text-[#D4A574] text-lg font-medium">
                  @{userProfile.display_name}
                </p>
              ) : (
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="text-[#D4A574] text-sm underline hover:text-[#E6C589] transition-colors"
                >
                  + Crear tu username único
                </button>
              )}
            </div>
          ) : (
            /* Username Editor */
            <div className="mb-4 space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A574] font-bold">@</span>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="tu_username"
                  maxLength={20}
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#D4A574] border-opacity-50 text-[#F5DEB3] placeholder-[#F5DEB3] placeholder-opacity-40 focus:border-[#D4A574] focus:outline-none transition-colors text-center"
                />
              </div>

              {/* Status indicators */}
              {isCheckingUsername && (
                <p className="text-[#F5DEB3] text-sm opacity-70">Verificando disponibilidad...</p>
              )}
              {usernameError && (
                <p className="text-red-400 text-sm">{usernameError}</p>
              )}
              {usernameSuccess && !usernameError && (
                <p className="text-green-400 text-sm">{usernameSuccess}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingUsername(false);
                    setNewUsername(userProfile?.display_name || '');
                    setUsernameError('');
                  }}
                  className="flex-1 py-2 rounded-lg border border-[#F5DEB3] border-opacity-30 text-[#F5DEB3] hover:bg-[#F5DEB3] hover:bg-opacity-10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUsername}
                  disabled={isSavingUsername || !!usernameError || !newUsername || newUsername.length < 3}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-semibold disabled:opacity-50 transition-all"
                >
                  {isSavingUsername ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          <p className="text-[#F5DEB3] text-sm opacity-70">
            {userProfile?.email || user?.email}
          </p>

          {/* Member since */}
          <p className="text-[#F5DEB3] text-xs opacity-50 mt-2">
            Miembro desde {memberSince ? new Date(memberSince).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long'
            }) : 'hace poco'}
          </p>

          {/* Edit username button (if already has one) */}
          {hasUsername && !isEditingUsername && (
            <button
              onClick={() => setIsEditingUsername(true)}
              className="mt-3 text-[#D4A574] text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Cambiar username
            </button>
          )}
        </div>

        {/* Amigos Section */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#D4A574]">
              👥 AMIGOS {friends.length > 0 && `(${friends.length})`}
            </h3>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-[#D4A574] text-sm hover:text-[#E6C589] transition-colors"
            >
              {showSearch ? 'Cerrar' : '+ Agregar'}
            </button>
          </div>

          {/* Search for friends */}
          {showSearch && (
            <div className="mb-4 space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A574]">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o username..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#D4A574] border-opacity-50 text-[#F5DEB3] placeholder-[#F5DEB3] placeholder-opacity-40 focus:border-[#D4A574] focus:outline-none transition-colors"
                />
              </div>

              {/* Search hint */}
              {searchQuery.length === 0 && (
                <p className="text-[#F5DEB3] text-xs opacity-50 text-center">
                  Escribí al menos 2 caracteres para buscar
                </p>
              )}

              {searchQuery.length === 1 && (
                <p className="text-[#F5DEB3] text-xs opacity-50 text-center">
                  Escribí un caracter más...
                </p>
              )}

              {isSearching && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-4 h-4 border-2 border-[#D4A574] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#F5DEB3] text-sm opacity-70">Buscando usuarios...</p>
                </div>
              )}

              {/* Search results table */}
              {searchResults.length > 0 && !isSearching && (
                <div className="border border-[#D4A574] border-opacity-30 rounded-lg overflow-hidden">
                  <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#D4A574] border-opacity-20">
                    <p className="text-[#D4A574] text-xs font-medium">
                      {searchResults.length} usuario{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map(result => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between bg-[#0a0a0a] hover:bg-[#1a1a1a] px-3 py-3 border-b border-[#D4A574] border-opacity-10 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UserAvatar url={result.avatar_url} name={result.display_name || result.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            {result.display_name ? (
                              <>
                                <p className="text-[#D4A574] font-medium truncate">@{result.display_name}</p>
                                {result.name && <p className="text-[#F5DEB3] text-xs opacity-60 truncate">{result.name}</p>}
                              </>
                            ) : (
                              <>
                                <p className="text-[#F5DEB3] font-medium truncate">{result.name || 'Usuario'}</p>
                                <p className="text-[#F5DEB3] text-xs opacity-40 truncate">Sin username</p>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(result.id)}
                          className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] text-sm font-semibold hover:shadow-lg transition-all flex-shrink-0"
                        >
                          + Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 bg-[#1a1a1a] rounded-lg">
                  <p className="text-[#F5DEB3] text-4xl mb-2">🔍</p>
                  <p className="text-[#F5DEB3] text-sm opacity-70">No se encontraron usuarios</p>
                  <p className="text-[#F5DEB3] text-xs opacity-50 mt-1">Probá con otro nombre o username</p>
                </div>
              )}
            </div>
          )}

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-4">
              <p className="text-[#D4A574] text-sm font-medium mb-2">Solicitudes pendientes</p>
              <div className="space-y-2">
                {pendingRequests.map(request => (
                  <div key={request.friendship_id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar url={request.avatar_url} name={request.display_name || request.name} size="sm" />
                      <div>
                        <p className="text-[#F5DEB3] font-medium">@{request.display_name}</p>
                        {request.name && <p className="text-[#F5DEB3] text-xs opacity-60">{request.name}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.friendship_id)}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.friendship_id)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends list */}
          {friendsLoading ? (
            <p className="text-[#F5DEB3] text-sm opacity-70 text-center py-4">Cargando amigos...</p>
          ) : friends.length > 0 ? (
            <div className="space-y-2">
              {friends.map(friend => (
                <div key={friend.friendship_id} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar url={friend.avatar_url} name={friend.display_name || friend.name} size="sm" />
                    <div>
                      <p className="text-[#F5DEB3] font-medium">@{friend.display_name}</p>
                      {friend.name && <p className="text-[#F5DEB3] text-xs opacity-60">{friend.name}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.friendship_id)}
                    className="text-red-400 text-xs opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[#F5DEB3] text-sm opacity-70">
                Todavía no tenés amigos
              </p>
              {!showSearch && (
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-2 text-[#D4A574] text-sm hover:text-[#E6C589] transition-colors"
                >
                  Buscar amigos →
                </button>
              )}
            </div>
          )}
        </div>

        {/* App Version */}
        <div className="text-center">
          <p className="text-[#F5DEB3] opacity-40 text-xs">
            {APP_NAME} v{APP_VERSION}
          </p>
        </div>

        {/* Cerrar Sesión */}
        <div className="pt-2">
          <button
            onClick={signOut}
            className="w-full py-3 rounded-lg border border-[#D4A574] border-opacity-50 text-[#D4A574] font-semibold hover:bg-[#D4A574] hover:bg-opacity-10 transition-all duration-300"
          >
            🚪 CERRAR SESIÓN
          </button>
        </div>

        {/* Footer con links legales */}
        <div className="pt-2 pb-8 text-center">
          <p className="text-[#F5DEB3] text-[10px] opacity-40">
            <a
              href="/privacy"
              className="hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/privacy');
                window.location.reload();
              }}
            >
              Privacidad
            </a>
            {' · '}
            <a
              href="/terms"
              className="hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/terms');
                window.location.reload();
              }}
            >
              Términos
            </a>
          </p>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default ProfileScreen;
