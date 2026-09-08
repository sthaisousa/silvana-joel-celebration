import { Camera, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-gold opacity-80" />
      <div className="mx-auto max-w-5xl px-6 lg:px-12 py-24 text-center">
        <span className="text-[10px] tracking-luxe uppercase text-background/70">
          12 . 12 . 2026 · Campo Grande, MS
        </span>
        <p className="mt-8 mx-auto max-w-2xl font-serif italic text-2xl sm:text-3xl text-balance text-background/95">
          “E que o amor que hoje nos une seja, para sempre, a luz mais bonita das nossas vidas.”
        </p>
        <span className="mt-10 inline-block divider-gold" />
        <h3 className="mt-8 text-4xl sm:text-5xl" style={{ fontFamily: "'Great Vibes', cursive" }}>
          Silvana <span className="text-gradient-gold">&amp;</span> Joel
        </h3>
        <p className="mt-3 text-[11px] tracking-luxe uppercase text-background/60">Com amor</p>

        <div className="mt-12 flex items-center justify-center gap-6">
          {[Camera, Mail].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-background/30 text-background/80 transition-all duration-500 hover:border-background hover:text-background hover:bg-background/10"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <div className="mt-16 text-[10px] tracking-luxe uppercase text-background/50">
          Feito com carinho para os nossos convidados
        </div>
      </div>
      <a
        href="/admin"
        aria-label="Acessar área administrativa"
        title="Área reservada"
        className="absolute bottom-4 right-4 text-[11px] text-background/10 transition-colors duration-500 hover:text-background/35 focus-visible:text-background/50 focus-visible:outline-none"
      >
        🤍
      </a>
    </footer>
  );
}