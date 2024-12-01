import { Pool } from 'pg';

if (!process.env.POSTGRES_HOST || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_DB) {
  throw new Error('Missing one or more required environment variables: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB');
}

// Ensure the pool is a singleton in serverless environments
const pool: Pool = global._pool || new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: {
    rejectUnauthorized: false, // Required for some cloud databases like Heroku or AWS RDS
  },
  max: 20, // Limit the number of connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Wait 2 seconds before timing out
});

// Test the connection if initializing
if (!global._pool) {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
    } else {
      console.log('Connected to the database successfully');
      release();
    }
  });

  // Assign the pool to global._pool for reuse in serverless environments
  global._pool = pool;
}

export default pool;
