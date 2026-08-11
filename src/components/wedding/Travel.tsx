import { Reveal, SectionLabel } from "./Reveal";
import { Hotel, Plane, Compass } from "lucide-react";

const items = [
  {
    icon: Hotel,
    title: "Hospedagem",
    items: [
      "Ibis Budget Campo Grande · 10 minutos",
      "Indaiá Park Hotel · 15 minutos",
      "Cerrado Comfort Hotel · 14 minutos",
      "Bristol Exceler Plaza Hotel · 14 minutos",
    ],
  },
  {
    icon: Plane,
    title: "Aeroporto",
    items: [
      "Aeroporto Internacional de Campo Grande (CGR)",
      "20 minutos do local do evento",
    ],
  },
  {
    icon: Compass,
    title: "Dicas da cidade",
    items: [
      "Bioparque Pantanal · maior aquário de água doce",
      "Feira Central · gastronomia local",
      "Parque das Nações Indígenas · manhãs serenas",
    ],
  },
];

export function Travel() {
  return (
    <section id="viagem" className="relative py-28 sm:py-40 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Hospedagem &amp; Viagem</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Para quem vem de <em className="italic">longe</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-balance">
              Selecionamos cada detalhe para que sua estadia seja tão especial quanto o nosso dia.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-px bg-border md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.08}>
              <div className="h-full bg-background p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <it.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-serif text-2xl">{it.title}</h3>
                <span className="mt-4 block divider-gold" />
                <ul className="mt-6 space-y-3 text-muted-foreground">
                  {it.items.map((x) => (
                    <li key={x} className="text-sm leading-relaxed">{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}