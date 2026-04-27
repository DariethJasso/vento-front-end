import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mes",
    desc: "Perfecto para empezar tu negocio.",
    features: ["1 punto de venta", "Inventario y tickets", "Reportes básicos", "Soporte por correo"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$899",
    period: "/mes",
    desc: "Para negocios en crecimiento.",
    features: [
      "Puntos de venta ilimitados",
      "Pantalla de cocina y envíos",
      "Asistente IA incluido",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    highlight: true,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-secondary/40">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Precios</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-foreground">
            Planes simples y transparentes
          </h2>
          <p className="text-lg text-muted-foreground">Sin contratos forzosos. Cancela cuando quieras.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-8 border transition-smooth ${
                p.highlight
                  ? "bg-card border-primary shadow-warm scale-[1.02]"
                  : "bg-card border-border hover:shadow-soft"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-warm text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
              <h3 className="font-display text-2xl text-foreground">{p.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-5">{p.desc}</p>
              <div className="mb-6">
                <span className="font-display text-5xl text-foreground">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full">
                <Button variant={p.highlight ? "default" : "secondary"} className="w-full rounded-full" size="lg">
                  Empezar
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;