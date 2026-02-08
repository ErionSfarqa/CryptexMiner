"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { LiveTickerStrip } from "@/components/market/live-ticker-strip";
import { ProductTour } from "@/components/marketing/product-tour";
import { MarketPulsePanel } from "@/components/market/market-pulse";
import { InstallStepperPreview } from "@/components/marketing/install-stepper-preview";
import { PaypalCheckoutCard } from "@/components/payment/paypal-checkout-card";
import { LogoMark } from "@/components/wallet/logo-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePaymentGate } from "@/lib/payment-gate";

const featureStats = [
  { label: "Install completion rate", value: "92%" },
  { label: "Avg first-session duration", value: "11m" },
  { label: "User satisfaction score", value: "4.8/5" },
];

const walletProviders = [
  { name: "Exodus", logo: "/wallet-logos/exodus.png", fallback: "EX" },
  { name: "Trust Wallet", logo: "/wallet-logos/trustwallet.png", fallback: "TW" },
  { name: "Phantom", logo: "/wallet-logos/phantom.png", fallback: "PH" },
  { name: "MetaMask", logo: "/wallet-logos/metamask.png", fallback: "MM" },
  { name: "Coinbase", logo: "/wallet-logos/coinbase.png", fallback: "CB" },
  { name: "OKX", logo: "/wallet-logos/okx.png", fallback: "OK" },
];

const networks = [
  { name: "Bitcoin", logo: "/network-logos/bitcoin.svg", fallback: "BTC" },
  { name: "Ethereum", logo: "/network-logos/ethereum.svg", fallback: "ETH" },
  { name: "Solana", logo: "/network-logos/solana.svg", fallback: "SOL" },
  { name: "BNB Chain", logo: "/network-logos/bnb-chain.svg", fallback: "BNB" },
  { name: "Polygon", logo: "/network-logos/polygon.svg", fallback: "POL" },
  { name: "Avalanche", logo: "/network-logos/avalanche.svg", fallback: "AVAX" },
  { name: "TON", logo: "/network-logos/ton.svg", fallback: "TON" },
  { name: "Arbitrum", logo: "/network-logos/arbitrum.svg", fallback: "ARB" },
  { name: "Optimism", logo: "/network-logos/optimism.svg", fallback: "OP" },
  { name: "Dogecoin", logo: "/network-logos/dogecoin.svg", fallback: "DOGE" },
];

const purchaseAmount = process.env.NEXT_PUBLIC_PAYPAL_PRICE_AMOUNT ?? "49.00";
const purchaseCurrency = process.env.NEXT_PUBLIC_PAYPAL_PRICE_CURRENCY ?? "USD";

export default function MarketingPage() {
  const { isPaid } = usePaymentGate();

  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute left-[12%] top-[20%] h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute right-[6%] top-[24%] h-52 w-52 rounded-full bg-sky-400/15 blur-3xl" />
        {Array.from({ length: 22 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute block rounded-full bg-cyan-200/30"
            style={{
              width: `${(index % 4) + 2}px`,
              height: `${(index % 4) + 2}px`,
              left: `${(index * 37) % 100}%`,
              top: `${(index * 19) % 100}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 5 + (index % 5), repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="focus-ring rounded-lg px-2 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Cryptex Miner
        </Link>
        <Link href={isPaid ? "/install" : "/#secure-payment"} className="focus-ring rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300/60">
          {isPaid ? "Install Miner" : "Pay & Unlock"}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-14 px-4 pb-20 sm:px-6">
        <section className="grid gap-10 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Premium Desktop + Mobile Experience
            </motion.p>
            <motion.h1
              className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              Install in seconds. Mining made easy
            </motion.h1>
            <motion.p
              className="mt-4 max-w-xl text-base leading-7 text-slate-300"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
            >
              Cryptex Miner combines calibrated mining controls, live Binance markets, and secure wallet tracking in a
              clean cross-platform workflow.
            </motion.p>
            <motion.div
              className="mt-7 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href={isPaid ? "/install" : "/#secure-payment"}>
                <Button size="lg" className="min-w-[12rem]">
                  {isPaid ? "Install Miner" : "Pay to Unlock Install"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/markets">
                <Button variant="secondary" size="lg" className="min-w-[12rem]">
                  View Live Markets
                </Button>
              </Link>
            </motion.div>
          </div>

          <Card className="relative overflow-hidden rounded-3xl border border-slate-700/55 p-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(35,211,200,0.2),transparent_44%),radial-gradient(circle_at_90%_70%,rgba(74,161,255,0.18),transparent_36%)]" />
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Why teams choose Cryptex</p>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Secure PayPal payment gating before installer access.</span>
              </li>
              <li className="flex gap-3">
                <Smartphone className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Native-feel navigation across desktop and mobile installs.</span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Live Binance market streams with stale-data safeguards.</span>
              </li>
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {featureStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-700/65 bg-slate-900/55 p-3">
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section id="secure-payment" className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <PaypalCheckoutCard amount={purchaseAmount} currency={purchaseCurrency} />
          <Card className="rounded-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">How It Works</p>
            <ol className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2">1. Pay securely with PayPal.</li>
              <li className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2">2. Open install page and download your installer.</li>
              <li className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2">3. Connect wallets with provider and network logos.</li>
              <li className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-3 py-2">4. Start mining from the core control panel.</li>
            </ol>
            <p className="mt-4 text-xs text-slate-400">
              One-time access fee: {purchaseAmount} {purchaseCurrency}
            </p>
          </Card>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Live Markets</h2>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Binance public API</p>
          </div>
          <LiveTickerStrip />
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">Product Tour</h2>
          <ProductTour />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Market Pulse</h2>
            <MarketPulsePanel />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">Install Packages</h2>
            <InstallStepperPreview />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Supported Wallets</p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {walletProviders.map((wallet) => (
                <div key={wallet.name} className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-2 py-3 text-center">
                  <div className="flex justify-center">
                    <LogoMark src={wallet.logo} alt={`${wallet.name} logo`} fallback={wallet.fallback} size={24} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-300">{wallet.name}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Supported Networks</p>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {networks.map((network) => (
                <div key={network.name} className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-2 py-3 text-center">
                  <div className="flex justify-center">
                    <LogoMark src={network.logo} alt={`${network.name} logo`} fallback={network.fallback} size={24} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-300">{network.name}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Security Guarantee", body: "Wallet entries are watch-only and kept on-device. No custody, no private keys, no seed phrase handling." },
            { title: "Operational Reliability", body: "Live pricing and market pulse updates use Binance public endpoints with stale-data fallback controls." },
            { title: "Contact & Support", body: "Need help? Contact support@cryptexminer.com for payment, install, or wallet support." },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-700/50 px-4 py-6 text-center text-xs text-slate-400">
        <p>Cryptex Miner (c) {new Date().getFullYear()} - Terms - Privacy</p>
        <p className="mt-1">No blockchain hashing, consensus execution, or private key generation is performed.</p>
      </footer>
    </div>
  );
}
