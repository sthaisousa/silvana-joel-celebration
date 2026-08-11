import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#inicio", label: "Início" },
  { href: "#historia", label: "Nossa História" },
  { href: "#evento", label: "Evento" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#galeria", label: "Galeria" },
  { href: "#presentes", label: "Presentes" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "glass border-b border-border/40 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
        <a
          href="#inicio"
          className={`text-2xl tracking-refined transition-colors ${
            scrolled ? "text-foreground" : "text-background"
          }`}
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          S <span className="text-gradient-gold">&amp;</span> J
        </a>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[11px] uppercase tracking-refined transition-colors duration-500 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-current after:transition-all hover:after:w-full ${
                scrolled
                  ? "text-foreground/80 hover:text-foreground"
                  : "text-background/85 hover:text-background"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          className={`lg:hidden p-2 ${scrolled ? "text-foreground" : "text-background"}`}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-serif text-xl">
                S <span className="text-gradient-gold">&amp;</span> J
              </span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col items-center justify-center gap-7 pt-16">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6 }}
                  className="font-serif text-3xl text-foreground/90 hover:text-gradient-gold"
                >
                  {l.label}
                </motion.a>
              ))}
              <span className="divider-gold mt-6" />
              <p className="font-serif italic text-muted-foreground">12 . 12 . 2026</p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}