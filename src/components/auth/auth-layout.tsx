"use client";
import { Wind } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const AuthLayout = ({ title, subtitle, children, footer }: Props) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col p-8 md:p-12">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground shadow-soft">
            <Wind className="h-5 w-5" />
          </span>
          Vento
        </Link>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-4xl text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground mb-8">{subtitle}</p>
            {children}
            <div className="mt-6 text-sm text-muted-foreground text-center">{footer}</div>
          </div>
        </div>
      </div>

      {/* Right: artwork */}
      <div className="hidden lg:block relative bg-gradient-warm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft opacity-50" />
        <div className="relative h-full flex flex-col justify-end p-12 text-primary-foreground">
          <blockquote className="font-display text-3xl leading-snug max-w-md">
            «Vento nos quitó el caos del horario pico. Cocina, caja y envíos por fin hablan el mismo idioma.»
          </blockquote>
          <p className="mt-4 text-primary-foreground/80">— Lucía, gerente de operaciones</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;