"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/panel/app-sidebar";
import { TopBar } from "@/components/panel/top-bar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Session } from "next-auth";

interface BranchConfig {
  hasPos?: boolean;
  hasKitchen?: boolean;
  hasDelivery?: boolean;
  hasCustomers?: boolean;
}

interface DashboardLayoutClientProps {
  session: Session;
  children: React.ReactNode;
  branchConfig?: BranchConfig;
}

export default function DashboardLayoutClient({ session, children, branchConfig }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <AppSidebar session={session} onClose={() => setIsSidebarOpen(false)} branchConfig={branchConfig} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar con botón hamburguesa */}
        <div className="border-b border-border bg-background">
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Botón hamburguesa - solo visible en móvil/tablet */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Top Bar */}
            <div className="flex-1">
              <TopBar />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
