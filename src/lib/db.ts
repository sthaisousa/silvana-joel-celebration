import pg from "pg";

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;
let rsvpPhoneColumnReady: Promise<void> | null = null;
let giftPurchasesTableReady: Promise<void> | null = null;

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

export function ensureGiftPurchasesTable() {
  if (!giftPurchasesTableReady) {
    giftPurchasesTableReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS wedding_gift_purchases (
           id SERIAL PRIMARY KEY,
           gift_id INTEGER REFERENCES wedding_gifts(id) ON DELETE SET NULL,
           gift_title TEXT NOT NULL,
           amount_cents INTEGER NOT NULL,
           currency TEXT NOT NULL DEFAULT 'brl',
           buyer_name TEXT,
           buyer_email TEXT,
           status TEXT NOT NULL DEFAULT 'pending',
           provider TEXT NOT NULL DEFAULT 'infinitepay',
           external_reference TEXT UNIQUE,
           provider_payment_id TEXT,
           payment_method TEXT,
           created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
           paid_at TIMESTAMPTZ
         )`,
      )
      // Colunas da InfinitePay: o payment_check precisa do slug, e o
      // comprovante e as parcelas ajudam a conferir cada presente no /admin.
      .then(() =>
        getPool().query(
          `ALTER TABLE wedding_gift_purchases
             ADD COLUMN IF NOT EXISTS provider_invoice_slug TEXT,
             ADD COLUMN IF NOT EXISTS receipt_url TEXT,
             ADD COLUMN IF NOT EXISTS installments INTEGER`,
        ),
      )
      .then(() => undefined)
      .catch((error) => {
        giftPurchasesTableReady = null;
        throw error;
      });
  }

  return giftPurchasesTableReady;
}
