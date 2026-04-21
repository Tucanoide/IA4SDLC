import { Pool } from 'pg';

// Native pg Pool singleton — bypasses Prisma for raw queries on the n8n DB.
// Prisma v7 with prisma-client-js is used separately for our own models.
// This pool connects directly to the shared PostgreSQL where n8n stores COBOL data.

const pool = new Pool({
  connectionString: process.env.DATABASE_DIRECT_URL,
});

export default pool;
