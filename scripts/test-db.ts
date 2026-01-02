import 'dotenv/config';
import pool from '../lib/db/connection';

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('Database:', process.env.DB_NAME);
  console.log('User:', process.env.DB_USER);
  console.log('Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET');
  
  try {
    const result = await pool.query('SELECT NOW(), current_database(), current_user');
    console.log('\n✅ Connection successful!');
    console.log('Time:', result.rows[0].now);
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📊 Tables:', tables.rows.map(r => r.table_name).join(', '));
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('\nTroubleshooting:');
    console.error('1. Check your password in .env file');
    console.error('2. Verify Supabase project is running');
    console.error('3. Check if your IP is allowed (Supabase → Settings → Database → Network Restrictions)');
    process.exit(1);
  }
}

testConnection();
