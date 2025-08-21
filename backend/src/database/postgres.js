const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../..', '.env') });

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'vision_user'}:${process.env.POSTGRES_PASSWORD || 'vision_pass123'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'vision_platform'}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Health check with retry logic
const checkConnection = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected:', result.rows[0].now);
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for PostgreSQL... (attempt ${i + 1}/${retries})`);
      if (i === retries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

// Query wrapper with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  checkConnection
};
