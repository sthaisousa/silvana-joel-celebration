export type GiftCheckoutInput = {
  giftId: number;
  buyerName: string;
};

export function validateGiftCheckoutInput(input: unknown): GiftCheckoutInput {
  if (!input || typeof input !== "object") {
    throw new Error("Presente invalido.");
  }

  const { giftId, buyerName } = input as Partial<GiftCheckoutInput>;

  const parsedGiftId = Number(giftId);
  if (!Number.isInteger(parsedGiftId) || parsedGiftId <= 0) {
    throw new Error("Presente invalido.");
  }

  const normalizedName = buyerName?.trim();
  if (!normalizedName || normalizedName.length > 255) {
    throw new Error("Informe um nome valido.");
  }

  return { giftId: parsedGiftId, buyerName: normalizedName };
}
