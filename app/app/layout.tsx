import type { Metadata } from "next";
import { AppShell } from "@/components/navigation/app-shell";

export const metadata: Metadata = {
  title: "App",
  description: "Cryptex Miner application shell",
};

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}


