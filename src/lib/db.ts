import pg from "pg";

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}
