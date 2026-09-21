// Somente servidor. Importe este modulo apenas de dentro de handlers (de
// createServerFn ou de rotas de servidor): um import solto em arquivo usado
// pelo navegador arrasta o `pg` para o bundle do cliente e derruba a pagina
// inteira com "Buffer is not defined".
import { getPool } from "./db";
import { infinitePayPost, parsePaymentCheck } from "./infinitepay";
import type { PaymentReference } from "./infinitepay";

export type ReconcileStatus = "paid" | "pending" | "unknown";

/**
 * Confirma um pagamento na InfinitePay e promove a compra `pending` a `paid`.
 *
 * Tanto o retorno do convidado quanto o webhook chegam aqui, e os dois podem
 * ser forjados — a InfiniteTag e publica. Por isso nada e marcado como pago
 * sem o payment_check confirmar, e o valor e comparado com o que foi cobrado
 * no checkout (amount_cents da propria compra, nao o preco atual do presente).
 *
 * E idempotente: retorno e webhook costumam chegar os dois, e o segundo nao
 * refaz nada.
 */
export async function reconcilePurchase(
  ref: PaymentReference,
  handle: string,
): Promise<{ status: ReconcileStatus }> {
  const result = await getPool().query<{ amount_cents: number; status: string }>(
    `SELECT amount_cents, status
       FROM wedding_gift_purchases
      WHERE external_reference = $1 AND provider = 'infinitepay'`,
    [ref.orderNsu],
  );
  const purchase = result.rows[0];

  // Um order_nsu que nao criamos nao e um presente deste site.
  if (!purchase) return { status: "unknown" };
  if (purchase.status === "paid") return { status: "paid" };

  const check = await infinitePayPost<unknown>("/payment_check", {
    handle,
    order_nsu: ref.orderNsu,
    transaction_nsu: ref.transactionNsu,
    slug: ref.slug,
  });

  const payment = parsePaymentCheck(check, purchase.amount_cents);
  if (!payment.paid) return { status: "pending" };

  await getPool().query(
    `UPDATE wedding_gift_purchases
        SET status = 'paid',
            provider_payment_id = $2,
            provider_invoice_slug = $3,
            receipt_url = COALESCE($4, receipt_url),
            payment_method = $5,
            installments = $6,
            paid_at = COALESCE(paid_at, now())
      WHERE external_reference = $1
        AND status <> 'paid'`,
    [
      ref.orderNsu,
      ref.transactionNsu,
      ref.slug,
      ref.receiptUrl,
      payment.captureMethod,
      payment.installments,
    ],
  );

  return { status: "paid" };
}
