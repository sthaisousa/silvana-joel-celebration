import { createServerFn } from "@tanstack/react-start";

import { ensureGiftPurchasesTable } from "@/lib/db";
import { reconcilePurchase } from "@/lib/reconcile-purchase";

// Este arquivo e importado pelo navegador (GiftPaymentReturn). Ele so pode
// exportar server functions: qualquer export comum que toque o banco vazaria
// o `pg` para o bundle do cliente. A logica fica em @/lib/reconcile-purchase.
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
