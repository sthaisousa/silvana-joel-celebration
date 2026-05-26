import { Reveal, SectionLabel } from "./Reveal";
import { Plane, Utensils, BedDouble, Sparkles, QrCode } from "lucide-react";

const gifts = [
  { icon: Utensils, title: "Jantar romântico", price: "R$ 350" },
  { icon: Plane, title: "Passeio especial", price: "R$ 700" },
  { icon: BedDouble, title: "Hospedagem", price: "R$ 1.200" },
  { icon: Sparkles, title: "Experiência inesquecível", price: "R$ 1.800" },
];

export function Gifts() {
  return (
    <section id="presentes" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Lista de Presentes</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Nossa <em className="italic">Lua de Mel</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-balance">
              Sua contribuição se transforma em memórias que levaremos por toda a vida.
              Cada gesto será guardado com gratidão.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <div className="bg-secondary/60 p-10 text-center shadow-soft">
              <span className="text-[10px] tracking-luxe uppercase text-primary">Via PIX</span>
              <h3 className="mt-4 font-serif text-3xl">Contribua de onde estiver</h3>
              <div className="mt-8 inline-flex items-center justify-center bg-background p-6 shadow-elegant">
                <div className="grid h-44 w-44 grid-cols-8 grid-rows-8 gap-[3px] p-2 bg-background">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const corners = [0, 1, 6, 7, 8, 15, 48, 49, 54, 55, 56, 63];
                    // Deterministic pseudo-random pattern (stable across SSR/CSR)
                    const filled =
                      corners.includes(i) || ((i * 2654435761) >>> 0) % 100 > 55;
                    return (
                      <span
                        key={i}
                        className="block"
                        style={{ background: filled ? "var(--ink)" : "transparent" }}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <QrCode className="h-4 w-4" /> silvanaejoel@pix.com
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {gifts.map((g) => (
                <article
                  key={g.title}
                  className="group flex items-center gap-5 bg-background border border-border p-6 transition-all duration-700 hover:shadow-elegant hover:-translate-y-0.5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <g.icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <h4 className="font-serif text-xl">{g.title}</h4>
                    <p className="text-[11px] tracking-refined uppercase text-muted-foreground mt-1">
                      Presente simbólico
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg text-gradient-gold">{g.price}</p>
                    <button className="mt-1 text-[10px] tracking-luxe uppercase text-foreground/60 hover:text-foreground transition-colors">
                      Presentear
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}