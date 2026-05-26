import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";

const items = [
  {
    q: "Qual o dress code?",
    a: "Black tie. Sugerimos tons sóbrios e atemporais — preto, off-white, champagne, nude e azul-marinho. Nada de branco para as convidadas, por favor.",
  },
  {
    q: "Posso levar crianças?",
    a: "Por opção dos noivos, a celebração será exclusiva para adultos. Caso necessite de baby-sitter no hotel, podemos indicar profissionais de confiança.",
  },
  {
    q: "Haverá estacionamento?",
    a: "Sim. Disponibilizaremos serviço de valet gratuito para todos os convidados, com manobristas exclusivos durante toda a noite.",
  },
  {
    q: "Quais os horários?",
    a: "Cerimônia às 16h30, recepção a partir das 19h00 e after party a partir da meia-noite. Sugerimos chegar 30 minutos antes da cerimônia.",
  },
  {
    q: "Posso levar um acompanhante?",
    a: "Cada convite especifica o número de acompanhantes. Por favor, indique o total no formulário de RSVP até 30 de outubro de 2026.",
  },
  {
    q: "Sugestões de hospedagem?",
    a: "Reservamos tarifas especiais nos hotéis Bristol Exceler Plaza, Mato Grosso Palace e Deville Prime. Mencione o casamento Silvana & Joel na reserva.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Perguntas Frequentes</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Tudo o que você <em className="italic">precisa saber</em>
            </h2>
          </div>
        </Reveal>

        <div className="mt-16 divide-y divide-border border-y border-border">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={it.q} delay={i * 0.04}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-start justify-between gap-6 py-7 text-left"
                >
                  <span className="font-serif text-xl sm:text-2xl text-foreground/90 transition-colors group-hover:text-foreground">
                    {it.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-1 text-primary"
                  >
                    <Plus className="h-5 w-5" strokeWidth={1.2} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pr-12 text-muted-foreground leading-relaxed text-balance">
                        {it.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}