// utils/iosDebug.js - iOS debugging utilities
import { supabase } from '../config/supabase';

export const debugSupabaseConnection = async () => {
  console.log('🔍 DEBUG: Testing Supabase connection...');
  
  // Check if running in iOS
  const isIOS = window.Capacitor && window.Capacitor.getPlatform() === 'ios';
  console.log('🔍 Platform:', isIOS ? 'iOS' : 'Web');
  
  // Check Supabase client
  console.log('🔍 Supabase client available:', !!supabase);
  
  if (!supabase) {
    console.error('❌ Supabase client not available');
    return false;
  }
  
  try {
    // Test basic connection
    console.log('🔍 Testing basic connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection error:', error);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    console.log('🔍 Current session:', data.session ? 'exists' : 'none');
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

export const debugEnvironmentVariables = () => {
  console.log('🔍 DEBUG: Environment variables...');
  console.log('🔍 REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'set' : 'not set');
  console.log('🔍 REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'set' : 'not set');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
};

export const debugCapacitorInfo = () => {
  console.log('🔍 DEBUG: Capacitor info...');
  console.log('🔍 Capacitor available:', !!window.Capacitor);
  
  if (window.Capacitor) {
    console.log('🔍 Platform:', window.Capacitor.getPlatform());
    console.log('🔍 Native platform:', window.Capacitor.isNativePlatform());
    console.log('🔍 Plugins available:', Object.keys(window.Capacitor.Plugins || {}));
  }
};

export const testOAuthCallback = (url) => {
  console.log('🔍 DEBUG: Testing OAuth callback URL...');
  console.log('🔍 Full URL:', url);
  
  // Test different parsing methods
  if (url.includes('?')) {
    const [base, queryString] = url.split('?');
    console.log('🔍 Query string found:', queryString);
    
    const params = new URLSearchParams(queryString);
    console.log('🔍 Access token in query:', params.get('access_token') ? 'found' : 'not found');
  }
  
  if (url.includes('#')) {
    const [base, hashFragment] = url.split('#');
    console.log('🔍 Hash fragment found:', hashFragment);
    
    const hashParams = new URLSearchParams(hashFragment);
    console.log('🔍 Access token in hash:', hashParams.get('access_token') ? 'found' : 'not found');
  }
  
  // Test regex
  const tokenRegex = /access_token=([^&]+)/;
  const match = url.match(tokenRegex);
  console.log('🔍 Access token via regex:', match ? 'found' : 'not found');
};

export const runFullDiagnostic = async () => {
  console.log('🚀 Starting full iOS diagnostic...');
  
  debugEnvironmentVariables();
  debugCapacitorInfo();
  
  const connectionOk = await debugSupabaseConnection();
  
  console.log('🏁 Diagnostic complete. Connection:', connectionOk ? '✅ OK' : '❌ FAILED');
  
  return connectionOk;
};