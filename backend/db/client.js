import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

function safeHostFromConnectionString(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'invalid DATABASE_URL format';
  }
}

if (!connectionString) {
  console.warn('DATABASE_URL is not set.');
} else {
  console.log('Using database host:', safeHostFromConnectionString(connectionString));
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

export async function ping() {
  const r = await pool.query('select 1 as ok');
  return r.rows[0];
}