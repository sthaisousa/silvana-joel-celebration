import { Church, Wine, Sparkles, MapPin } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";

const events = [
  {
    icon: Church,
    title: "Cerimônia",
    date: "12 de Dezembro, 2026",
    time: "16h30",
    place: "Capela San Marco · Campo Grande, MS",
    map: "https://maps.google.com/?q=Campo+Grande+MS",
  },
  {
    icon: Wine,
    title: "Recepção",
    date: "12 de Dezembro, 2026",
    time: "19h00",
    place: "Villa Toscana Eventos · Campo Grande, MS",
    map: "https://maps.google.com/?q=Campo+Grande+MS",
  },
  {
    icon: Sparkles,
    title: "After Party",
    date: "12 de Dezembro, 2026",
    time: "00h00",
    place: "Lounge Privê · Villa Toscana",
    map: "https://maps.google.com/?q=Campo+Grande+MS",
  },
];

export function Event() {
  return (
    <section id="evento" className="relative bg-secondary/40 py-28 sm:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>O Evento</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Uma noite para se <em className="italic">lembrar</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-balance">
              Três momentos pensados com carinho, para que cada hora ao seu lado seja inesquecível.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.1}>
              <article className="group flex h-full flex-col items-center bg-background p-8 sm:p-10 text-center shadow-soft transition-all duration-700 hover:shadow-elegant hover:-translate-y-1">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-background">
                  <e.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-serif text-2xl sm:text-3xl">{e.title}</h3>
                <span className="mt-4 divider-gold" />
                <p className="mt-5 text-sm tracking-refined uppercase text-muted-foreground">
                  {e.date}
                </p>
                <p className="mt-2 font-serif text-3xl">{e.time}</p>
                <p className="mt-4 text-sm text-muted-foreground text-balance">{e.place}</p>
                <a
                  href={e.map}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-[11px] tracking-luxe uppercase transition-all duration-500 hover:border-primary hover:text-primary"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Ver no mapa</span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-20 grid gap-8 md:grid-cols-3 text-center">
            {[
              { t: "Dress Code", d: "Black tie · tons sóbrios e atemporais" },
              { t: "Estacionamento", d: "Valet exclusivo gratuito para convidados" },
              { t: "Chegada", d: "Sugerimos chegar 30 minutos antes da cerimônia" },
            ].map((x) => (
              <div key={x.t} className="border-t border-border pt-6">
                <p className="text-[11px] tracking-luxe uppercase text-primary">{x.t}</p>
                <p className="mt-3 font-serif text-lg text-foreground/90">{x.d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-24 text-center">
            <span className="text-[10px] tracking-luxe uppercase text-muted-foreground">Onde</span>
            <h3 className="mt-4 font-serif text-5xl sm:text-7xl italic text-gradient-gold">
              Campo Grande
            </h3>
            <p className="mt-3 text-sm tracking-refined uppercase text-muted-foreground">
              Mato Grosso do Sul · Brasil
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}