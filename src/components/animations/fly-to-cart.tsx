"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

interface FlyToCartProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  itemName: string;
  onComplete: () => void;
}

export default function FlyToCart({ startX, startY, endX, endY, itemName, onComplete }: FlyToCartProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isAnimating) return null;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        animation: "flyToCart 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "--delta-x": `${deltaX}px`,
        "--delta-y": `${deltaY}px`,
      } as React.CSSProperties}
    >
      <div className="relative">
        <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg animate-pulse">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          +1
        </div>
      </div>
      <style jsx>{`
        @keyframes flyToCart {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--delta-x) * 0.5), calc(var(--delta-y) * 0.5)) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(var(--delta-x), var(--delta-y)) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
