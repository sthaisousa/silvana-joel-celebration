import { motion } from "framer-motion";
import hero from "@/assets/hero.jpg";
import { Countdown } from "./Countdown";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[100svh] w-full overflow-hidden py-24">
      <motion.img
        src={hero}
        alt="Silvana e Joel em um pomar ao pôr do sol"
        width={1920}
        height={1280}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10 flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center text-center text-background px-[30px]">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="text-[11px] tracking-luxe uppercase text-background/85"
        >
          Save the date · 12 . 12 . 2026
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-[clamp(3.5rem,12vw,9rem)] leading-[0.95] text-balance"
          style={{ fontFamily: "'Brittany Signature', cursive" }}
        >
          Silvana
          <span className="block italic font-light text-background/95 text-[clamp(2rem,7vw,5rem)] my-1 sm:my-2">
            <span className="text-gradient-gold">&amp;</span>
          </span>
          Joel
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.2 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <span className="divider-gold" />
          <p className="text-xs sm:text-sm tracking-refined uppercase text-background/90">
            12 de Dezembro de 2026 · Campo Grande, MS
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 1.2 }}
          className="mt-8 max-w-xl font-serif italic text-lg sm:text-xl text-background/95 text-balance"
        >
          “Celebrando o amor, a eternidade e o início da nossa nova história.”
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
        >
          <a
            href="#rsvp"
            className="group inline-flex items-center justify-center bg-background text-foreground px-9 py-4 text-[11px] tracking-luxe uppercase transition-all duration-500 hover:bg-gradient-gold hover:text-background shadow-soft"
          >
            Confirmar Presença
          </a>
          <a
            href="#evento"
            className="inline-flex items-center justify-center border border-background/60 text-background px-9 py-4 text-[11px] tracking-luxe uppercase transition-all duration-500 hover:bg-background hover:text-foreground"
          >
            Ver Detalhes
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 1.2 }}
          className="mt-14 w-full max-w-2xl"
        >
          <Countdown light />
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.a
        href="#historia"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-background/80"
        aria-label="Rolar para baixo"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] tracking-luxe uppercase">Scroll</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="block h-10 w-px bg-background/60"
          />
        </div>
      </motion.a>
    </section>
  );
}