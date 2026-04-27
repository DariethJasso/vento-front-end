import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="py-24 bg-background">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-warm p-12 md:p-16 text-center shadow-warm">
          <div className="absolute inset-0 bg-gradient-soft opacity-40" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl text-primary-foreground mb-5">
              Lleva tu negocio al siguiente nivel.
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              14 días gratis. Sin tarjeta. Configura tu catálogo en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90">
                  Crear mi cuenta <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;