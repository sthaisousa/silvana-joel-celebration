import { createServerFn } from "@tanstack/react-start";

import { ensureGiftPurchasesTable, getPool } from "@/lib/db";
import { validateGiftCheckoutInput } from "@/lib/gift-purchase";
import { buildCheckoutLinkPayload, infinitePayPost, newOrderNsu } from "@/lib/infinitepay";

export const createGiftCheckout = createServerFn({ method: "POST" })
  .inputValidator(validateGiftCheckoutInput)
  .handler(async ({ data }) => {
    // A InfiniteTag (sem o $) nao e secreta, mas fica em variavel de ambiente
    // para trocar a conta que recebe sem mexer no codigo.
    const handle = process.env.INFINITEPAY_HANDLE;
    if (!handle) {
      console.error("INFINITEPAY_HANDLE ausente nas variaveis de ambiente.");
      throw new Error("Pagamento indisponivel no momento.");
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
    if (!domain) {
      throw new Error("Dominio da aplicacao indisponivel.");
    }

    await ensureGiftPurchasesTable();

    const giftResult = await getPool().query<{
      id: number;
      title: string;
      price_cents: number;
    }>(
      `SELECT id, title, price_cents
       FROM wedding_gifts WHERE id = $1 AND active = TRUE LIMIT 1`,
      [data.giftId],
    );
    const gift = giftResult.rows[0];
    if (!gift) {
      throw new Error("Presente nao encontrado.");
    }

    if (!Number.isInteger(gift.price_cents) || gift.price_cents <= 0) {
      throw new Error("Valor do presente invalido.");
    }

    const orderNsu = newOrderNsu(gift.id);

    // Grava a intencao ANTES de criar o link: nunca pode existir um link
    // pagavel sem compra no banco, senao o webhook nao teria onde registrar o
    // pagamento. O valor gravado e o que a confirmacao compara depois, mesmo
    // que o preco do presente mude.
    await getPool().query(
      `INSERT INTO wedding_gift_purchases
         (gift_id, gift_title, amount_cents, buyer_name, status, provider, external_reference)
       VALUES ($1, $2, $3, $4, 'pending', 'infinitepay', $5)`,
      [gift.id, gift.title, gift.price_cents, data.buyerName, orderNsu],
    );

    let link: { url?: string };
    try {
      link = await infinitePayPost<{ url?: string }>(
        "/links",
        buildCheckoutLinkPayload({
          handle,
          gift,
          buyerName: data.buyerName,
          orderNsu,
          domain,
        }),
      );
    } catch (error) {
      // Sem link, ninguem consegue pagar esta compra: remove para nao poluir o banco.
      await getPool()
        .query("DELETE FROM wedding_gift_purchases WHERE external_reference = $1", [orderNsu])
        .catch((cleanupError) => console.error("Falha ao limpar compra sem link:", cleanupError));
      throw error;
    }

    if (!link.url) {
      throw new Error("A InfinitePay nao retornou uma pagina de pagamento.");
    }

    return { url: link.url };
  });
