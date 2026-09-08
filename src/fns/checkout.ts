import { ReplitConnectors } from "@replit/connectors-sdk";
import { createServerFn } from "@tanstack/react-start";

import { getPool } from "@/lib/db";

type StripeProduct = {
  id: string;
  metadata?: Record<string, string>;
};

type StripePrice = {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
};

type StripeList<T> = {
  data: T[];
};

async function stripeRequest<T>(
  connectors: ReplitConnectors,
  path: string,
  options?: { method?: string; body?: URLSearchParams },
) {
  const response = await connectors.proxy("stripe", path, {
    method: options?.method ?? "GET",
    headers: options?.body
      ? { "content-type": "application/x-www-form-urlencoded" }
      : undefined,
    body: options?.body?.toString(),
  });

  if (!response.ok) {
    console.error("Erro do Stripe:", response.status, await response.text());
    throw new Error("Não foi possível iniciar o pagamento.");
  }

  return (await response.json()) as T;
}

export const createGiftCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") {
      throw new Error("Presente inválido.");
    }

    const giftId = Number((input as { giftId?: unknown }).giftId);
    if (!Number.isInteger(giftId) || giftId <= 0) {
      throw new Error("Presente inválido.");
    }

    return { giftId };
  })
  .handler(async ({ data }) => {
    const giftResult = await getPool().query<{
      title: string;
      description: string;
      price_cents: number;
    }>(
      `SELECT title, description, price_cents
       FROM wedding_gifts WHERE id = $1 AND active = TRUE LIMIT 1`,
      [data.giftId],
    );
    const gift = giftResult.rows[0];
    if (!gift) {
      throw new Error("Presente não encontrado.");
    }

    const unitAmount = gift.price_cents;
    if (!Number.isInteger(unitAmount) || unitAmount <= 0) {
      throw new Error("Valor do presente inválido.");
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
    if (!domain) {
      throw new Error("Domínio da aplicação indisponível.");
    }

    const connectors = new ReplitConnectors();
    const products = await stripeRequest<StripeList<StripeProduct>>(
      connectors,
      "/v1/products?active=true&limit=100",
    );

    let product = products.data.find(
      (item) => item.metadata?.wedding_gift_id === String(data.giftId),
    );

    if (!product) {
      const body = new URLSearchParams();
      body.set("name", gift.title);
      body.set("description", gift.description);
      body.set("metadata[wedding_gift_title]", gift.title);
      body.set("metadata[wedding_gift_id]", String(data.giftId));
      body.set("metadata[event]", "silvana-joel");

      product = await stripeRequest<StripeProduct>(connectors, "/v1/products", {
        method: "POST",
        body,
      });
    }

    const prices = await stripeRequest<StripeList<StripePrice>>(
      connectors,
      `/v1/prices?active=true&currency=brl&limit=100&product=${encodeURIComponent(product.id)}`,
    );
    let price = prices.data.find(
      (item) => item.active && item.currency === "brl" && item.unit_amount === unitAmount,
    );

    if (!price) {
      const body = new URLSearchParams();
      body.set("currency", "brl");
      body.set("product", product.id);
      body.set("unit_amount", String(unitAmount));

      price = await stripeRequest<StripePrice>(connectors, "/v1/prices", {
        method: "POST",
        body,
      });
    }

    const checkoutBody = new URLSearchParams();
    checkoutBody.set("mode", "payment");
    checkoutBody.set("line_items[0][price]", price.id);
    checkoutBody.set("line_items[0][quantity]", "1");
    checkoutBody.set("success_url", `https://${domain}/?presente=sucesso#presentes`);
    checkoutBody.set("cancel_url", `https://${domain}/?presente=cancelado#presentes`);
    checkoutBody.set("locale", "pt-BR");
    checkoutBody.set("metadata[wedding_gift_title]", gift.title);
    checkoutBody.set("metadata[wedding_gift_id]", String(data.giftId));

    const session = await stripeRequest<{ url: string | null }>(
      connectors,
      "/v1/checkout/sessions",
      { method: "POST", body: checkoutBody },
    );

    if (!session.url) {
      throw new Error("O Stripe não retornou uma página de pagamento.");
    }

    return { url: session.url };
  });