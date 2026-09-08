import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionLabel } from "./Reveal";
import { Check, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessages, saveMessage } from "@/fns/messages";

export function Mural() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["wedding_messages"],
    queryFn: () => getMessages(),
    refetchInterval: 30000,
  });

  const mutation = useMutation({
    mutationFn: (payload: { name: string; message: string }) =>
      saveMessage({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding_messages"] });
      setSent(true);
      setName("");
      setMessage("");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    mutation.mutate({ name: name.trim(), message: message.trim() });
  }

  return (
    <section id="mural" className="relative py-28 sm:py-40 bg-secondary/20">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Mural</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Deixe uma <em className="italic">mensagem aos noivos</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-balance">
              Seu carinho ficará guardado para sempre aqui, e vai aquecer nossos corações por toda a vida.
            </p>
          </div>
        </Reveal>

        {/* Form */}
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
                  <MuralField label="Seu nome">
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como você quer ser lembrado"
                      className="input-mural"
                    />
                  </MuralField>
                  <MuralField label="Sua mensagem">
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deixe seu carinho em palavras..."
                      className="input-mural resize-none"
                    />
                  </MuralField>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="group inline-flex items-center justify-center bg-gradient-gold text-background px-12 py-4 text-[11px] tracking-luxe uppercase transition-all duration-700 hover:shadow-elegant disabled:opacity-60"
                    >
                      {mutation.isPending ? "Enviando…" : "Enviar mensagem"}
                    </button>
                  </div>
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
                  <h3 className="mt-8 font-serif text-3xl sm:text-4xl text-balance">
                    Mensagem enviada com amor!
                  </h3>
                  <p className="mt-4 text-muted-foreground">
                    Ela já aparece no mural abaixo.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-8 text-[11px] tracking-luxe uppercase border-b border-foreground/30 pb-1 hover:border-primary hover:text-primary transition-colors"
                  >
                    Enviar outra mensagem
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Messages wall */}
        {messages.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-20">
              <div className="flex items-center gap-4 mb-10">
                <span className="flex-1 h-px bg-border" />
                <span className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted-foreground">
                  <Heart className="h-3 w-3 text-primary" />
                  {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"}
                </span>
                <span className="flex-1 h-px bg-border" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-background border border-border p-7 shadow-soft"
                  >
                    <p className="font-serif italic text-[17px] sm:text-lg text-foreground/90 leading-relaxed text-balance">
                      "{msg.message}"
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="divider-gold flex-1" />
                      <p className="text-[11px] tracking-luxe uppercase text-primary shrink-0">
                        {msg.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <style>{`
        .input-mural {
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
        .input-mural::placeholder { color: color-mix(in oklab, var(--color-foreground) 35%, transparent); font-style: italic; }
        .input-mural:focus { border-color: var(--color-primary); }
      `}</style>
    </section>
  );
}

function MuralField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
