import { createServerFn } from "@tanstack/react-start";

import { ensureGiftPurchasesTable, getPool } from "@/lib/db";
import { mercadoPagoRequest, parseApprovedPayment } from "@/lib/mercadopago";
import type { PaymentSearchResult } from "@/lib/mercadopago";

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

export const confirmGiftPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): { externalReference: string } => {
    const reference = (input as { externalReference?: unknown })?.externalReference;
    if (typeof reference !== "string" || !reference.trim() || reference.length > 255) {
      throw new Error("Referencia de pagamento invalida.");
    }
    return { externalReference: reference.trim() };
  })
  .handler(async ({ data }) => {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN ausente nas variaveis de ambiente.");
      return { status: "pending" as const };
    }

    await ensureGiftPurchasesTable();

    try {
      return await reconcilePurchase(data.externalReference, accessToken);
    } catch (error) {
      // O convidado ja pagou; nao vale quebrar a tela dele por falha de consulta.
      console.error("Falha ao confirmar pagamento:", error);
      return { status: "pending" as const };
    }
  });
