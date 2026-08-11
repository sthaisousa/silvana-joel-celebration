import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionLabel } from "./Reveal";
import { Check } from "lucide-react";

export function Rsvp() {
  const [sent, setSent] = useState(false);
  const [attending, setAttending] = useState<"sim" | "nao">("sim");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="rsvp" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>RSVP</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Sua presença <em className="italic">é o nosso presente</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-balance">
              Por favor, confirme sua presença até 30 de outubro de 2026.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mt-16 bg-background p-8 sm:p-14 shadow-elegant border border-border">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6 }}
                  onSubmit={onSubmit}
                  className="space-y-8"
                >
                  <Field label="Nome completo">
                    <input
                      required
                      type="text"
                      placeholder="Como você quer ser anunciado"
                      className="input-luxe"
                    />
                  </Field>

                  <div>
                    <label className="text-[10px] tracking-luxe uppercase text-muted-foreground">
                      Confirmar presença
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(["sim", "nao"] as const).map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => setAttending(v)}
                          className={`border py-4 text-[11px] tracking-luxe uppercase transition-all duration-500 ${
                            attending === v
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-foreground/70 hover:border-foreground/50"
                          }`}
                        >
                          {v === "sim" ? "Sim, estarei lá" : "Não poderei ir"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Uma mensagem aos noivos">
                    <textarea
                      rows={4}
                      placeholder="Deixe seu carinho em palavras"
                      className="input-luxe resize-none"
                    />
                  </Field>

                  <button
                    type="submit"
                    className="group w-full sm:w-auto inline-flex items-center justify-center bg-gradient-gold text-background px-12 py-4 text-[11px] tracking-luxe uppercase transition-all duration-700 hover:shadow-elegant"
                  >
                    Confirmar Presença
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center py-10 sm:py-16"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold text-background">
                    <Check className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-8 font-serif text-3xl sm:text-5xl text-balance">
                    Obrigado, do fundo do coração.
                  </h3>
                  <span className="mt-6 divider-gold" />
                  <p className="mt-6 max-w-md text-muted-foreground text-balance">
                    Sua confirmação foi recebida. Mal podemos esperar para celebrar este dia ao seu lado.
                  </p>
                  <p className="mt-10 font-serif italic text-foreground/80">
                    — Silvana &amp; Joel
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      <style>{`
        .input-luxe {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid var(--color-border);
          padding: 0.85rem 0;
          font-family: var(--font-serif);
          font-size: 1.05rem;
          color: var(--color-foreground);
          transition: border-color .5s ease;
          outline: none;
        }
        .input-luxe::placeholder { color: color-mix(in oklab, var(--color-foreground) 35%, transparent); font-style: italic; }
        .input-luxe:focus { border-color: var(--color-primary); }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}