/* @refresh skip */
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Reveal, SectionLabel } from "./Reveal";
import { createGiftCheckout } from "@/fns/checkout";
import { getPublicGifts } from "@/fns/admin";

export const gifts = [
  {
    "title": "Liquidificador novo",
    "description": "Para facilitar o preparo das receitas do dia a dia e deixar a nova casa ainda mais prática.",
    "price": "R$ 187,00"
  },
  {
    "title": "Kit de malas para a lua de mel",
    "description": "Para acompanhar Silvana & Joel pela Itália, por Portugal e pelas próximas viagens que ainda farão juntos.",
    "price": "R$ 947,00"
  },
  {
    "title": "Passeio de gôndola em Veneza",
    "description": "Para viver juntos um dos momentos mais românticos e inesquecíveis da viagem pela Itália.",
    "price": "R$ 1.287,00"
  },
  {
    "title": "Cesto de roupa para o novo lar",
    "description": "Para ajudar a manter a casa organizada e tornar a rotina do casal mais prática.",
    "price": "R$ 319,00"
  },
  {
    "title": "Jogo de talheres",
    "description": "Para compor a mesa do novo lar e acompanhar as refeições e celebrações do casal.",
    "price": "R$ 526,00"
  },
  {
    "title": "Passeio de barco pela costa de Amalfi",
    "description": "Para conhecer pelo mar uma das paisagens mais bonitas da Itália e viver um dia especial a dois.",
    "price": "R$ 2.147,00"
  },
  {
    "title": "Jantar em Roma",
    "description": "Para celebrar o casamento com uma noite especial em uma das cidades mais marcantes da viagem.",
    "price": "R$ 891,00"
  },
  {
    "title": "Porta-retratos para registrar nossa história",
    "description": "Para guardar na nova casa as fotografias dos momentos especiais que Silvana & Joel viverão juntos.",
    "price": "R$ 224,00"
  },
  {
    "title": "Cafeteira",
    "description": "Para começar as manhãs juntos com café fresco e criar novos rituais na vida a dois.",
    "price": "R$ 674,00"
  },
  {
    "title": "Visita aos Museus do Vaticano",
    "description": "Para conhecer algumas das obras mais importantes da história da arte durante a passagem por Roma.",
    "price": "R$ 1.463,00"
  },
  {
    "title": "Uma noite de hotel em Portugal",
    "description": "Para proporcionar ao casal uma noite confortável e especial durante a lua de mel.",
    "price": "R$ 1.873,00"
  },
  {
    "title": "Kit de organização para armários",
    "description": "Para começar a vida a dois com os espaços organizados e a casa mais funcional.",
    "price": "R$ 348,00"
  },
  {
    "title": "Jogo de cama",
    "description": "Para proporcionar conforto e aconchego ao quarto do novo casal.",
    "price": "R$ 739,00"
  },
  {
    "title": "Experiência de culinária italiana para o casal",
    "description": "Para aprender juntos alguns sabores tradicionais da Itália e transformar a experiência em uma lembrança duradoura.",
    "price": "R$ 1.684,00"
  },
  {
    "title": "Passeio pela Toscana",
    "description": "Para conhecer as paisagens, cidades e encantos de uma das regiões mais famosas da Itália.",
    "price": "R$ 2.174,00"
  },
  {
    "title": "Tábua de frios para nossos encontros",
    "description": "Para as noites em casa, receber amigos e transformar momentos simples em pequenas celebrações.",
    "price": "R$ 263,00"
  },
  {
    "title": "Jogo de panelas",
    "description": "Para equipar a nova cozinha e acompanhar o casal nas receitas que farão juntos.",
    "price": "R$ 1.187,00"
  },
  {
    "title": "Cruzeiro pelo Rio Douro",
    "description": "Para contemplar as paisagens portuguesas de uma perspectiva diferente e viver um momento tranquilo a dois.",
    "price": "R$ 1.276,00"
  },
  {
    "title": "Pastéis de Belém em Lisboa",
    "description": "Para experimentar uma das tradições gastronômicas mais conhecidas de Portugal durante a lua de mel.",
    "price": "R$ 318,00"
  },
  {
    "title": "Aspirador de pó vertical para a casa",
    "description": "Para facilitar a limpeza do novo lar e deixar mais tempo livre para aproveitarem juntos.",
    "price": "R$ 748,00"
  },
  {
    "title": "Kit de toalhas",
    "description": "Para trazer mais conforto e praticidade ao banheiro da nova casa.",
    "price": "R$ 428,00"
  },
  {
    "title": "Experiência gastronômica em uma vinícola portuguesa",
    "description": "Para conhecer a tradição dos vinhos portugueses e desfrutar de uma experiência especial durante a viagem.",
    "price": "R$ 3.284,00"
  },
  {
    "title": "Passeio por Lisboa",
    "description": "Para explorar juntos os principais encantos, ruas e paisagens da capital portuguesa.",
    "price": "R$ 1.436,00"
  },
  {
    "title": "Espelho decorativo para o quarto",
    "description": "Para deixar o ambiente mais elegante e dar um toque especial à decoração da nova casa.",
    "price": "R$ 528,00"
  },
  {
    "title": "Aparelho de jantar",
    "description": "Para compor a mesa do casal e tornar as refeições em casa ainda mais especiais.",
    "price": "R$ 1.726,00"
  },
  {
    "title": "Passeio de trem pela Itália",
    "description": "Para atravessar paisagens italianas de trem e transformar também o deslocamento em parte da experiência da viagem.",
    "price": "R$ 1.327,00"
  },
  {
    "title": "Kit de taças para receber os amigos",
    "description": "Para brindar as novas histórias do casal e celebrar aniversários, encontros e conquistas na nova casa.",
    "price": "R$ 287,00"
  },
  {
    "title": "Uma parte das passagens para a Itália e Portugal",
    "description": "Para ajudar Silvana & Joel a realizarem a tão sonhada viagem de lua de mel pela Europa.",
    "price": "R$ 3.847,00"
  },
  {
    "title": "Luminária para o quarto do casal",
    "description": "Para criar uma iluminação aconchegante e tornar as noites no novo lar ainda mais agradáveis.",
    "price": "R$ 574,00"
  },
  {
    "title": "Nossa lua de mel na Europa",
    "description": "Para contribuir diretamente com a realização da viagem que marcará o início da vida de casados.",
    "price": "R$ 6.947,00"
  },
  {
    "title": "Jogo de taças de sobremesa",
    "description": "Para servir doces e sobremesas nas ocasiões especiais e deixar a mesa ainda mais bonita.",
    "price": "R$ 397,00"
  },
  {
    "title": "Sessão de fotos do casal na Europa",
    "description": "Para registrar Silvana & Joel nos primeiros dias de casados e guardar essas lembranças para sempre.",
    "price": "R$ 1.873,00"
  },
  {
    "title": "Kit de potes herméticos para a despensa",
    "description": "Para organizar alimentos, otimizar os espaços e deixar a cozinha mais prática no dia a dia.",
    "price": "R$ 463,00"
  },
  {
    "title": "Visita a Pompeia e ao Vesúvio",
    "description": "Para conhecer um dos sítios arqueológicos mais impressionantes da Itália e sua paisagem vulcânica.",
    "price": "R$ 2.386,00"
  },
  {
    "title": "Tapete para a sala",
    "description": "Para deixar o ambiente mais confortável, acolhedor e com a personalidade do novo casal.",
    "price": "R$ 863,00"
  },
  {
    "title": "Jantar especial em Lisboa à luz de velas",
    "description": "Para viver uma noite romântica durante a viagem e celebrar o início da vida a dois.",
    "price": "R$ 1.397,00"
  },
  {
    "title": "Máquina de waffle para nossos cafés de fim de semana",
    "description": "Para transformar as manhãs tranquilas em casa em momentos especiais do casal.",
    "price": "R$ 689,00"
  },
  {
    "title": "Fim de semana romântico em uma cidade histórica",
    "description": "Para que Silvana & Joel possam desacelerar, conhecer um novo lugar e simplesmente aproveitar a companhia um do outro.",
    "price": "R$ 2.274,00"
  },
  {
    "title": "Jogo de travessas para servir",
    "description": "Para receber família e amigos e tornar os almoços e jantares na nova casa ainda mais especiais.",
    "price": "R$ 917,00"
  },
  {
    "title": "Seguro viagem completo para o casal",
    "description": "Para proporcionar mais tranquilidade e segurança durante a lua de mel pela Europa.",
    "price": "R$ 2.748,00"
  },
  {
    "title": "Kit para churrasco e encontros na varanda",
    "description": "Para os futuros almoços de domingo, encontros com amigos e momentos descontraídos no novo lar.",
    "price": "R$ 596,00"
  },
  {
    "title": "Sofá novo para a casa",
    "description": "Para criar um espaço confortável para descansar, conversar, receber amigos e aproveitar as noites juntos.",
    "price": "R$ 3.697,00"
  },
  {
    "title": "Experiência de degustação de vinhos em Portugal",
    "description": "Para descobrir novos sabores e conhecer um pouco mais da tradição vinícola portuguesa.",
    "price": "R$ 1.184,00"
  },
  {
    "title": "Colchão premium para o quarto do casal",
    "description": "Para investir no conforto das noites de Silvana & Joel e tornar o quarto um verdadeiro espaço de descanso.",
    "price": "R$ 4.687,00"
  },
  {
    "title": "Jantar e experiência exclusiva de aniversário de casamento",
    "description": "Para guardar uma experiência especial para o primeiro aniversário e celebrar novamente o início dessa nova fase.",
    "price": "R$ 5.473,00"
  }
];

