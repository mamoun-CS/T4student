import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Pool setup for scalable database connections
const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PD,
    port: process.env.PG_PORT,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000 // Close idle clients after 30 seconds
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
