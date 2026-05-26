import { Reveal, SectionLabel } from "./Reveal";
import s1 from "@/assets/story-1.jpg";
import s2 from "@/assets/story-2.jpg";
import s3 from "@/assets/story-3.jpg";
import s4 from "@/assets/story-4.jpg";

const chapters = [
  {
    year: "2019",
    title: "Como nos conhecemos",
    text: "Em uma tarde silenciosa de outono, nossos caminhos se cruzaram por acaso — um sorriso tímido, uma conversa que não queria terminar, e a certeza de algo raro nascendo entre dois desconhecidos.",
    img: s1,
  },
  {
    year: "2020",
    title: "Primeiro encontro",
    text: "Foi um jantar à luz de velas que se transformou em horas perdidas no tempo. Descobrimos que rir junto era a coisa mais natural do mundo — e que dali em diante, nada faria sentido sem o outro.",
    img: s2,
  },
  {
    year: "2024",
    title: "O pedido",
    text: "Entre oliveiras douradas e o último raio de sol do dia, ele se ajoelhou. As palavras vieram tremidas, mas verdadeiras. E a resposta foi um sim sussurrado, com lágrimas e o coração inteiro.",
    img: s3,
  },
  {
    year: "2026",
    title: "O futuro",
    text: "Sonhamos com uma casa cheia de luz, viagens lentas, manhãs sem pressa e uma vida construída com afeto e cumplicidade. Tudo começa aqui — em Campo Grande, no dia 12 de dezembro.",
    img: s4,
  },
];

export function Story() {
  return (
    <section id="historia" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Nossa História</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Um capítulo escrito a <em className="italic">dois</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground text-balance">
              Pequenos instantes que, juntos, viraram a história mais bonita das nossas vidas.
            </p>
          </div>
        </Reveal>

        <div className="mt-24 space-y-24 sm:space-y-32">
          {chapters.map((c, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={c.year}
                className={`grid items-center gap-10 lg:gap-20 lg:grid-cols-2 ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Reveal>
                  <div className="relative overflow-hidden shadow-elegant">
                    <img
                      src={c.img}
                      alt={c.title}
                      width={1024}
                      height={1280}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04]"
                    />
                    <span className="absolute top-4 left-4 glass px-3 py-1 text-[10px] tracking-luxe uppercase">
                      {c.year}
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.15}>
                  <div className="lg:px-6">
                    <span className="text-[11px] tracking-luxe uppercase text-primary">
                      Capítulo 0{i + 1}
                    </span>
                    <h3 className="mt-4 font-serif text-3xl sm:text-5xl text-balance">{c.title}</h3>
                    <span className="mt-6 block divider-gold" />
                    <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground text-balance">
                      {c.text}
                    </p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}