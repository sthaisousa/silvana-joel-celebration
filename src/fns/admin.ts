import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

import { gifts as defaultGifts } from "@/components/wedding/Gifts";
import { getPool } from "@/lib/db";

const ADMIN_COOKIE = "wedding_admin";

export type AdminGift = {
  id: number;
  title: string;
  description: string;
  price_cents: number;
  active: boolean;
  sort_order: number;
};

export type AdminRsvp = {
  id: number;
  name: string;
  attending: boolean;
  created_at: string;
};

export type AdminMessage = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

export type AdminGiftPurchase = {
  id: string;
  gift_id: number | null;
  gift_title: string;
  amount_total: number;
  currency: string;
  buyer_name: string | null;
  buyer_email: string | null;
  created_at: string;
};

type StripeCheckoutSession = {
  id: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  created: number;
  customer_details?: {
    name?: string | null;
    email?: string | null;
  } | null;
  metadata?: Record<string, string>;
};

function requireSecret(name: "ADMIN_PASSWORD" | "SESSION_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não configurado.`);
  return value;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function sessionToken() {
  return createHmac("sha256", requireSecret("SESSION_SECRET"))
    .update(`wedding-admin:${requireSecret("ADMIN_PASSWORD")}`)
    .digest("hex");
}

function isAuthenticated() {
  const cookie = getCookie(ADMIN_COOKIE);
  return Boolean(cookie && safeEqual(cookie, sessionToken()));
}

function requireAdmin() {
  if (!isAuthenticated()) throw new Error("Acesso não autorizado.");
}

function centsFromPrice(price: string) {
  return Math.round(
    Number(price.replace("R$", "").trim().replace(/\./g, "").replace(",", ".")) * 100,
  );
}

async function ensureGiftCatalog() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const marker = await client.query(
      "SELECT value FROM wedding_site_settings WHERE key = $1 FOR UPDATE",
      ["gift_catalog_seeded"],
    );

    if (marker.rowCount === 0) {
      for (const [index, gift] of defaultGifts.entries()) {
        await client.query(
          `INSERT INTO wedding_gifts (title, description, price_cents, active, sort_order)
           VALUES ($1, $2, $3, TRUE, $4)`,
          [gift.title, gift.description, centsFromPrice(gift.price), index],
        );
      }
      await client.query(
        "INSERT INTO wedding_site_settings (key, value) VALUES ($1, $2)",
        ["gift_catalog_seeded", "true"],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getPaidGiftPurchases(): Promise<AdminGiftPurchase[]> {
  const connectors = new ReplitConnectors();
  const sessions: StripeCheckoutSession[] = [];
  let startingAfter: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "100", status: "complete" });
    if (startingAfter) params.set("starting_after", startingAfter);

    const response = await connectors.proxy(
      "stripe",
      `/v1/checkout/sessions?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.ok) {
      console.error("Falha ao consultar compras no Stripe:", await response.text());
      throw new Error("Não foi possível consultar os pagamentos do Stripe.");
    }

    const page = (await response.json()) as {
      data: StripeCheckoutSession[];
      has_more: boolean;
    };
    sessions.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);

  return sessions
    .filter(
      (session) =>
        session.payment_status === "paid" &&
        session.metadata?.wedding_gift_title &&
        session.metadata?.wedding_gift_id,
    )
    .map((session) => ({
      id: session.id,
      gift_id: Number(session.metadata?.wedding_gift_id) || null,
      gift_title: session.metadata?.wedding_gift_title ?? "Presente",
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? "brl",
      buyer_name: session.customer_details?.name ?? null,
      buyer_email: session.customer_details?.email ?? null,
      created_at: new Date(session.created * 1000).toISOString(),
    }))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => ({
  authenticated: isAuthenticated(),
}));

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const password =
      input && typeof input === "object" ? (input as { password?: unknown }).password : undefined;
    if (typeof password !== "string" || !password) throw new Error("Informe a senha.");
    return { password };
  })
  .handler(async ({ data }) => {
    if (!safeEqual(data.password, requireSecret("ADMIN_PASSWORD"))) {
      throw new Error("Senha incorreta.");
    }

    setCookie(ADMIN_COOKIE, sessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return { authenticated: true };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(ADMIN_COOKIE, { path: "/" });
  return { authenticated: false };
});

export const getPublicGifts = createServerFn({ method: "GET" }).handler(async () => {
  await ensureGiftCatalog();
  const result = await getPool().query<AdminGift>(
    `SELECT id, title, description, price_cents, active, sort_order
     FROM wedding_gifts WHERE active = TRUE ORDER BY sort_order, id`,
  );
  return result.rows;
});

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  await ensureGiftCatalog();

  const [giftResult, rsvpResult, messageResult, purchaseResult] = await Promise.all([
    getPool().query<AdminGift>(
      `SELECT id, title, description, price_cents, active, sort_order
       FROM wedding_gifts ORDER BY sort_order, id`,
    ),
    getPool().query<AdminRsvp>(
      `SELECT id, name, attending, created_at
       FROM wedding_rsvps ORDER BY created_at DESC, id DESC`,
    ),
    getPool().query<AdminMessage>(
      `SELECT id, name, message, created_at
       FROM wedding_messages ORDER BY created_at DESC, id DESC`,
    ),
    getPaidGiftPurchases()
      .then((purchases) => ({ purchases, error: false }))
      .catch((error) => {
        console.error("Falha ao carregar presentes comprados:", error);
        return { purchases: [] as AdminGiftPurchase[], error: true };
      }),
  ]);

  return {
    gifts: giftResult.rows,
    rsvps: rsvpResult.rows,
    messages: messageResult.rows,
    purchases: purchaseResult.purchases,
    purchaseSyncError: purchaseResult.error,
  };
});

export const saveAdminGift = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("Dados inválidos.");
    const value = input as Partial<AdminGift>;
    const title = value.title?.trim();
    const description = value.description?.trim();

    if (!title || title.length > 255) throw new Error("Informe um título válido.");
    if (!description || description.length > 2000) throw new Error("Informe uma descrição válida.");
    if (!Number.isInteger(value.price_cents) || Number(value.price_cents) <= 0) {
      throw new Error("Informe um valor válido.");
    }

    return {
      id: Number(value.id || 0),
      title,
      description,
      price_cents: Number(value.price_cents),
      active: value.active !== false,
      sort_order: Number.isInteger(value.sort_order) ? Number(value.sort_order) : 0,
    };
  })
  .handler(async ({ data }) => {
    requireAdmin();

    if (data.id > 0) {
      await getPool().query(
        `UPDATE wedding_gifts
         SET title = $1, description = $2, price_cents = $3, active = $4,
             sort_order = $5, updated_at = NOW()
         WHERE id = $6`,
        [
          data.title,
          data.description,
          data.price_cents,
          data.active,
          data.sort_order,
          data.id,
        ],
      );
    } else {
      await getPool().query(
        `INSERT INTO wedding_gifts (title, description, price_cents, active, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [data.title, data.description, data.price_cents, data.active, data.sort_order],
      );
    }

    return { saved: true };
  });

export const deleteAdminGift = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const id = input && typeof input === "object" ? Number((input as { id?: unknown }).id) : 0;
    if (!Number.isInteger(id) || id <= 0) throw new Error("Presente inválido.");
    return { id };
  })
  .handler(async ({ data }) => {
    requireAdmin();
    await getPool().query("DELETE FROM wedding_gifts WHERE id = $1", [data.id]);
    return { deleted: true };
  });