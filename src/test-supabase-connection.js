// test-supabase-connection.js - Script para verificar la conexión con Supabase
import { supabase, isSupabaseConfigured } from './config/supabase.js';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // 1. Check if configured
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured. Please check your .env.local file.');
    return;
  }
  
  console.log('✅ Supabase client configured');
  console.log(`📍 URL: ${process.env.REACT_APP_SUPABASE_URL}`);
  console.log(`🔑 Anon key: ${process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20)}...`);
  
  try {
    // 2. Test basic connection by checking auth status
    console.log('\n🔐 Testing authentication service...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth service error:', error.message);
    } else {
      console.log('✅ Auth service connected');
      console.log(`📊 Current session: ${session ? 'Active' : 'No active session'}`);
    }
    
    // 3. Test database access (this will fail without tables, but shows connection)
    console.log('\n🗄️ Testing database connection...');
    const { error: dbError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (dbError) {
      if (dbError.message.includes('relation "public.users" does not exist')) {
        console.log('⚠️ Database connected but tables not created yet (this is expected)');
      } else {
        console.error('❌ Database error:', dbError.message);
      }
    } else {
      console.log('✅ Database connected and tables exist');
    }
    
    console.log('\n🎉 Supabase connection test complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the database migration to create tables');
    console.log('2. Configure Google OAuth in Supabase dashboard');
    console.log('3. Start implementing authentication');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the test
testSupabaseConnection();