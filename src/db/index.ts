import { DATABASE_URL } from 'astro:env/server';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
// import pkg from 'pg';
import * as schema from './schema';

// const { Pool } = pkg;

const sql = new Pool({
    connectionString: DATABASE_URL,
});

//Add a function to check database connection
// async function checkDatabaseConnection() {
//     try {
//         const client = await sql.connect();
//         await client.query('SELECT NOW()');
//         client.release();
//         return true;
//     } catch (error) {
//         console.error('Database connection error:', error);
//         return false;
//     }
// }

const db = drizzle({ client: sql, schema });

export { db };

