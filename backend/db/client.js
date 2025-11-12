import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL not set. Falling back to PGHOST/PGUSER/PGDATABASE vars (if any).');
}

export const pool = new Pool(
  connectionString
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.PGHOST,
        port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: { rejectUnauthorized: false },
      }
);

//connectivity check 
export async function ping() {
  const r = await pool.query('select 1 as ok');
  return r.rows[0];
}
