"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registrado:", registration);
          })
          .catch((error) => {
            console.log("SW registro falló:", error);
          });
      });
    }

    // Capturar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detectar si ya está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Usuario aceptó la instalación");
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Guardar en localStorage para no mostrar de nuevo por un tiempo
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // No mostrar si fue rechazado recientemente (7 días)
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-fade-up">
      <div className="bg-card border border-border rounded-2xl shadow-warm p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              Instalar Vento POS
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Instala la app para acceso rápido desde tu pantalla de inicio
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                variant="default"
                className="rounded-full"
              >
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="rounded-full"
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
