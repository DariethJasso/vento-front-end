"use client";

import { ReactNode } from "react";
import PullToRefreshLib from "react-simple-pull-to-refresh";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const handleRefresh = async () => {
    // Recargar la página
    window.location.reload();
    // Retornar una promesa que nunca se resuelve porque la página se recarga
    return new Promise<void>(() => {});
  };

  return (
    <PullToRefreshLib
      onRefresh={handleRefresh}
      pullingContent={
        <div className="flex justify-center py-4">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>
      }
      refreshingContent={
        <div className="flex justify-center py-4">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </div>
      }
      resistance={2.5}
      pullDownThreshold={100}
      maxPullDownDistance={150}
    >
      {children}
    </PullToRefreshLib>
  );
}
