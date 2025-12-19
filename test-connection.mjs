#!/usr/bin/env node

// test-connection.mjs - Test Supabase connection
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

console.log('🔍 Testing Supabase connection...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  process.exit(1);
}

console.log('✅ Credentials loaded');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test auth service
    console.log('\n🔐 Testing authentication service...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth error:', error.message);
    } else {
      console.log('✅ Auth service connected');
      console.log(`👤 Session: ${session ? 'Active' : 'None'}`);
    }
    
    // Test database
    console.log('\n🗄️ Testing database...');
    const { error: dbError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (dbError?.message?.includes('relation "public.users" does not exist')) {
      console.log('⚠️ Database connected (tables not created yet)');
    } else if (dbError) {
      console.error('❌ Database error:', dbError.message);
    } else {
      console.log('✅ Database connected and tables exist');
    }
    
    console.log('\n🎉 Connection test complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run database migrations');
    console.log('2. Configure Google OAuth');
    console.log('3. Implement auth service');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
}

testConnection();