import { Package, Receipt, BarChart3, ChefHat, Truck, Bot } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Inventario inteligente",
    desc: "Controla insumos, recetas y stock en tiempo real. Vento avisa antes de que se acabe la salsa.",
  },
  {
    icon: Receipt,
    title: "Tickets en segundos",
    desc: "Genera órdenes para mesa, mostrador o llevar con un par de toques. Diseña tu ticket con LayoutPos.",
  },
  {
    icon: ChefHat,
    title: "Pantalla de cocina",
    desc: "La cocina ve cada orden organizada por tiempo, prioridad y estación. Adiós a las comandas perdidas.",
  },
  {
    icon: Truck,
    title: "Pantalla de envíos",
    desc: "Coordina repartidores, marca rutas y mantén al cliente informado del estado de su pedido.",
  },
  {
    icon: BarChart3,
    title: "Back office completo",
    desc: "Reportes de ventas, productos top, márgenes y horas pico. Todo en un panel claro y accionable.",
  },
  {
    icon: Bot,
    title: "Asistente con IA",
    desc: "Pregunta en lenguaje natural: «¿Cuánto vendí ayer?», «Dame el ticket #234». Vento responde.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-md font-semibold text-primary uppercase tracking-wider">Todo en uno</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-foreground">
            Funciones diseñadas para tu negocio
          </h2>
          <p className="text-lg text-muted-foreground">
            Desde la primera orden hasta el cierre del día. Vento te acompaña en cada paso del servicio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-card border border-border rounded-2xl p-7 hover:shadow-soft hover:-translate-y-1 transition-smooth"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary mb-5 group-hover:bg-gradient-warm group-hover:text-primary-foreground transition-smooth">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;