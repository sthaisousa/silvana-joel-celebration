/**
 * Migracao unica: copia as compras pagas do Stripe para wedding_gift_purchases.
 *
 * Roda no Shell do Replit, com o connector do Stripe ainda conectado:
 *   bun scripts/migrate-stripe-purchases.ts
 *
 * E idempotente — external_reference e UNIQUE, entao rodar de novo nao duplica.
 */
import { ReplitConnectors } from "@replit/connectors-sdk";

import { ensureGiftPurchasesTable, getPool } from "../src/lib/db";

type StripeCheckoutSession = {
  id: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  created: number;
  customer_details?: { name?: string | null; email?: string | null } | null;
  metadata?: Record<string, string>;
};

async function fetchAllSessions() {
  const connectors = new ReplitConnectors();
  const sessions: StripeCheckoutSession[] = [];
  let startingAfter: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "100", status: "complete" });
    if (startingAfter) params.set("starting_after", startingAfter);

    const response = await connectors.proxy(
      "stripe",
      `/v1/checkout/sessions?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      throw new Error(`Stripe respondeu ${response.status}: ${await response.text()}`);
    }

    const page = (await response.json()) as {
      data: StripeCheckoutSession[];
      has_more: boolean;
    };
    sessions.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);

  return sessions;
}

async function main() {
  await ensureGiftPurchasesTable();

  const sessions = await fetchAllSessions();
  const paid = sessions.filter((session) => session.payment_status === "paid");

  console.log(`Encontradas ${paid.length} compras pagas no Stripe.`);

  let inserted = 0;
  for (const session of paid) {
    const paidAt = new Date(session.created * 1000).toISOString();
    const result = await getPool().query(
      `INSERT INTO wedding_gift_purchases
         (gift_id, gift_title, amount_cents, currency, buyer_name, buyer_email,
          status, provider, external_reference, provider_payment_id, created_at, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'paid', 'stripe', $7, $8, $9, $9)
       ON CONFLICT (external_reference) DO NOTHING`,
      [
        Number(session.metadata?.wedding_gift_id) || null,
        session.metadata?.wedding_gift_title ?? "Presente",
        session.amount_total ?? 0,
        session.currency ?? "brl",
        session.customer_details?.name ?? null,
        session.customer_details?.email ?? null,
        `stripe-${session.id}`,
        session.id,
        paidAt,
      ],
    );
    inserted += result.rowCount ?? 0;
  }

  console.log(`${inserted} compras migradas (as demais ja existiam).`);
  await getPool().end();
}

main().catch((error) => {
  console.error("Migracao falhou:", error);
  process.exit(1);
});
