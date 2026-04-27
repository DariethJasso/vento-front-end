import { Monitor, ChefHat, Truck, BarChart3 } from "lucide-react";

const modules = [
  { icon: Monitor, name: "POS / Caja", desc: "Toma órdenes y cobra rápido." },
  { icon: ChefHat, name: "Cocina", desc: "Comandas claras por estación." },
  { icon: Truck, name: "Envíos", desc: "Repartidores y rutas en vivo." },
  { icon: BarChart3, name: "Back office", desc: "Estadísticas y administración." },
];

const Modules = () => {
  return (
    <section id="modules" className="py-24 bg-background">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Módulos</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-foreground">
            Una plataforma, cuatro pantallas
          </h2>
          <p className="text-lg text-muted-foreground">
            Cada rol tiene su pantalla optimizada. Todo conectado en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m, i) => (
            <div
              key={m.name}
              className="relative bg-card border border-border rounded-2xl p-6 text-center hover:shadow-soft hover:bg-secondary/30 transition-smooth"
            >
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-warm flex items-center justify-center text-primary-foreground shadow-soft">
                <m.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-1">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
              <span className="absolute top-3 right-3 text-xs font-mono text-muted-foreground/60">
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modules;