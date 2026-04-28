import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h1 className="font-display text-3xl text-foreground mb-3">
          Sin conexión
        </h1>
        <p className="text-muted-foreground mb-6">
          No hay conexión a internet. Algunas funciones pueden no estar disponibles.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="default"
          size="lg"
          className="rounded-full"
        >
          Reintentar
        </Button>
      </div>
    </div>
  );
}
