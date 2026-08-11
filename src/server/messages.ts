import { createServerFn } from "@tanstack/react-start";
import { getPool } from "../lib/db";

export type Message = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

export const getMessages = createServerFn({ method: "GET" }).handler(
  async () => {
    const pool = getPool();
    const result = await pool.query<Message>(
      "SELECT id, name, message, created_at FROM wedding_messages ORDER BY created_at DESC"
    );
    return result.rows;
  }
);

export const saveMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { name: string; message: string })
  .handler(async ({ data }) => {
    const pool = getPool();
    await pool.query(
      "INSERT INTO wedding_messages (name, message) VALUES ($1, $2)",
      [data.name, data.message]
    );
    return { ok: true };
  });
