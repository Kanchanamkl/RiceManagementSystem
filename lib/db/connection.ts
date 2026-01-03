import { Pool } from 'pg';

// Support both DATABASE_URL and individual parameters
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '6543'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(connectionConfig);

// Log connection status (only in development)
if (process.env.NODE_ENV === 'development') {
  pool.on('connect', () => {
    console.log('✅ Database connected successfully');
  });
}

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { 
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), 
        duration, 
        rows: result.rowCount 
      });
    }
    
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0
    };
  } catch (error: any) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

export default pool;
