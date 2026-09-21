// Somente servidor. Importe este modulo apenas de dentro de handlers de
// createServerFn: o TanStack Start remove esses imports do bundle do navegador,
// mas um import solto em arquivo usado pelo cliente arrastaria o `pg` para o
// browser e derrubaria a pagina inteira.
import { getPool } from "./db";
import { mercadoPagoRequest, parseApprovedPayment } from "./mercadopago";
import type { PaymentSearchResult } from "./mercadopago";

type PaymentSearch = { results?: PaymentSearchResult[] | null };

/**
 * Consulta o Mercado Pago por uma referencia e, se o pagamento estiver
 * aprovado, promove a linha `pending` para `paid`. E idempotente: rodar de
 * novo sobre uma compra ja paga nao duplica nem altera nada.
 */
export async function reconcilePurchase(externalReference: string, accessToken: string) {
  const search = await mercadoPagoRequest<PaymentSearch>(
    `/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}`,
    { accessToken },
  );

  const approved = parseApprovedPayment(search);
  if (!approved) return { status: "pending" as const };

  await getPool().query(
    `UPDATE wedding_gift_purchases
        SET status = 'paid',
            provider_payment_id = $2,
            buyer_email = COALESCE($3, buyer_email),
            buyer_name = COALESCE(buyer_name, $4),
            payment_method = $5,
            amount_cents = $6,
            paid_at = COALESCE(paid_at, now())
      WHERE external_reference = $1
        AND status <> 'paid'`,
    [
      externalReference,
      approved.paymentId,
      approved.payerEmail,
      approved.payerName,
      approved.paymentMethod,
      approved.amountCents,
    ],
  );

  return { status: "paid" as const };
}
