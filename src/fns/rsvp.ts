import { ReplitConnectors } from "@replit/connectors-sdk";
import { createServerFn } from "@tanstack/react-start";

import { getPool } from "../lib/db";

type RsvpInput = {
  name: string;
  attending: "sim" | "nao";
};

const NOTIFICATION_EMAIL = "joel.barbosa.pereira.silva@gmail.com";

export const saveRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): RsvpInput => {
    if (!input || typeof input !== "object") {
      throw new Error("Dados de confirmação inválidos.");
    }

    const { name, attending } = input as Partial<RsvpInput>;
    const normalizedName = name?.trim();

    if (!normalizedName || normalizedName.length > 255) {
      throw new Error("Informe um nome válido.");
    }

    if (attending !== "sim" && attending !== "nao") {
      throw new Error("Informe se poderá comparecer.");
    }

    return { name: normalizedName, attending };
  })
  .handler(async ({ data }) => {
    const pool = getPool();
    const attending = data.attending === "sim";

    await pool.query(
      "INSERT INTO wedding_rsvps (name, attending) VALUES ($1, $2)",
      [data.name, attending],
    );

    let emailSent = false;

    try {
      const connectors = new ReplitConnectors();
      const response = await connectors.proxy("resend", "/emails", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from: "Casamento Silvana & Joel <onboarding@resend.dev>",
          to: [NOTIFICATION_EMAIL],
          subject: `Nova confirmação de presença: ${data.name}`,
          text: [
            "Nova resposta recebida pelo site do casamento.",
            "",
            `Nome: ${data.name}`,
            `Resposta: ${attending ? "Sim, estarei lá" : "Não poderei ir"}`,
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        console.error("Falha ao enviar e-mail de RSVP:", await response.text());
      } else {
        emailSent = true;
      }
    } catch (error) {
      console.error("Falha ao enviar e-mail de RSVP:", error);
    }

    return { saved: true, emailSent };
  });