// src/utils/db.ts
import { Pool } from 'pg';

if (!process.env.POSTGRES_HOST) {
  throw new Error('Please define the POSTGRES_HOST environment variable');
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'oasisdb', // default database name unless you have a specific one
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Successfully connected to database');
    release();
  }
});

export default pool;