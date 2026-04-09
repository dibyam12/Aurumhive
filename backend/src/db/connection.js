import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create connection pool for Neon DB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Query helper with error handling
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Query executed', { text: text.substring(0, 50), duration: `${duration}ms`, rows: result.rowCount });
        }
        return result;
    } catch (error) {
        console.error('❌ Database query error:', error.message);
        throw error;
    }
};

// Get a client from the pool for transactions
export const getClient = async () => {
    const client = await pool.connect();
    const originalQuery = client.query.bind(client);
    const originalRelease = client.release.bind(client);

    // Monkey patch release to track if it was called
    let released = false;
    client.release = () => {
        if (released) {
            console.warn('Client released more than once');
            return;
        }
        released = true;
        return originalRelease();
    };

    client.query = (...args) => originalQuery(...args);

    return client;
};

// Close pool (for graceful shutdown)
export const closePool = async () => {
    await pool.end();
    console.log('🔌 Database pool closed');
};

export default pool;
