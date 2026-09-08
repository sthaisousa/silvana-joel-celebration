import { ReplitConnectors } from "@replit/connectors-sdk";
import { createServerFn } from "@tanstack/react-start";

import { gifts } from "@/components/wedding/Gifts";

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

function priceInCents(formattedPrice: string) {
  const normalized = formattedPrice
    .replace("R$", "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  return Math.round(Number(normalized) * 100);
}

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

    const title = (input as { title?: unknown }).title;
    if (typeof title !== "string") {
      throw new Error("Presente inválido.");
    }

    const gift = gifts.find((item) => item.title === title);
    if (!gift) {
      throw new Error("Presente não encontrado.");
    }

    return { title: gift.title };
  })
  .handler(async ({ data }) => {
    const gift = gifts.find((item) => item.title === data.title);
    if (!gift) {
      throw new Error("Presente não encontrado.");
    }

    const unitAmount = priceInCents(gift.price);
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
      (item) => item.metadata?.wedding_gift_title === gift.title,
    );

    if (!product) {
      const body = new URLSearchParams();
      body.set("name", gift.title);
      body.set("description", gift.description);
      body.set("metadata[wedding_gift_title]", gift.title);
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