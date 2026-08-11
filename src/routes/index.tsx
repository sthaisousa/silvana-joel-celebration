import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/wedding/Nav";
import { Hero } from "@/components/wedding/Hero";
import { Event } from "@/components/wedding/Event";
import { Rsvp } from "@/components/wedding/Rsvp";
import { Gallery } from "@/components/wedding/Gallery";
import { Gifts } from "@/components/wedding/Gifts";
import { Travel } from "@/components/wedding/Travel";
import { Faq } from "@/components/wedding/Faq";
import { Footer } from "@/components/wedding/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Event />
      <Rsvp />
      <Gallery />
      <Gifts />
      <Travel />
      <Faq />
      <Footer />
    </main>
  );
}
