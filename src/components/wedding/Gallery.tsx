import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const photos = [
  { src: g1, span: "row-span-2", alt: "Arco floral da cerimônia" },
  { src: g2, span: "", alt: "Mesa de recepção" },
  { src: g3, span: "", alt: "Detalhe da aliança" },
  { src: g4, span: "row-span-2", alt: "Primeira dança" },
  { src: g5, span: "", alt: "Vestido da noiva" },
  { src: g6, span: "", alt: "Jantar ao pôr do sol" },
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="galeria" className="relative bg-secondary/40 py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <SectionLabel>Galeria</SectionLabel>
            <h2 className="mt-6 font-serif text-4xl sm:text-6xl text-balance">
              Momentos que <em className="italic">guardamos</em>
            </h2>
          </div>
        </Reveal>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] sm:auto-rows-[240px] gap-3 sm:gap-5">
          {photos.map((p, i) => (
            <Reveal key={i} delay={i * 0.05} className={p.span}>
              <button
                onClick={() => setOpen(i)}
                className="group relative h-full w-full overflow-hidden shadow-soft"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-all duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 bg-foreground/0 transition-colors duration-700 group-hover:bg-foreground/15" />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/85 backdrop-blur-sm p-6"
            onClick={() => setOpen(null)}
          >
            <button
              className="absolute top-6 right-6 text-background"
              onClick={() => setOpen(null)}
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              key={open}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              src={photos[open].src}
              alt={photos[open].alt}
              className="max-h-[85vh] max-w-[92vw] object-contain shadow-elegant"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}