export function Gifts() {
  const [payingGift, setPayingGift] = useState<number | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const { data: storedGifts, isLoading } = useQuery({
    queryKey: ["wedding_gifts"],
    queryFn: () => getPublicGifts(),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("presente");
    if (result === "sucesso") {
      setCheckoutMessage("Pagamento concluído. Muito obrigado pelo presente!");
    } else if (result === "cancelado") {
      setCheckoutMessage("Pagamento cancelado. Você pode tentar novamente quando quiser.");
    }
  }, []);

  async function handleGiftCheckout(id: number) {
    setCheckoutMessage("");
    setPayingGift(id);

    try {
      const { url } = await createGiftCheckout({ data: { giftId: id } });
      window.location.assign(url);
    } catch {
      setCheckoutMessage("Não foi possível abrir o pagamento. Tente novamente em instantes.");
      setPayingGift(null);
    }
  }

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

        <Reveal delay={0.1}>
          <div className="mt-16 rounded-sm border border-border bg-secondary/10 p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span>Escolha um presente</span>
              <span>{storedGifts?.length ?? 0} opções</span>
            </div>
            {checkoutMessage && (
              <p
                role="status"
                className="mb-4 border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground"
              >
                {checkoutMessage}
              </p>
            )}
            <div className="gift-scroll max-h-[42rem] overflow-y-auto overscroll-contain pr-2">
              {isLoading && (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Carregando presentes…
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {storedGifts?.map((gift) => (
                  <article
                    key={gift.title}
                    className="group flex min-h-44 flex-col justify-between border border-border bg-background p-5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-elegant"
                  >
                    <div>
                      <h3
                        className="text-sm font-medium leading-snug text-foreground"
                        style={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {gift.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {gift.description}
                      </p>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-border/70 pt-4">
                      <p className="font-serif text-xl text-gradient-gold">
                        {(gift.price_cents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                       <button
                         type="button"
                         disabled={payingGift !== null}
                         onClick={() => handleGiftCheckout(gift.id)}
                         className="text-[10px] tracking-luxe uppercase text-foreground/60 transition-colors hover:text-foreground disabled:cursor-wait disabled:opacity-50"
                       >
                         {payingGift === gift.id ? "Abrindo pagamento…" : "Presentear"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        .gift-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--color-primary) transparent;
        }
        .gift-scroll::-webkit-scrollbar { width: 6px; }
        .gift-scroll::-webkit-scrollbar-track { background: transparent; }
        .gift-scroll::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 999px;
        }
      `}</style>
    </section>
  );
}
