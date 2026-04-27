import { Sparkles, Send } from "lucide-react";

const messages = [
  { role: "user", text: "¿Cuánto vendí esta semana?" },
  {
    role: "ai",
    text: "Esta semana vendiste $14,820 — un 12% más que la anterior. El martes fue tu mejor día con $3,240 en 87 órdenes.",
  },
  { role: "user", text: "Dame el detalle del ticket #1023" },
  {
    role: "ai",
    text: "Mesa 4 · 3 Tacos al Pastor, 1 Horchata · Total $17.25 · Pagado con tarjeta a las 14:32.",
  },
];

const AISection = () => {
  return (
    <section id="ai" className="py-24 bg-secondary/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-soft opacity-60 pointer-events-none" />
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 relative grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium border border-border">
            <Sparkles className="h-4 w-4 text-primary" />
            Asistente Vento AI
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-5 mb-5 text-foreground">
            Pregunta. Vento responde.
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Olvídate de buscar entre menús y reportes. Pide estadísticas, consulta tickets,
            crea órdenes o pregunta cuántos tacos al pastor te quedan — todo en lenguaje natural.
          </p>
          <ul className="space-y-3">
            {[
              "Genera reportes en segundos",
              "Consulta cualquier ticket por número o cliente",
              "Crea y modifica órdenes hablando",
              "Recibe alertas inteligentes de inventario",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-warm opacity-15 blur-2xl rounded-3xl" />
          <div className="relative bg-card rounded-3xl shadow-warm border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="h-10 w-10 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Vento AI</p>
                <p className="text-xs text-muted-foreground">En línea · Responde al instante</p>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-hidden">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-secondary/60 rounded-full px-4 py-2 border border-border">
              <input
                disabled
                placeholder="Pregunta lo que quieras a Vento..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;