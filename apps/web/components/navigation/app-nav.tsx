"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ChartCandlestick, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/mining", label: "Mining", icon: Activity },
  { href: "/app/markets", label: "Markets", icon: ChartCandlestick },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  return (
    <aside className="relative z-20 hidden h-screen w-64 shrink-0 overflow-hidden p-4 md:flex md:flex-col">
      <div className="glass-card gradient-border z-20 flex h-full w-full flex-col rounded-2xl p-4">
        <Link href="/" className="focus-ring rounded-xl p-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Cryptex Miner</p>
          <p className="mt-2 text-xl font-semibold text-white">Mining Console</p>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const active = normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                  active
                    ? "bg-cyan-400/20 text-cyan-100"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto pr-1 text-[11px] leading-5 text-slate-400">
          Dark mode only. Real-time markets and calibrated mining controls.
        </p>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  return (
    <nav className="glass-card fixed inset-x-2 bottom-2 z-40 rounded-2xl px-2 py-2 md:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className={cn(
                  "focus-ring flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium",
                  active ? "bg-cyan-300/20 text-cyan-100" : "text-slate-300",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


