"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

interface Plan {
  name: string;
  monthlyPrice: number | string; // Número para planes fijos, string para el personalizado
  period: string;
  desc: string;
  features: string[];
  highlight: boolean;
  isCustom?: boolean;
  trial?: string; // Propiedad opcional para textos de prueba gratis
}

const Pricing = () => {
  // Estado para controlar el tipo de facturación: "monthly" o "yearly"
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans: Plan[] = [
    {
      name: "Plus",
      monthlyPrice: 150,
      period: "/mes",
      desc: "Perfecto para empezar tu negocio.",
      features: ["1 punto de venta", "Inventario", "Tickets básicos", "Reportes básicos", "Soporte por correo"],
      highlight: false,
      trial: "7 días de prueba gratis", // Referencia de prueba gratis agregada aquí
    },
    {
      name: "Pro",
      monthlyPrice: 235,
      period: "/mes",
      desc: "Para negocios en crecimiento.",
      features: [
        "1 punto de venta completo (Cocina y reparto)",
        "Asistente IA incluido",
        "Inventario",
        "Ticket personalizado",
        "Reportes avanzados",
        "Soporte prioritario",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: 1200,
      period: "/mes",
      desc: "Para negocios con múltiples sucursales.",
      features: [
        "5 puntos de venta completos (Cocina y reparto)",
        "Asistente IA incluido",
        "Inventario",
        "Ticket personalizado",
        "Reportes avanzados",
        "Soporte prioritario",
      ],
      highlight: false,
    },
    {
      name: "Personalizado",
      monthlyPrice: "A tu medida",
      period: "",
      desc: "Grandes volúmenes o necesidades especiales.",
      features: [
        "Sucursales ilimitadas según requieras",
        "Configuración modular (Básica, Cocina o Delivery)",
        "Descuento por volumen de sucursales",
        "Todos los módulos avanzados + Asistente IA",
        "Migración de datos e inventario incluida",
        "Soporte dedicado y prioritario 24/7",
      ],
      highlight: false,
      isCustom: true,
    }
  ];

  // Función para calcular el precio final según el periodo (20% desc en anual)
  const formatPrice = (plan: Plan) => {
    if (typeof plan.monthlyPrice === "string") return plan.monthlyPrice;
    
    if (billingPeriod === "yearly") {
      const yearlyTotal = Math.round((plan.monthlyPrice * 0.8) * 12);
      return `$${yearlyTotal}mxn`;
    }
    
    return `$${plan.monthlyPrice}mxn`;
  };

  // Función para obtener el precio original tachado (sin descuento) para el modo anual
  const getOriginalYearlyPrice = (plan: Plan) => {
    if (typeof plan.monthlyPrice === "string") return null;
    return `$${plan.monthlyPrice * 12}mxn`;
  };

  return (
    <section id="pricing" className="py-24 bg-secondary/40">
      <div className="w-full px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
        {/* Encabezado */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Precios</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 mb-4 text-foreground">
            Planes simples y transparentes
          </h2>
          <p className="text-lg text-muted-foreground">Sin contratos forzosos. Cancela cuando quieras.</p>
        </div>

        {/* Switch Selector Mensual / Anual */}
        <div className="flex justify-center mb-16">
          <div className="relative bg-muted p-1 rounded-full flex items-center shadow-inner border border-border">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                billingPeriod === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de 4 Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-6 lg:p-8 border flex flex-col justify-between transition-all duration-300 ${
                p.highlight
                  ? "bg-card border-primary shadow-warm xl:scale-[1.03] z-10"
                  : "bg-card border-border hover:shadow-soft"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}
              
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-display text-2xl text-foreground">
                    {p.name}
                  </h3>
                  {/* Badge de prueba gratis dinámico para Plus */}
                  {p.trial && (
                    <span className="bg-green-500/10 text-green-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-green-500/20">
                      {p.trial}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-1 mb-5 min-h-[40px]">{p.desc}</p>
                
                {/* Despliegue del Precio */}
                <div className="mb-6 min-h-[70px] flex flex-col justify-end">
                  {/* Precio original tachado (Aparece solo en Anual para planes fijos) */}
                  {billingPeriod === "yearly" && !p.isCustom && (
                    <span className="text-sm text-muted-foreground/70 line-through block mb-0.5 font-medium">
                      {getOriginalYearlyPrice(p)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1 flex-wrap">
                    {/* CAMBIO: Se redujo ligeramente el tamaño aquí de text-4xl/5xl a text-3xl/4xl */}
                    <span className={`font-display text-foreground leading-none ${p.isCustom ? "text-2xl font-bold" : "text-3xl lg:text-4xl"}`}>
                      {formatPrice(p)}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">
                      {p.isCustom ? "" : billingPeriod === "monthly" ? p.period : "/año"}
                    </span>
                  </div>
                </div>
                
                {/* Características */}
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón Inferior */}
              <Link href={p.isCustom ? "https://wa.me/tu-numero" : "/register"} className="w-full mt-auto">
                <Button 
                  variant={p.highlight ? "default" : p.isCustom ? "outline" : "secondary"} 
                  className="w-full rounded-full" 
                  size="lg"
                >
                  {p.isCustom ? "Cotizar ahora" : "Empezar"}
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