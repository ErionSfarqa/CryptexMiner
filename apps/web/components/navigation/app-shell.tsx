"use client";

import type { ReactNode } from "react";
import { DesktopSidebar, MobileBottomNav } from "@/components/navigation/app-nav";
import { TopHeader } from "@/components/navigation/top-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-transparent text-slate-100">
      <DesktopSidebar />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <TopHeader />
        <div className="ui-container ui-section-app w-full flex-1 pb-28 pt-6 md:pb-10 md:pt-8">{children}</div>
      </main>
      <MobileBottomNav />
    </div>
  );
}


