// components/ProfileScreen.jsx - Pantalla de perfil con avatar y username
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import ScreenContainer from './ScreenContainer';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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

  // Check username availability with debounce
  useEffect(() => {
    if (!isEditingUsername || !newUsername || newUsername.length < 3) {
      setUsernameError('');
      return;
    }

    const checkUsername = async () => {
      setIsCheckingUsername(true);
      setUsernameError('');
      setUsernameSuccess('');

      try {
        const result = await authService.isUsernameAvailable(newUsername);
        if (result.available) {
          setUsernameSuccess('Username disponible');
        } else {
          setUsernameError(result.error);
        }
      } catch (error) {
        setUsernameError('Error al verificar username');
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [newUsername, isEditingUsername]);

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

  const displayName = userProfile?.display_name || user?.name || user?.username || 'Usuario';
  const hasUsername = !!userProfile?.display_name;
  const avatarUrl = userProfile?.avatar_url || user?.avatar;
  const memberSince = userProfile?.created_at || user?.createdAt;

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#D4A574] border-opacity-30 px-4 py-4">
        <h1 className="text-2xl font-bold text-[#D4A574] text-center font-['Tilt_Warp']">
          MI PERFIL
        </h1>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
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

        {/* Provider Info */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h3 className="text-lg font-bold text-[#D4A574] mb-3">
            🔐 CUENTA
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#F5DEB3] border-opacity-10">
              <span className="text-[#F5DEB3] opacity-70">Proveedor</span>
              <span className="text-[#F5DEB3] font-medium flex items-center gap-2">
                {userProfile?.auth_provider === 'google' && (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </>
                )}
                {userProfile?.auth_provider === 'email' && (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </>
                )}
                {!userProfile?.auth_provider && 'Email'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#F5DEB3] opacity-70">Estado</span>
              <span className="text-green-400 font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Verificado
              </span>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#D4A574] border-opacity-20">
          <h3 className="text-lg font-bold text-[#D4A574] mb-3">
            📄 LEGAL
          </h3>

          <div className="space-y-2">
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/terms');
                window.location.reload();
              }}
              className="block py-2 text-[#F5DEB3] hover:text-[#D4A574] transition-colors"
            >
              Términos y Condiciones →
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/privacy');
                window.location.reload();
              }}
              className="block py-2 text-[#F5DEB3] hover:text-[#D4A574] transition-colors"
            >
              Política de Privacidad →
            </a>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center">
          <p className="text-[#F5DEB3] opacity-40 text-xs">
            Rey del Truco v1.0.0
          </p>
        </div>

        {/* Cerrar Sesión */}
        <div className="pt-2 pb-8">
          <button
            onClick={signOut}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
          >
            🚪 CERRAR SESIÓN
          </button>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default ProfileScreen;
