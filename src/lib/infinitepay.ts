// Cliente da API do Checkout Integrado da InfinitePay.
// Sem dependencias de servidor: e seguro importar no navegador.

export type GiftForCheckout = {
  id: number;
  title: string;
  price_cents: number;
};

export type CheckoutLinkPayload = {
  handle: string;
  order_nsu: string;
  redirect_url: string;
  webhook_url: string;
  items: Array<{ quantity: number; price: number; description: string }>;
  customer: { name: string };
  address: {
    cep: string;
    street: string;
    neighborhood: string;
    number: string;
    complement: string;
  };
};

// Local do casamento: ja vai preenchido para o convidado nao precisar digitar
// um endereco no checkout.
export const WEDDING_ADDRESS: CheckoutLinkPayload["address"] = {
  cep: "79020220",
  street: "Rua Manoel Inácio de Souza",
  neighborhood: "Centro",
  number: "507",
  complement: "A",
};

export function buildCheckoutLinkPayload(input: {
  handle: string;
  gift: GiftForCheckout;
  buyerName: string;
  orderNsu: string;
  domain: string;
}): CheckoutLinkPayload {
  return {
    handle: input.handle,
    order_nsu: input.orderNsu,
    // Sem query nem #fragmento: a InfinitePay anexa order_nsu, slug e
    // transaction_nsu a esta URL, e nao ha garantia de como ela junta
    // parametros a uma URL que ja tem os seus.
    redirect_url: `https://${input.domain}/`,
    webhook_url: `https://${input.domain}/api/infinitepay/webhook`,
    items: [
      {
        quantity: 1,
        // A API recebe centavos, o mesmo formato de wedding_gifts.price_cents.
        price: input.gift.price_cents,
        description: input.gift.title,
      },
    ],
    customer: { name: input.buyerName },
    address: WEDDING_ADDRESS,
  };
}

export type PaymentCheckResult =
  | { paid: true; captureMethod: string | null; installments: number | null; paidAmountCents: number }
  | { paid: false };

/**
 * Decide se a resposta do payment_check comprova o pagamento de um presente.
 *
 * O webhook e o retorno do convidado podem ser forjados (a InfiniteTag e
 * publica), entao esta consulta e a unica fonte de verdade. Alem de `paid`,
 * exige que `amount` seja exatamente o preco do presente. `paid_amount` pode
 * ser maior — sao os juros do parcelamento, pagos pelo convidado.
 */
export function parsePaymentCheck(response: unknown, expectedAmountCents: number): PaymentCheckResult {
  if (!response || typeof response !== "object") return { paid: false };

  const check = response as {
    success?: unknown;
    paid?: unknown;
    amount?: unknown;
    paid_amount?: unknown;
    installments?: unknown;
    capture_method?: unknown;
  };

  if (check.success !== true || check.paid !== true) return { paid: false };
  if (check.amount !== expectedAmountCents) return { paid: false };

  return {
    paid: true,
    captureMethod: typeof check.capture_method === "string" ? check.capture_method : null,
    installments: typeof check.installments === "number" ? check.installments : null,
    paidAmountCents: typeof check.paid_amount === "number" ? check.paid_amount : expectedAmountCents,
  };
}

const API_BASE = "https://api.checkout.infinitepay.io";

type FetchImpl = (url: string, init?: RequestInit) => Promise<Response>;

export function newOrderNsu(giftId: number) {
  return `gift-${giftId}-${crypto.randomUUID()}`;
}

export async function infinitePayPost<T>(
  path: string,
  body: unknown,
  fetchImpl: FetchImpl = fetch,
): Promise<T> {
  const response = await fetchImpl(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Erro da InfinitePay:", response.status, await response.text());
    throw new Error("Nao foi possivel iniciar o pagamento.");
  }

  return (await response.json()) as T;
}

/** Os tres identificadores que o payment_check exige para achar a transacao. */
export type PaymentReference = {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
  receiptUrl: string | null;
};

function nonEmpty(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toReference(fields: {
  orderNsu: unknown;
  transactionNsu: unknown;
  slug: unknown;
  receiptUrl: unknown;
}): PaymentReference | null {
  const orderNsu = nonEmpty(fields.orderNsu);
  const transactionNsu = nonEmpty(fields.transactionNsu);
  const slug = nonEmpty(fields.slug);
  if (!orderNsu || !transactionNsu || !slug) return null;

  return { orderNsu, transactionNsu, slug, receiptUrl: nonEmpty(fields.receiptUrl) };
}

/** Parametros que a InfinitePay anexa a redirect_url quando o convidado volta. */
export function parseReturnParams(params: URLSearchParams): PaymentReference | null {
  return toReference({
    orderNsu: params.get("order_nsu"),
    transactionNsu: params.get("transaction_nsu"),
    slug: params.get("slug"),
    receiptUrl: params.get("receipt_url"),
  });
}

/** Corpo do webhook. Aqui o slug chega com o nome de `invoice_slug`. */
export function parseWebhookBody(body: unknown): PaymentReference | null {
  if (!body || typeof body !== "object") return null;

  const webhook = body as Record<string, unknown>;
  return toReference({
    orderNsu: webhook.order_nsu,
    transactionNsu: webhook.transaction_nsu,
    slug: webhook.invoice_slug,
    receiptUrl: webhook.receipt_url,
  });
}
