import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-gradient-soft pointer-events-none" />
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-28">
        <div className="flex flex-col gap-7 animate-fade-up">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-foreground/80 border border-border">
            <Sparkles className="h-4 w-4 text-primary" />
            Punto de venta con IA integrada
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
            El <span className="text-primary">punto de venta</span> que tu negocio necesita.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Vento integra POS intuitivo, inventario inteligente, cocina y envíos en una sola plataforma —
            con un asistente de IA que responde tus preguntas al instante. Para restaurantes, cafés,
            bares, tiendas y más.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link href="/register">
              <Button variant="default" size="lg" className="rounded-full">
                Empezar gratis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="rounded-full">
                Iniciar sesión
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["bg-primary", "bg-accent", "bg-primary/70"].map((c, i) => (
                <div key={i} className={`sm:h-8 sm:w-8 h-10 w-10 rounded-full border-2 border-background ${c}`} />
              ))}
            </div>
            <span className="sm:text-base text-sm font-medium ">+1,200 negocios ya operan con Vento</span>
          </div>
        </div>

        <div className="relative animate-fade-up">
          <div className="absolute -inset-6 bg-gradient-warm opacity-20 blur-3xl rounded-full" />
          <div className="relative rounded-3xl overflow-hidden shadow-warm border border-border/50 bg-card">
            <img
              src="/assets/hero-vento.jpg"
              alt="Vento POS funcionando en una taquería"
              width={1280}
              height={960}
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Floating ticket card */}
          <div className="absolute -bottom-6 -left-6 hidden md:block bg-card rounded-2xl shadow-soft p-5 w-64 border border-border animate-float">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">ORDEN #1023</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">Mesa 4</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span>3× Al Pastor</span><span className="font-semibold">$13.50</span></div>
              <div className="flex justify-between"><span>1× Horchata</span><span className="font-semibold">$3.75</span></div>
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span><span className="text-primary">$17.25</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;