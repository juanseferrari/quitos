// components/AuthSelectionScreen.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthSelectionScreen = ({ onContinueAnonymous }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isLoading, error } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLocalError('');
      console.log('🔐 Iniciando Google OAuth...');
      await signInWithGoogle();
    } catch (error) {
      console.error('🔥 Error en Google sign in:', error);
      setLocalError(error.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!email || !password) {
      setLocalError('Por favor completá email y contraseña');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password, name);
        if (result?.needsEmailConfirmation) {
          setSuccessMessage(result.message);
          setIsSignUp(false);
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      setLocalError(error.message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="rey-premium-layout min-h-screen flex items-center justify-center">
      <div className="rey-premium-container max-w-md mx-auto p-6">
        <div className="auth-selection-screen text-center">
          {/* Header */}
          <header className="auth-header mb-8">
            <h1 className="auth-title text-4xl font-bold mb-2 font-['Tilt_Warp'] text-[#D4A574]">
              REY DEL TRUCO
            </h1>
            <p className="auth-subtitle text-lg text-[#F5DEB3] opacity-90">
              El anotador inteligente para jugadores reales
            </p>
          </header>

          {!showEmailForm ? (
            <>
              {/* Auth Buttons */}
              <div className="auth-buttons space-y-4 mb-6">
                {/* Google Button - Styled to match app theme */}
                <button
                  className="auth-button google-button w-full p-4 rounded-lg bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#E6C589] hover:to-[#D4A574] border border-[#D4A574]"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                {/* Email Button */}
                <button
                  className="auth-button email-button w-full p-4 rounded-lg bg-transparent border-2 border-[#D4A574] text-[#D4A574] font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#D4A574] hover:bg-opacity-10"
                  onClick={() => setShowEmailForm(true)}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Continuar con Email</span>
                </button>
              </div>
            </>
          ) : (
            /* Email Form */
            <form onSubmit={handleEmailSubmit} className="email-form space-y-4 mb-6">
              <div className="form-header flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setLocalError('');
                    setSuccessMessage('');
                  }}
                  className="text-[#D4A574] hover:text-[#E6C589] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-[#D4A574]">
                  {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
                </h2>
                <div className="w-6"></div>
              </div>

              {isSignUp && (
                <input
                  type="text"
                  placeholder="Nombre (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-lg bg-[#1a1a1a] border border-[#D4A574] border-opacity-50 text-[#F5DEB3] placeholder-[#F5DEB3] placeholder-opacity-50 focus:border-[#D4A574] focus:outline-none transition-colors"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-lg bg-[#1a1a1a] border border-[#D4A574] border-opacity-50 text-[#F5DEB3] placeholder-[#F5DEB3] placeholder-opacity-50 focus:border-[#D4A574] focus:outline-none transition-colors"
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-4 rounded-lg bg-[#1a1a1a] border border-[#D4A574] border-opacity-50 text-[#F5DEB3] placeholder-[#F5DEB3] placeholder-opacity-50 focus:border-[#D4A574] focus:outline-none transition-colors"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 rounded-lg bg-gradient-to-r from-[#D4A574] to-[#C59660] text-[#0a0a0a] font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#E6C589] hover:to-[#D4A574] disabled:opacity-50"
              >
                {isLoading ? 'Cargando...' : (isSignUp ? 'Crear cuenta' : 'Iniciar sesión')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError('');
                  setSuccessMessage('');
                }}
                className="w-full text-[#F5DEB3] text-sm hover:text-[#D4A574] transition-colors"
              >
                {isSignUp ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="auth-divider flex items-center my-6">
            <div className="divider-line flex-1 h-px bg-[#F5DEB3] opacity-30"></div>
            <span className="divider-text mx-4 text-[#F5DEB3] opacity-70">o</span>
            <div className="divider-line flex-1 h-px bg-[#F5DEB3] opacity-30"></div>
          </div>

          {/* Anonymous Button */}
          <button
            className="anonymous-button w-full p-4 bg-transparent border-2 border-[#F5DEB3] border-opacity-50 rounded-lg text-[#F5DEB3] hover:bg-[#F5DEB3] hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center space-x-3"
            onClick={onContinueAnonymous}
          >
            <span className="anonymous-icon text-xl">💨</span>
            <div className="anonymous-content text-center">
              <div className="anonymous-title font-semibold">Entrar sin cuenta</div>
              <div className="anonymous-subtitle text-sm opacity-70">Solo anotador, sin estadísticas</div>
            </div>
          </button>

          {/* Success Message */}
          {successMessage && (
            <div className="auth-success mt-4 p-3 bg-green-900 bg-opacity-50 border border-green-500 rounded-lg text-green-200">
              {successMessage}
            </div>
          )}

          {/* Error Display */}
          {displayError && (
            <div className="auth-error mt-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200">
              {displayError}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="auth-loading mt-4 flex items-center justify-center space-x-2 text-[#D4A574]">
              <div className="spinner animate-spin w-5 h-5 border-2 border-[#D4A574] border-t-transparent rounded-full"></div>
              <span>Iniciando sesión...</span>
            </div>
          )}

          {/* Terms */}
          <p className="auth-terms mt-6 text-sm text-[#F5DEB3] opacity-60">
            Al continuar aceptás los{' '}
            <a
              href="/terms"
              className="text-[#D4A574] hover:text-[#E6C589] underline transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/terms');
                window.location.reload();
              }}
            >
              términos y condiciones
            </a>
            {' '}y la{' '}
            <a
              href="/privacy"
              className="text-[#D4A574] hover:text-[#E6C589] underline transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/privacy');
                window.location.reload();
              }}
            >
              política de privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
