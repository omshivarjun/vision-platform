#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'vision_user'}:${process.env.POSTGRES_PASSWORD || 'vision_pass123'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'vision_platform'}`,
});

console.log('🚀 Starting PostgreSQL migration...');

async function runMigrations() {
  try {
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Run migration SQL file
    const sqlPath = path.join(__dirname, '..', 'infrastructure', 'postgres', 'init', '01-init-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
