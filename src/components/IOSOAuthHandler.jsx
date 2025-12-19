// components/IOSOAuthHandler.jsx - Handle OAuth callback in iOS
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

const IOSOAuthHandler = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only run in Capacitor iOS environment
    if (!window.Capacitor || window.Capacitor.getPlatform() !== 'ios') {
      console.log('🔐 IOSOAuthHandler: Not running in iOS, skipping');
      return;
    }

    console.log('🔐 IOSOAuthHandler: Setting up iOS OAuth listener');
    console.log('🔐 App plugin available:', !!App);
    console.log('🔐 Platform:', window.Capacitor.getPlatform());
    
    // Test if we can access the App plugin
    try {
      console.log('🔐 Testing App plugin...');
      const testInfo = App.getInfo();
      console.log('✅ App plugin working, app info available');
    } catch (error) {
      console.error('❌ App plugin error:', error);
    }

    const handleAppUrlOpen = async (event) => {
      console.log('🔐 iOS App URL opened:', event.url);
      
      // Check if this is an OAuth callback
      if (event.url.startsWith('reydeltruco://oauth/callback')) {
        console.log('🔐 OAuth callback detected, processing tokens...');
        
        try {
          // ⏰ DELAY: No cerrar Safari inmediatamente, dejar que complete la auth
          console.log('🔐 Procesando tokens antes de cerrar Safari...');
          
          // Check for error in URL first
          if (event.url.includes('error=')) {
            const errorMatch = event.url.match(/error=([^&]+)/);
            const errorDesc = event.url.match(/error_description=([^&]+)/);
            console.error('❌ OAuth error:', {
              error: errorMatch ? decodeURIComponent(errorMatch[1]) : 'unknown',
              description: errorDesc ? decodeURIComponent(errorDesc[1]) : 'no description'
            });
            return;
          }
          
          // ✅ SOLUCIÓN: Manejar tanto formato de URL como tokens directos
          const tokens = extractTokensFromUrl(event.url);
          
          if (tokens.accessToken) {
            console.log('✅ OAuth tokens found, setting session...');
            await setSupabaseSession(tokens.accessToken, tokens.refreshToken);
            
            // ✅ CERRAR Safari solo DESPUÉS de procesar tokens exitosamente
            console.log('🔐 Cerrando Safari después de procesar tokens...');
            setTimeout(async () => {
              try {
                await Browser.close();
                console.log('✅ Safari cerrado exitosamente');
              } catch (error) {
                console.log('⚠️ Error cerrando Safari (puede estar ya cerrado):', error);
              }
            }, 1000); // 1 segundo delay para que se vea "autenticado"
            
          } else {
            // ✅ MANEJO DE AUTHORIZATION CODE
            console.log('🔄 No direct tokens, checking for authorization code...');
            const urlParams = new URL(event.url.replace('reydeltruco://', 'https://dummy.com/'));
            const authCode = urlParams.searchParams.get('code');
            
            if (authCode) {
              console.log('✅ Authorization code found, exchanging for tokens...');
              await exchangeCodeForTokens(authCode);
            } else {
              console.log('❌ No authorization code found in URL');
              console.log('🔍 URL params for debugging:', urlParams.search);
            }
            
            // Cerrar Safari después de procesar
            setTimeout(async () => {
              try {
                await Browser.close();
                console.log('✅ Safari cerrado después de procesar callback');
              } catch (error) {
                console.log('⚠️ Error cerrando Safari:', error);
              }
            }, 1500);
          }
          
        } catch (error) {
          console.error('❌ Error handling OAuth callback:', error);
        }
      }
    };

    const extractTokensFromUrl = (url) => {
      console.log('🔐 Extracting tokens from URL:', url);
      
      // Try query parameters first
      if (url.includes('?')) {
        const [, queryString] = url.split('?');
        const params = new URLSearchParams(queryString);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken) {
          return { accessToken, refreshToken };
        }
      }
      
      // Try hash fragment
      if (url.includes('#')) {
        const [, hashFragment] = url.split('#');
        const hashParams = new URLSearchParams(hashFragment);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken) {
          return { accessToken, refreshToken };
        }
      }
      
      // Try regex extraction
      const accessMatch = url.match(/access_token=([^&]+)/);
      const refreshMatch = url.match(/refresh_token=([^&]+)/);
      
      return {
        accessToken: accessMatch ? decodeURIComponent(accessMatch[1]) : null,
        refreshToken: refreshMatch ? decodeURIComponent(refreshMatch[1]) : null
      };
    };

    const exchangeCodeForTokens = async (authCode) => {
      try {
        console.log('🔄 Exchanging authorization code for tokens...');
        
        // Use Supabase's built-in code exchange
        const { data, error } = await authService.supabase.auth.exchangeCodeForSession(authCode);
        
        if (error) {
          console.error('❌ Error exchanging code:', error);
          return;
        }
        
        if (data.session) {
          console.log('✅ Session established via code exchange:', data.user?.email);
          console.log('🔐 Access token available:', !!data.session.access_token);
          console.log('🔐 User authenticated:', data.user?.email);
          
          // ✅ CERRAR todas las ventanas de Google después de éxito
          setTimeout(async () => {
            try {
              await Browser.close();
              console.log('✅ Browser closed after successful authentication');
            } catch (error) {
              console.log('⚠️ Browser may already be closed:', error);
            }
          }, 500);
          
        } else {
          console.log('❌ No session returned from code exchange');
        }
        
      } catch (error) {
        console.error('❌ Error in code exchange:', error);
      }
    };

    const setSupabaseSession = async (accessToken, refreshToken) => {
      try {
        console.log('🔐 Setting Supabase session...');
        
        const { data, error } = await authService.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) throw error;
        
        console.log('✅ Session set successfully:', data.user?.email);
        
      } catch (error) {
        console.error('❌ Error setting Supabase session:', error);
      }
    };

    // ✅ SOLUCIÓN: Usar App plugin directamente
    console.log('🔐 Registering appUrlOpen listener...');
    const listener = App.addListener('appUrlOpen', handleAppUrlOpen);
    console.log('✅ AppUrlOpen listener registered successfully');
    
    return () => {
      console.log('🔐 Removing appUrlOpen listener...');
      listener.remove();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') {
      console.log('🔐 Authentication status changed:', isAuthenticated);
    }
  }, [isAuthenticated]);

  // This component doesn't render anything visible
  return null;
};

export default IOSOAuthHandler;