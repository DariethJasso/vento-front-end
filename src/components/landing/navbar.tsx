"use client";
import { Button } from "@/components/ui/button";
import { Wind, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/70 border-b border-border/50">
      <nav className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground shadow-soft">
            <Wind className="h-5 w-5" />
          </span>
          Vento
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-smooth">Funciones</a>
          <a href="#modules" className="hover:text-foreground transition-smooth">Módulos</a>
          <a href="#ai" className="hover:text-foreground transition-smooth">IA</a>
          <a href="#pricing" className="hover:text-foreground transition-smooth">Precios</a>
        </div>
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <Link href="/panel">
              <Button variant="default" size="lg" className="rounded-full">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Ir al Panel
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="default">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="lg" className="rounded-full">
                  Empezar gratis
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;