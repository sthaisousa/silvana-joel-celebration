import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildCheckoutLinkPayload,
  infinitePayPost,
  newOrderNsu,
  parsePaymentCheck,
  parseReturnParams,
  parseWebhookBody,
} from "./infinitepay";

const gift = {
  id: 7,
  title: "Jogo de panelas",
  price_cents: 118700,
};

const linkInput = {
  handle: "silvana-joel",
  gift,
  buyerName: "Maria Souza",
  orderNsu: "gift-7-abc123",
  domain: "casamento.exemplo.br",
};

test("mantem o preco em centavos, como a infinitepay espera", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.equal(payload.items[0].price, 118700);
});

test("identifica a conta pelo handle e o pedido pelo order_nsu", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.equal(payload.handle, "silvana-joel");
  assert.equal(payload.order_nsu, "gift-7-abc123");
});

test("descreve um unico item com o nome do presente", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.deepEqual(payload.items, [
    { quantity: 1, price: 118700, description: "Jogo de panelas" },
  ]);
});

test("redireciona para a raiz sem query, porque a infinitepay anexa os parametros", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.equal(payload.redirect_url, "https://casamento.exemplo.br/");
});

test("registra o webhook que confirma pagamentos de quem fecha a aba", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.equal(payload.webhook_url, "https://casamento.exemplo.br/api/infinitepay/webhook");
});

test("envia o nome informado pelo convidado", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.equal(payload.customer.name, "Maria Souza");
});

test("preenche o endereco do casamento no checkout", () => {
  const payload = buildCheckoutLinkPayload(linkInput);

  assert.deepEqual(payload.address, {
    cep: "79020220",
    street: "Rua Manoel Inácio de Souza",
    neighborhood: "Centro",
    number: "507",
    complement: "A",
  });
});

test("nao considera pago quando a consulta nao encontra a transacao", () => {
  const result = parsePaymentCheck({ success: false }, 118700);

  assert.equal(result.paid, false);
});

test("nao considera pago quando a transacao existe mas nao foi paga", () => {
  const result = parsePaymentCheck({ success: true, paid: false, amount: 118700 }, 118700);

  assert.equal(result.paid, false);
});

test("considera pago quando a infinitepay confirma e o valor bate", () => {
  const result = parsePaymentCheck(
    { success: true, paid: true, amount: 118700, paid_amount: 118700, installments: 1, capture_method: "credit_card" },
    118700,
  );

  assert.deepEqual(result, {
    paid: true,
    captureMethod: "credit_card",
    installments: 1,
    paidAmountCents: 118700,
  });
});

test("recusa pagamento com valor diferente do preco do presente", () => {
  const result = parsePaymentCheck(
    { success: true, paid: true, amount: 100, paid_amount: 100, installments: 1, capture_method: "credit_card" },
    118700,
  );

  assert.equal(result.paid, false);
});

test("aceita paid_amount maior que o preco, que sao os juros do parcelamento", () => {
  const result = parsePaymentCheck(
    { success: true, paid: true, amount: 118700, paid_amount: 131000, installments: 12, capture_method: "credit_card" },
    118700,
  );

  assert.equal(result.paid, true);
});

test("trata resposta malformada como nao paga em vez de quebrar", () => {
  assert.equal(parsePaymentCheck(null, 118700).paid, false);
  assert.equal(parsePaymentCheck("erro", 118700).paid, false);
});

test("le a referencia do pagamento nos parametros de retorno", () => {
  const params = new URLSearchParams(
    "order_nsu=gift-7-abc&transaction_nsu=tx-1&slug=inv-9&capture_method=pix&receipt_url=https%3A%2F%2Fr.io%2F1",
  );

  assert.deepEqual(parseReturnParams(params), {
    orderNsu: "gift-7-abc",
    transactionNsu: "tx-1",
    slug: "inv-9",
    receiptUrl: "https://r.io/1",
  });
});

test("ignora uma visita comum, sem parametros de pagamento", () => {
  assert.equal(parseReturnParams(new URLSearchParams("")), null);
});

test("ignora retorno sem transaction_nsu, que e obrigatorio na consulta", () => {
  const params = new URLSearchParams("order_nsu=gift-7-abc&slug=inv-9");

  assert.equal(parseReturnParams(params), null);
});

test("le a referencia no webhook, onde o slug vem como invoice_slug", () => {
  const ref = parseWebhookBody({
    invoice_slug: "inv-9",
    transaction_nsu: "tx-1",
    order_nsu: "gift-7-abc",
    receipt_url: "https://r.io/1",
    amount: 118700,
  });

  assert.deepEqual(ref, {
    orderNsu: "gift-7-abc",
    transactionNsu: "tx-1",
    slug: "inv-9",
    receiptUrl: "https://r.io/1",
  });
});

test("recusa webhook sem os campos necessarios para a consulta", () => {
  assert.equal(parseWebhookBody({ order_nsu: "gift-7-abc" }), null);
  assert.equal(parseWebhookBody(null), null);
  assert.equal(parseWebhookBody("lixo"), null);
});

test("order_nsu identifica o presente e nao se repete", () => {
  const first = newOrderNsu(7);
  const second = newOrderNsu(7);

  assert.ok(first.startsWith("gift-7-"));
  assert.notEqual(first, second);
});

test("envia json para a url absoluta da api", async () => {
  let seen: { url: string; body: string | null } | null = null;
  const fetchImpl = async (url: string, init?: RequestInit) => {
    seen = { url, body: (init?.body as string) ?? null };
    return new Response(JSON.stringify({ url: "https://checkout.infinitepay.io/x" }), { status: 200 });
  };

  const result = await infinitePayPost<{ url: string }>("/links", { handle: "h" }, fetchImpl);

  assert.equal(result.url, "https://checkout.infinitepay.io/x");
  assert.deepEqual(seen, { url: "https://api.checkout.infinitepay.io/links", body: '{"handle":"h"}' });
});

test("traduz falha da api em erro legivel para o convidado", async () => {
  const fetchImpl = async () => new Response("handle invalido", { status: 422 });

  await assert.rejects(infinitePayPost("/links", {}, fetchImpl), /Nao foi possivel iniciar o pagamento/);
});
