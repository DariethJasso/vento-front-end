import { Wind } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-display text-2xl text-foreground mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground">
              <Wind className="h-5 w-5" />
            </span>
            Vento
          </div>
          <p className="text-sm text-muted-foreground">El POS con IA para restaurantes, cafés, bares y comercios.</p>
        </div>
        {[
          {
            title: "Producto",
            links: [
              { label: "Funciones", to: "/#features" },
              { label: "Módulos", to: "/#modules" },
              { label: "Precios", to: "/#pricing" },
              { label: "IA", to: "/#ai" },
            ],
          },
          {
            title: "Empresa",
            links: [
              { label: "Acerca de", to: "#" },
              { label: "Blog", to: "#" },
              { label: "Contacto", to: "#" },
              { label: "Carreras", to: "#" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Privacidad", to: "/privacidad" },
              { label: "Términos y condiciones", to: "/terminos" },
              { label: "Ayuda", to: "#" },
              { label: "Estado", to: "#" },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-foreground mb-3">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.to} className="hover:text-foreground transition-smooth">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vento. Hecho con cariño para quienes alimentan al mundo.
        </div>
      </div>
    </footer>
  );
};

export default Footer;