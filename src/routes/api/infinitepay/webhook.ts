import { createFileRoute } from "@tanstack/react-router";

import { parseWebhookBody } from "@/lib/infinitepay";

// A InfinitePay chama esta rota quando um pagamento aprova, inclusive para o
// convidado que pagou e fechou a aba sem voltar ao site.
//
// Contrato de resposta da InfinitePay: 200 encerra, 400 faz ela tentar de novo.
// Por isso so devolvemos 400 em falha nossa e passageira; aviso invalido ou
// que nao confere recebe 200, senao seria reenviado para sempre.
export const Route = createFileRoute("/api/infinitepay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const handle = process.env.INFINITEPAY_HANDLE;
        if (!handle) {
          console.error("Webhook InfinitePay: INFINITEPAY_HANDLE ausente.");
          return new Response("misconfigured", { status: 400 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("ignored", { status: 200 });
        }

        const ref = parseWebhookBody(body);
        if (!ref) return new Response("ignored", { status: 200 });

        try {
          // Imports dinamicos de proposito: arquivos de rota tambem vao para o
          // navegador, e um import estatico do banco aqui arrastaria o `pg`
          // para o cliente (o mesmo "Buffer is not defined" de antes).
          const { ensureGiftPurchasesTable } = await import("@/lib/db");
          const { reconcilePurchase } = await import("@/lib/reconcile-purchase");

          await ensureGiftPurchasesTable();
          const result = await reconcilePurchase(ref, handle);
          return new Response(result.status, { status: 200 });
        } catch (error) {
          console.error("Webhook InfinitePay: falha ao reconciliar", ref.orderNsu, error);
          return new Response("retry", { status: 400 });
        }
      },
    },
  },
});
