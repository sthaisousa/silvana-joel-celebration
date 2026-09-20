export type GiftForCheckout = {
  id: number;
  title: string;
  description: string;
  price_cents: number;
};

export type PreferencePayload = {
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    currency_id: "BRL";
    unit_price: number;
  }>;
  payment_methods: {
    excluded_payment_types: Array<{ id: string }>;
  };
  payer: { name: string };
  external_reference: string;
  auto_return: "approved";
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
};

export function buildPreferencePayload(input: {
  gift: GiftForCheckout;
  buyerName: string;
  externalReference: string;
  domain: string;
}): PreferencePayload {
  return {
    items: [
      {
        id: String(input.gift.id),
        title: input.gift.title,
        description: input.gift.description,
        quantity: 1,
        currency_id: "BRL",
        unit_price: input.gift.price_cents / 100,
      },
    ],
    // Só cartão aqui. O Pix sai porque o site oferece Pix estático com taxa
    // zero, e cobrá-lo pelo Mercado Pago (~1%) seria perder dinheiro à toa.
    payment_methods: {
      excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }],
    },
    payer: { name: input.buyerName },
    external_reference: input.externalReference,
    auto_return: "approved",
    back_urls: {
      success: giftsUrl(input.domain, "sucesso", input.externalReference),
      failure: giftsUrl(input.domain, "falhou", input.externalReference),
      pending: giftsUrl(input.domain, "pendente", input.externalReference),
    },
  };
}

// Preferencias ficam em /checkout/preferences e pagamentos em /v1/payments,
// entao a base nao carrega versao — cada chamada informa o caminho completo.
const API_BASE = "https://api.mercadopago.com";

type FetchImpl = (url: string, init?: RequestInit) => Promise<Response>;

export function newExternalReference(giftId: number) {
  return `gift-${giftId}-${crypto.randomUUID()}`;
}

export async function mercadoPagoRequest<T>(
  path: string,
  options: {
    accessToken: string;
    method?: string;
    body?: unknown;
    fetchImpl?: FetchImpl;
  },
): Promise<T> {
  const doFetch = options.fetchImpl ?? fetch;
  const response = await doFetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      "content-type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    console.error("Erro do Mercado Pago:", response.status, await response.text());
    throw new Error("Nao foi possivel iniciar o pagamento.");
  }

  return (await response.json()) as T;
}

export type PaymentSearchResult = {
  id: number | string;
  status: string;
  transaction_amount: number;
  payment_method_id?: string;
  date_approved?: string | null;
  payer?: {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
};

export type ApprovedPayment = {
  paymentId: string;
  amountCents: number;
  payerEmail: string | null;
  payerName: string | null;
  paymentMethod: string | null;
  approvedAt: string | null;
};

export function parseApprovedPayment(search: {
  results?: PaymentSearchResult[] | null;
}): ApprovedPayment | null {
  const approved = search.results?.find((result) => result.status === "approved");
  if (!approved) return null;

  const payerName = [approved.payer?.first_name, approved.payer?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    paymentId: String(approved.id),
    // transaction_amount vem em reais; arredondar evita 1187.99 * 100 = 118798.99...
    amountCents: Math.round(approved.transaction_amount * 100),
    payerEmail: approved.payer?.email ?? null,
    payerName: payerName || null,
    paymentMethod: approved.payment_method_id ?? null,
    approvedAt: approved.date_approved ?? null,
  };
}

function giftsUrl(domain: string, outcome: string, externalReference: string) {
  return `https://${domain}/?presente=${outcome}&ref=${encodeURIComponent(externalReference)}#presentes`;
}
