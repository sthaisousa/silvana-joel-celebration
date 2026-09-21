import { createServerFn } from "@tanstack/react-start";

import { ensureGiftPurchasesTable } from "@/lib/db";
import type { PaymentReference } from "@/lib/infinitepay";
import { reconcilePurchase } from "@/lib/reconcile-purchase";

// Este arquivo e importado pelo navegador (GiftPaymentReturn). Ele so pode
// exportar server functions: qualquer export comum que toque o banco vazaria
// o `pg` para o bundle do cliente. A logica fica em @/lib/reconcile-purchase.

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim() || value.length > 255) {
    throw new Error(`Referencia de pagamento invalida: ${field}.`);
  }
  return value.trim();
}

export const confirmGiftPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): PaymentReference => {
    const ref = (input ?? {}) as Record<string, unknown>;
    return {
      orderNsu: requiredString(ref.orderNsu, "orderNsu"),
      transactionNsu: requiredString(ref.transactionNsu, "transactionNsu"),
      slug: requiredString(ref.slug, "slug"),
      receiptUrl: typeof ref.receiptUrl === "string" ? ref.receiptUrl.slice(0, 2048) : null,
    };
  })
  .handler(async ({ data }) => {
    const handle = process.env.INFINITEPAY_HANDLE;
    if (!handle) {
      console.error("INFINITEPAY_HANDLE ausente nas variaveis de ambiente.");
      return { status: "pending" as const };
    }

    await ensureGiftPurchasesTable();

    try {
      return await reconcilePurchase(data, handle);
    } catch (error) {
      // O convidado ja pagou; nao vale quebrar a tela dele por falha de
      // consulta. O webhook confirma depois.
      console.error("Falha ao confirmar pagamento:", error);
      return { status: "pending" as const };
    }
  });
