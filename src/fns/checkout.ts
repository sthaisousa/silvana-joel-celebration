import { createServerFn } from "@tanstack/react-start";

import { ensureGiftPurchasesTable, getPool } from "@/lib/db";
import { validateGiftCheckoutInput } from "@/lib/gift-purchase";
import {
  buildPreferencePayload,
  mercadoPagoRequest,
  newExternalReference,
} from "@/lib/mercadopago";

type PreferenceResponse = {
  id: string;
  init_point: string;
};

export const createGiftCheckout = createServerFn({ method: "POST" })
  .inputValidator(validateGiftCheckoutInput)
  .handler(async ({ data }) => {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN ausente nas variaveis de ambiente.");
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
      description: string;
      price_cents: number;
    }>(
      `SELECT id, title, description, price_cents
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

    const externalReference = newExternalReference(gift.id);

    const preference = await mercadoPagoRequest<PreferenceResponse>(
      "/checkout/preferences",
      {
        accessToken,
        method: "POST",
        body: buildPreferencePayload({
          gift,
          buyerName: data.buyerName,
          externalReference,
          domain,
        }),
      },
    );

    // Grava a intencao antes do redirecionamento: se a confirmacao no retorno
    // falhar, o painel ainda mostra quem tentou presentear e o que.
    await getPool().query(
      `INSERT INTO wedding_gift_purchases
         (gift_id, gift_title, amount_cents, buyer_name, status, provider, external_reference)
       VALUES ($1, $2, $3, $4, 'pending', 'mercadopago', $5)
       ON CONFLICT (external_reference) DO NOTHING`,
      [gift.id, gift.title, gift.price_cents, data.buyerName, externalReference],
    );

    if (!preference.init_point) {
      throw new Error("O Mercado Pago nao retornou uma pagina de pagamento.");
    }

    return { url: preference.init_point };
  });
