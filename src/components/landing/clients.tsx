import { Coffee, UtensilsCrossed, Wine, Croissant, Sandwich, IceCream, Beer, Pizza } from "lucide-react";

const clients = [
  // { name: "La Brisa", Icon: Wine },
  { name: "Sweetopia", Icon: Coffee },
  // { name: "Tostado", Icon: Croissant },
  { name: "Tacos More", Icon: UtensilsCrossed },
  // { name: "Verdeluz", Icon: Sandwich },
  // { name: "Barra 21", Icon: Beer },
  // { name: "Mercado Sur", Icon: IceCream },
  // { name: "Pan & Co.", Icon: Pizza },
];

const Clients = () => {
  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-10">
          Negocios que confían en Nuvly
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-6 gap-y-8 items-center">
          {clients.map(({ name, Icon }) => (
            <div
              key={name}
              className="group flex flex-col items-center justify-center gap-2 text-muted-foreground/70 hover:text-foreground transition-smooth"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 group-hover:bg-gradient-warm group-hover:text-primary-foreground transition-smooth">
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-display text-base">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;