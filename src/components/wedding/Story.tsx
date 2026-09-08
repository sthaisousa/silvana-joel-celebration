import { Reveal, SectionLabel } from "./Reveal";
import s1 from "@/assets/story-new-1.png";
import s2 from "@/assets/story-new-2.png";
import s3 from "@/assets/story-new-3.png";
import s4 from "@/assets/story-new-4.png";
import s5 from "@/assets/story-new-5.png";

const chapters = [
  {
    year: "2023",
    title: "Onde tudo começou",
    text: "Nos conhecemos na Igreja da Cidade, em uma manhã de domingo de 2023. Assim que me viu, ele comentou com um amigo que eu fazia exatamente o tipo dele — e ficou torcendo para que eu voltasse. Mal sabíamos que aquele primeiro olhar seria o começo de tudo.",
    img: s2,
  },
  {
    year: "Pouco depois",
    title: "A aproximação",
    text: "E eu voltei. A cada culto, ele encontrava um jeito de se aproximar e puxar conversa, sempre com aquele jeitinho de quem não queria nada. Aos poucos, entre encontros, sorrisos e conversas, fomos percebendo que havia algo especial acontecendo.",
    img: s1,
  },
  {
    year: "O primeiro encontro",
    title: "Um ingresso que “sobrou”",
    text: "Nosso primeiro encontro foi em um escape room, acompanhados de mais dois casais. Aparentemente, tinha “sobrado” um ingresso — uma coincidência muito bem planejada que acabou se tornando o início oficial da nossa aventura a dois.",
    img: s3,
  },
  {
    year: "O namoro",
    title: "O primeiro sim",
    text: "Então veio o pedido de namoro: flores, carinho, um prato preparado especialmente para a ocasião e a pergunta que mudaria a nossa história. Foi ali que dissemos o primeiro de muitos “sins” que ainda viveríamos juntos.",
    img: s4,
  },
  {
    year: "2 anos depois",
    title: "Para sempre",
    text: "No dia em que completamos dois anos de namoro, viajamos para Guarapari. Ele preparou um cenário com pétalas de rosas e, ao som de “A Thousand Years”, começou a contar todas as razões que o faziam me escolher todos os dias. Em meio à emoção, veio o pedido de casamento — e mais um lindo sim para a nossa história.",
    img: s5,
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