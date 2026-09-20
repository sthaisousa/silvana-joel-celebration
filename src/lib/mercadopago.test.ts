import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPreferencePayload,
  mercadoPagoRequest,
  newExternalReference,
  parseApprovedPayment,
} from "./mercadopago";

const gift = {
  id: 7,
  title: "Jogo de panelas",
  description: "Para equipar a nova cozinha.",
  price_cents: 118700,
};

test("converte centavos para reais no unit_price", () => {
  const payload = buildPreferencePayload({
    gift,
    buyerName: "Maria Souza",
    externalReference: "gift-7-abc123",
    domain: "casamento.exemplo.br",
  });

  assert.equal(payload.items[0].unit_price, 1187);
});

test("deixa so cartao: pix e boleto ficam fora do checkout do mercado pago", () => {
  const payload = buildPreferencePayload({
    gift,
    buyerName: "Maria Souza",
    externalReference: "gift-7-abc123",
    domain: "casamento.exemplo.br",
  });

  // O site oferece Pix estatico com taxa zero, entao cobrar Pix aqui (~1%)
  // seria so perder dinheiro. "bank_transfer" e o Pix; "ticket" e o boleto.
  assert.deepEqual(payload.payment_methods.excluded_payment_types, [
    { id: "ticket" },
    { id: "bank_transfer" },
  ]);
});

test("back_urls de sucesso carrega a referencia para a confirmacao no retorno", () => {
  const payload = buildPreferencePayload({
    gift,
    buyerName: "Maria Souza",
    externalReference: "gift-7-abc123",
    domain: "casamento.exemplo.br",
  });

  assert.equal(
    payload.back_urls.success,
    "https://casamento.exemplo.br/?presente=sucesso&ref=gift-7-abc123#presentes",
  );
});

test("devolve para o site automaticamente quando o pagamento aprova", () => {
  const payload = buildPreferencePayload({
    gift,
    buyerName: "Maria Souza",
    externalReference: "gift-7-abc123",
    domain: "casamento.exemplo.br",
  });

  assert.equal(payload.auto_return, "approved");
});

test("guarda o nome informado pelo convidado e a referencia externa", () => {
  const payload = buildPreferencePayload({
    gift,
    buyerName: "Maria Souza",
    externalReference: "gift-7-abc123",
    domain: "casamento.exemplo.br",
  });

  assert.equal(payload.payer.name, "Maria Souza");
  assert.equal(payload.external_reference, "gift-7-abc123");
});

test("ignora busca sem nenhum pagamento aprovado", () => {
  const parsed = parseApprovedPayment({
    results: [{ id: 1, status: "pending", transaction_amount: 1187 }],
  });

  assert.equal(parsed, null);
});

test("converte o valor de reais para centavos sem erro de ponto flutuante", () => {
  const parsed = parseApprovedPayment({
    results: [{ id: 99, status: "approved", transaction_amount: 1187.99 }],
  });

  assert.equal(parsed?.amountCents, 118799);
});

test("escolhe o pagamento aprovado quando houve tentativa recusada antes", () => {
  const parsed = parseApprovedPayment({
    results: [
      { id: 1, status: "rejected", transaction_amount: 1187 },
      { id: 2, status: "approved", transaction_amount: 1187 },
    ],
  });

  assert.equal(parsed?.paymentId, "2");
});

test("extrai email e nome do pagador", () => {
  const parsed = parseApprovedPayment({
    results: [
      {
        id: 5,
        status: "approved",
        transaction_amount: 1187,
        payer: { email: "maria@exemplo.br", first_name: "Maria", last_name: "Souza" },
      },
    ],
  });

  assert.equal(parsed?.payerEmail, "maria@exemplo.br");
  assert.equal(parsed?.payerName, "Maria Souza");
});

test("referencia externa identifica o presente e nao se repete", () => {
  const first = newExternalReference(7);
  const second = newExternalReference(7);

  assert.ok(first.startsWith("gift-7-"));
  assert.notEqual(first, second);
});

test("devolve o json quando o mercado pago responde ok", async () => {
  const fetchImpl = async () =>
    new Response(JSON.stringify({ id: "pref-1" }), { status: 200 });

  const result = await mercadoPagoRequest<{ id: string }>("/checkout/preferences", {
    accessToken: "token-de-teste",
    fetchImpl,
  });

  assert.equal(result.id, "pref-1");
});

test("traduz falha do mercado pago em erro legivel para o convidado", async () => {
  const fetchImpl = async () => new Response("credenciais invalidas", { status: 401 });

  await assert.rejects(
    mercadoPagoRequest("/checkout/preferences", {
      accessToken: "token-errado",
      fetchImpl,
    }),
    /Nao foi possivel iniciar o pagamento/,
  );
});

test("envia o access token no cabecalho de autorizacao", async () => {
  let seenAuth: string | null = null;
  const fetchImpl = async (_url: string, init?: RequestInit) => {
    seenAuth = new Headers(init?.headers).get("authorization");
    return new Response("{}", { status: 200 });
  };

  await mercadoPagoRequest("/checkout/preferences", {
    accessToken: "token-de-teste",
    fetchImpl,
  });

  assert.equal(seenAuth, "Bearer token-de-teste");
});

test("monta a url absoluta a partir do caminho informado", async () => {
  let seenUrl: string | null = null;
  const fetchImpl = async (url: string) => {
    seenUrl = url;
    return new Response("{}", { status: 200 });
  };

  await mercadoPagoRequest("/checkout/preferences", {
    accessToken: "token-de-teste",
    fetchImpl,
  });

  assert.equal(seenUrl, "https://api.mercadopago.com/checkout/preferences");
});
