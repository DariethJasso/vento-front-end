import { Layout, MousePointer2, Printer, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MousePointer2, text: "Editor visual tipo Canva" },
  { icon: Printer, text: "Tickets físicos personalizados" },
  { icon: Smartphone, text: "Tickets digitales por WhatsApp o correo" },
];

const LayoutPos = () => {
  return (
    <section className="py-24 bg-secondary/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-soft opacity-50 pointer-events-none" />
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 relative grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual mockup */}
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-4 bg-gradient-warm opacity-20 blur-3xl rounded-3xl" />
          <div className="relative bg-card rounded-3xl shadow-warm border border-border p-6">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-destructive/60" />
                <span className="h-3 w-3 rounded-full bg-accent" />
                <span className="h-3 w-3 rounded-full bg-primary/60" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">LayoutPos · Editor</span>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Tools sidebar */}
              <div className="space-y-2">
                {["Texto", "Logo", "Línea", "QR", "Total"].map((tool) => (
                  <div
                    key={tool}
                    className="text-xs px-3 py-2 rounded-lg bg-secondary text-foreground/80 border border-border hover:bg-primary/10 hover:border-primary/30 transition-smooth cursor-pointer"
                  >
                    {tool}
                  </div>
                ))}
              </div>
              {/* Ticket preview */}
              <div className="col-span-2 bg-background rounded-lg p-5 font-mono text-xs text-foreground border border-dashed border-border">
                <div className="text-center mb-2">
                  <p className="font-display text-lg not-italic">La Brisa</p>
                  <p className="text-[10px] text-muted-foreground">Av. Reforma 123 · Tel. 555-0192</p>
                </div>
                <div className="border-t border-dashed border-border my-2" />
                <div className="space-y-1">
                  <div className="flex justify-between"><span>3× Al Pastor</span><span>$13.50</span></div>
                  <div className="flex justify-between"><span>1× Horchata</span><span>$3.75</span></div>
                  <div className="flex justify-between"><span>2× Café</span><span>$7.00</span></div>
                </div>
                <div className="border-t border-dashed border-border my-2" />
                <div className="flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span className="text-primary">$24.25</span>
                </div>
                <div className="text-center mt-3 text-[10px] text-muted-foreground">¡Gracias por tu visita!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium border border-border">
            <Layout className="h-4 w-4 text-primary" />
            Integrado con LayoutPos
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-5 mb-5 text-foreground">
            Diseña tus tickets como una <span className="text-primary">marca</span>.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Nuvly se conecta con <strong className="text-foreground">LayoutPos</strong>, nuestro
            editor visual tipo Canva para crear tickets físicos y digitales totalmente
            personalizados. Arrastra, suelta y publica — sin diseñador.
          </p>
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-foreground">
                <span className="h-9 w-9 rounded-lg bg-secondary text-primary flex items-center justify-center">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="lg" className="rounded-full">
            Conoce LayoutPos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LayoutPos;