import pg from "pg";

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;
let rsvpPhoneColumnReady: Promise<void> | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export function ensureRsvpPhoneColumn() {
  if (!rsvpPhoneColumnReady) {
    rsvpPhoneColumnReady = getPool()
      .query("ALTER TABLE wedding_rsvps ADD COLUMN IF NOT EXISTS phone TEXT")
      .then(() => undefined)
      .catch((error) => {
        rsvpPhoneColumnReady = null;
        throw error;
      });
  }

  return rsvpPhoneColumnReady;
}
