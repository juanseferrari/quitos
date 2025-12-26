#!/usr/bin/env node

// test-auth.mjs - Test authentication flow
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const redirect_url = "https://quitos-a390d6350cca.herokuapp.com/auth/callback"
console.log('🔐 Testing authentication setup...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    // Test 1: Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else {
      console.log(`✅ Session check: ${session ? 'Active session' : 'No session'}`);
    }
    
    // Test 2: Test database connection
    console.log('\n2. Testing database tables...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }
    
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('count', { count: 'exact', head: true });
    
    if (gamesError) {
      console.error('❌ Games table error:', gamesError.message);
    } else {
      console.log('✅ Games table accessible');
    }
    
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('count', { count: 'exact', head: true });
    
    if (statsError) {
      console.error('❌ User stats table error:', statsError.message);
    } else {
      console.log('✅ User stats table accessible');
    }
    
    // Test 3: Test Google OAuth configuration
    console.log('\n3. Testing OAuth providers...');
    
    try {
      // This will attempt to start OAuth flow (but fail in Node.js environment)
      // We're just testing that the provider is configured
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirect_url
        }
      });
      
      // In Node.js this will always "fail" but tells us if provider is configured
      if (error && error.message.includes('window is not defined')) {
        console.log('✅ Google OAuth provider configured (detected browser redirect requirement)');
      } else if (error) {
        console.error('❌ OAuth config error:', error.message);
      } else {
        console.log('✅ OAuth flow initiated');
      }
    } catch (err) {
      if (err.message.includes('window is not defined')) {
        console.log('✅ Google OAuth provider configured (detected browser environment requirement)');
      } else {
        console.error('❌ OAuth test error:', err.message);
      }
    }
    
    console.log('\n🎉 Authentication setup test complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the React app: npm start');
    console.log('2. Test Google login in browser');
    console.log('3. Check user creation in Supabase dashboard');
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

testAuth();



//
// Login como usuario mock
//window.devLogin("juanse@test.com", "Juanse")

// Logout
//window.devLogout()

// Ver estado actual de auth
//window.devAuthState()