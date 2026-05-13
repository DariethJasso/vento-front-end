"use client";

import { useEffect, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 120; // Distancia mínima para activar refresh
  const MAX_PULL = 150; // Distancia máxima de pull

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchCurrentY = 0;
    let hasStartedPull = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Solo permitir pull-to-refresh si estamos en el top de la página
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        startY.current = touchStartY;
        setCanPull(true);
        hasStartedPull = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      touchCurrentY = e.touches[0].clientY;
      const touchCurrentX = e.touches[0].clientX;
      const distanceY = touchCurrentY - touchStartY;
      const distanceX = Math.abs(touchCurrentX - touchStartX);

      // Solo activar si:
      // 1. Estamos en el top de la página
      // 2. El movimiento es hacia abajo (distanceY > 0)
      // 3. El movimiento vertical es mayor que el horizontal (más vertical que horizontal)
      // 4. Ha pasado un umbral mínimo de 30px
      if (window.scrollY === 0 && distanceY > 30 && distanceY > distanceX * 1.5) {
        hasStartedPull = true;
        isPulling.current = true;
        
        // Aplicar resistencia al pull
        const adjustedDistance = Math.min(distanceY * 0.35, MAX_PULL);
        setPullDistance(adjustedDistance);

        // Solo prevenir scroll si ya hemos iniciado el pull y pasamos 100px
        if (hasStartedPull && distanceY > 100) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!canPull || isRefreshing) return;

      if (pullDistance >= PULL_THRESHOLD) {
        // Activar refresh
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        
        // Recargar la página
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        // Reset
        setPullDistance(0);
      }

      setCanPull(false);
      isPulling.current = false;
      hasStartedPull = false;
    };

    // Agregar event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canPull, isRefreshing, pullDistance]);

  // No mostrar nada si no hay pull o si no es móvil
  if (pullDistance === 0 && !isRefreshing) return null;

  const rotation = isRefreshing ? 360 : (pullDistance / PULL_THRESHOLD) * 360;
  const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing ? "transform 0.3s ease" : "none",
      }}
    >
      <div
        className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg mt-4"
        style={{
          opacity,
          transform: `scale(${Math.min(pullDistance / PULL_THRESHOLD, 1)})`,
        }}
      >
        <RefreshCw
          className="h-6 w-6"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isRefreshing ? "transform 0.6s linear infinite" : "transform 0.1s ease",
            animation: isRefreshing ? "spin 0.6s linear infinite" : "none",
          }}
        />
      </div>
    </div>
  );
}
