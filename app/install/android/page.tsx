import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InstallAndroidPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Android Install</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Install from Chrome in seconds</h1>
      <ol className="mt-6 space-y-3 text-sm text-slate-200">
        <li className="glass-card rounded-xl p-4">1. Open Cryptex Miner in Chrome.</li>
        <li className="glass-card rounded-xl p-4">2. Tap the browser menu (?).</li>
        <li className="glass-card rounded-xl p-4">3. Tap <strong>Install app</strong> and confirm.</li>
      </ol>
      <p className="mt-4 text-xs text-slate-400">If prompted automatically, use the one-tap install banner.</p>
      <div className="mt-6">
        <Link href="/install">
          <Button variant="secondary">Back to Install Options</Button>
        </Link>
      </div>
    </main>
  );
}


