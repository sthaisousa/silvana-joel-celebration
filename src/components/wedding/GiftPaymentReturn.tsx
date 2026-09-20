import { useEffect, useState } from "react";

import { confirmGiftPayment } from "@/fns/purchases";

type Outcome = "sucesso" | "pendente" | "falhou";

const MESSAGES: Record<Outcome, { title: string; body: string }> = {
  sucesso: {
    title: "Presente recebido!",
    body: "Obrigado por fazer parte deste momento. Silvana & Joel agradecem de coração.",
  },
  pendente: {
    title: "Pagamento em processamento",
    body: "Assim que o Mercado Pago confirmar, o presente entra na nossa lista. Obrigado!",
  },
  falhou: {
    title: "O pagamento não foi concluído",
    body: "Nada foi cobrado. Se quiser tentar de novo, é só escolher o presente outra vez.",
  },
};

/**
 * O convidado volta do Mercado Pago em /?presente=<estado>&ref=<referencia>.
 * Aqui a referencia e reconsultada no servidor para promover a compra a `paid`,
 * e a URL e limpa para um F5 nao reprocessar nem repetir a mensagem.
 */
export function GiftPaymentReturn() {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("presente") as Outcome | null;
    if (!state || !(state in MESSAGES)) return;

    const reference = params.get("ref");
    setOutcome(state);

    window.history.replaceState(null, "", `${window.location.pathname}#presentes`);

    if (state === "sucesso" && reference) {
      confirmGiftPayment({ data: { externalReference: reference } })
        .then((result) => {
          if (result.status !== "paid") setOutcome("pendente");
        })
        .catch((error) => {
          // O pagamento pode ter dado certo mesmo assim; o botao de sincronizar
          // no /admin recupera depois. Nao alarmar o convidado.
          console.error("Falha ao confirmar pagamento no retorno:", error);
        });
    }
  }, []);

  if (!outcome) return null;

  const message = MESSAGES[outcome];

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4">
      <div
        role="status"
        className="w-full max-w-md border border-border bg-background p-5 text-center shadow-2xl"
      >
        <p className="text-[10px] tracking-luxe uppercase text-primary">{message.title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{message.body}</p>
        <button
          type="button"
          onClick={() => setOutcome(null)}
          className="mt-4 text-[10px] tracking-luxe uppercase text-foreground/70 underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
