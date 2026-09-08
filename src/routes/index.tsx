import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/wedding/Nav";
import { Hero } from "@/components/wedding/Hero";
import { Story } from "@/components/wedding/Story";
import { Event } from "@/components/wedding/Event";
import { Rsvp } from "@/components/wedding/Rsvp";
import { Gallery } from "@/components/wedding/Gallery";
import { Gifts } from "@/components/wedding/Gifts";
import { Travel } from "@/components/wedding/Travel";
import { Mural } from "@/components/wedding/Mural";
import { Faq } from "@/components/wedding/Faq";
import { Footer } from "@/components/wedding/Footer";

const SHOW_GALLERY = false;

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Story />
      <Event />
      <Rsvp />
      <Mural />
      {SHOW_GALLERY && <Gallery />}
      <Gifts />
      <Travel />
      <Faq />
      <Footer />
    </main>
  );
}
