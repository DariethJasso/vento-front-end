import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Antes tardábamos 20 minutos en cuadrar caja. Con Nuvly son 2 y los reportes me llegan al teléfono.",
    name: "Ana Ramírez",
    role: "Dueña, Café Norte",
    initials: "AR",
  },
  {
    quote:
      "La pantalla de cocina cambió nuestra operación. Ya nadie grita comandas, todo fluye.",
    name: "Diego Salinas",
    role: "Chef, Restaurante Tostado",
    initials: "DS",
  },
  {
    quote:
      "Le pregunto al asistente cuánto vendí ayer y me responde al instante. Es como tener un contador 24/7.",
    name: "Lucía Mendoza",
    role: "Gerente, Barra 21",
    initials: "LM",
  },
  {
    quote:
      "Diseñar nuestros tickets con LayoutPos fue facilísimo. Quedaron con la cara de la marca, no genéricos.",
    name: "Mario Torres",
    role: "Fundador, Don Mario",
    initials: "MT",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Opiniones</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-foreground">
            Historias reales de quienes ya usan Nuvly
          </h2>
          <p className="text-lg text-muted-foreground">
            Restaurantes, cafés, bares y comercios que transformaron su operación.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="bg-card border border-border rounded-2xl p-7 hover:shadow-soft transition-smooth flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-foreground text-lg leading-relaxed flex-1">
                «{t.quote}»
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                <div className="h-11 w-11 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;