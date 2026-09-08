import { Church, Wine, Sparkles, MapPin } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";

const ceremony = {
  icon: Church,
  title: "Cerimônia",
  date: "12 de Dezembro, 2026",
  time: "18h20",
  place: "Ernesto Café Bar · R. Manoel Inácio de Souza, 507 A - Centro, Campo Grande - MS",
  map: "https://maps.google.com/?q=R.+Manoel+Inácio+de+Souza,+507+A+Campo+Grande+MS",
  embed:
    "https://www.google.com/maps?q=R.+Manoel+Inácio+de+Souza,+507+A+Campo+Grande+MS&output=embed",
};

const secondaryEvents = [
  {
    icon: Wine,
    title: "Recepção",
    date: "12 de Dezembro, 2026",
    time: "18h00",
    place: "Ernesto Café Bar · Campo Grande, MS",
    map: "https://maps.google.com/?q=R.+Manoel+Inácio+de+Souza,+507+A+Campo+Grande+MS",
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
              Cada momento foi pensado com carinho para que esta celebração ao seu lado seja inesquecível.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <article className="mt-20 relative overflow-hidden bg-background shadow-elegant border border-primary/20">
            <span className="absolute left-0 top-0 h-1 w-full bg-gradient-gold" />
            <div className="flex flex-col items-center p-10 sm:p-16 text-center">
              <span className="text-[10px] tracking-luxe uppercase text-primary">
                Momento principal
              </span>
              <span className="mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-background shadow-soft">
                <ceremony.icon className="h-8 w-8" />
              </span>
              <h3 className="mt-8 font-serif text-4xl sm:text-6xl italic text-gradient-gold">
                {ceremony.title}
              </h3>
              <span className="mt-6 divider-gold" />
              <p className="mt-6 text-sm tracking-refined uppercase text-muted-foreground">
                {ceremony.date}
              </p>
              <p className="mt-2 font-serif text-6xl sm:text-7xl">{ceremony.time}</p>
              <p className="mt-6 text-base text-foreground/80 text-balance max-w-md">
                {ceremony.place}
              </p>
              <a
                href={ceremony.map}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 border-b border-foreground/30 pb-1 text-[11px] tracking-luxe uppercase transition-all duration-500 hover:border-primary hover:text-primary"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Ver no mapa</span>
              </a>
            </div>
            <div className="relative h-72 sm:h-96 w-full border-t border-border">
              <iframe
                title="Mapa da Cerimônia"
                src={ceremony.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </article>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-xl gap-6">
          {secondaryEvents.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.1}>
              <article className="group flex h-full items-center gap-5 bg-background/70 p-6 sm:p-7 shadow-soft border border-border transition-all duration-700 hover:shadow-elegant hover:-translate-y-0.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <e.icon className="h-5 w-5" />
                </span>
                <div className="flex-1 text-left">
                  <p className="text-[10px] tracking-luxe uppercase text-primary">{e.title}</p>
                  <p className="mt-1 font-serif text-2xl">{e.time}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{e.place}</p>
                </div>
                <a
                  href={e.map}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-foreground/60 transition-colors hover:text-primary"
                  aria-label={`Ver mapa de ${e.title}`}
                >
                  <MapPin className="h-4 w-4" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-20 grid gap-8 md:grid-cols-2 text-center">
            {[
              {
                t: "Dress Code",
                d: (
                  <>
                    <a
                      href="https://www.instagram.com/reel/DQee7o9Dkqk/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
                    >
                      Casual Chic
                    </a>
                    {" & "}
                    <a
                      href="https://www.instagram.com/reel/DN8_14EEb7j/?igsi=MTVqaDJoaG96aGJ0cw=="
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
                    >
                      Esporte Fino
                    </a>
                  </>
                ),
              },
              { t: "Chegada", d: "Cerimônia inicia às 18h20. Sugerimos chegar às 18h00." },
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