import { test } from "node:test";
import assert from "node:assert/strict";

import { validateGiftCheckoutInput } from "./gift-purchase";

test("recusa compra sem nome do convidado", () => {
  assert.throws(
    () => validateGiftCheckoutInput({ giftId: 7, buyerName: "   " }),
    /Informe um nome/,
  );
});

test("recusa presente com id invalido", () => {
  assert.throws(
    () => validateGiftCheckoutInput({ giftId: 0, buyerName: "Maria" }),
    /Presente invalido/,
  );
});

test("remove espacos sobrando do nome", () => {
  const input = validateGiftCheckoutInput({ giftId: 7, buyerName: "  Maria Souza  " });

  assert.equal(input.buyerName, "Maria Souza");
});

test("recusa nome longo demais para a coluna do banco", () => {
  assert.throws(
    () => validateGiftCheckoutInput({ giftId: 7, buyerName: "a".repeat(256) }),
    /Informe um nome/,
  );
});
