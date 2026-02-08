"use client";

import type { ReactNode } from "react";
import { DesktopSidebar, MobileBottomNav } from "@/components/navigation/app-nav";
import { TopHeader } from "@/components/navigation/top-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <DesktopSidebar />
      <div className="md:pl-64">
        <TopHeader />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 md:px-6 md:pb-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}


