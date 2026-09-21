import { useEffect, useState } from "react";

import { confirmGiftPayment } from "@/fns/purchases";
import { parseReturnParams } from "@/lib/infinitepay";

type Outcome = "sucesso" | "pendente";

const MESSAGES: Record<Outcome, { title: string; body: string }> = {
  sucesso: {
    title: "Presente recebido!",
    body: "Obrigado por fazer parte deste momento. Silvana & Joel agradecem de coração.",
  },
  pendente: {
    title: "Pagamento em processamento",
    body: "Assim que a confirmação chegar, o presente entra na nossa lista. Obrigado!",
  },
};

/**
 * A InfinitePay devolve o convidado para a raiz do site com order_nsu,
 * transaction_nsu e slug na URL — ela so redireciona depois do pagamento
 * concluido. A referencia e reconsultada no servidor antes de valer, e a URL
 * e limpa para um F5 nao reprocessar nem repetir a mensagem.
 */
export function GiftPaymentReturn() {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    const ref = parseReturnParams(new URLSearchParams(window.location.search));
    if (!ref) return;

    setOutcome("sucesso");
    window.history.replaceState(null, "", `${window.location.pathname}#presentes`);

    confirmGiftPayment({ data: ref })
      .then((result) => {
        if (result.status !== "paid") setOutcome("pendente");
      })
      .catch((error) => {
        // O pagamento pode ter dado certo mesmo assim; o webhook confirma
        // depois. Nao alarmar o convidado.
        console.error("Falha ao confirmar pagamento no retorno:", error);
      });
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
