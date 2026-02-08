"use client";

import type { ReactNode } from "react";
import { DesktopSidebar, MobileBottomNav } from "@/components/navigation/app-nav";
import { TopHeader } from "@/components/navigation/top-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-transparent text-slate-100">
      <DesktopSidebar />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-auto">
        <TopHeader />
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 md:px-6 md:pb-8">{children}</div>
      </main>
      <MobileBottomNav />
    </div>
  );
}


