"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Lock, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { LiveTickerStrip } from "@/components/market/live-ticker-strip";
import { ProductTour } from "@/components/marketing/product-tour";
import { MarketPulsePanel } from "@/components/market/market-pulse";
import { InstallStepperPreview } from "@/components/marketing/install-stepper-preview";
import { PayPalHostedButton } from "@/components/paypal/PayPalHostedButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePaymentGate } from "@/lib/payment-gate";

const featureStats = [
  { label: "Install completion rate", value: "92%" },
  { label: "Avg first-session duration", value: "11m" },
  { label: "User satisfaction score", value: "4.8/5" },
];

const PAYPAL_HOSTED_BUTTON_ID = "GVDXTBZQFAVD4";
const PAYPAL_CONTAINER_ID = "paypal-container-GVDXTBZQFAVD4";

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

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="focus-ring rounded-lg px-2 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
          Cryptex Miner
        </Link>
        <Link href="/install" className="focus-ring rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300/60">
          {isPaid ? "Install Miner" : "Open Install Page"}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-14 px-4 pb-20 sm:px-6">
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
              <Link href="/install">
                <Button size="lg" className="min-w-[12rem]">
                  {isPaid ? "Install Miner" : "Open Install Page"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!isPaid ? (
                <Link href="/#secure-payment">
                  <Button variant="secondary" size="lg" className="min-w-[12rem]">
                    Secure Payment
                  </Button>
                </Link>
              ) : null}
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

        <section id="secure-payment" className="space-y-6">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.28 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Secure Payment</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Pay securely. Activate instantly.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Trusted checkout experience with professional payment messaging and a direct activation flow.
            </p>
          </motion.div>

          <motion.article
            className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="group overflow-hidden rounded-2xl border border-slate-700/65 bg-slate-900/55 p-3"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-950/20">
                <Image
                  src="/secure-pay/secure-pay.png"
                  alt="Secure checkout via PayPal"
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-contain transition duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-slate-700/65 bg-slate-900/55 p-5"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Pay Securely</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Pay securely with trusted checkout</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                One clear payment step, professional checkout UX, and entitlement-based access unlock on successful
                payment verification.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                  PayPal secure checkout
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <Lock className="mt-0.5 h-4 w-4 text-cyan-300" />
                  No card details stored on our servers
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                  Activation instructions shown after payment
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  Encrypted transfer
                </span>
                <span className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  Buyer protection
                </span>
                <span className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  EUR checkout
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/install">
                  <Button size="sm">Open Install Page</Button>
                </Link>
                <Link href="#secure-payment">
                  <Button size="sm" variant="secondary">
                    View Checkout
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.article>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.28 }}
          >
            <Card className="mx-auto w-full max-w-md rounded-2xl border-cyan-400/35 bg-[linear-gradient(150deg,rgba(13,27,44,0.9),rgba(11,21,36,0.82))]">
              <div className="space-y-5">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Unlock Access</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">One-time PayPal activation</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Complete checkout to unlock installer downloads and activate access across devices.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                    <Lock className="h-3.5 w-3.5" />
                    Secure checkout
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-700/65 bg-slate-900/55 p-4">
                  <div className="flex justify-center">
                    <div className="w-full max-w-[360px]">
                      <PayPalHostedButton hostedButtonId={PAYPAL_HOSTED_BUTTON_ID} containerId={PAYPAL_CONTAINER_ID} />
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    After checkout, return to the Install page to download.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="flex items-start gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <p className="text-xs text-slate-200">PayPal secure checkout</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <p className="text-xs text-slate-200">No card details stored on our servers</p>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2">
                    <Smartphone className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <p className="text-xs text-slate-200">Instant unlock on confirmation</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href="/install" className="w-full sm:w-auto">
                    <Button className="w-full" size="sm">
                      Open Install Page
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/app/markets" className="w-full sm:w-auto">
                    <Button className="w-full" size="sm" variant="secondary">
                      View Live Markets
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
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

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">Trusted & Secure</h2>
          <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Security Guarantee", body: "Wallet entries are watch-only and kept on-device. No custody, no private keys, no seed phrase handling." },
            { title: "Operational Reliability", body: "Live pricing and market pulse updates use Binance public endpoints with stale-data fallback controls." },
            { title: "Buyer Confidence", body: "PayPal checkout is encrypted with one-time purchase verification before installer downloads." },
          ].map((item) => (
            <Card key={item.title} className="rounded-2xl">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
            </Card>
          ))}
          </div>
        </section>

        <section>
          <Card className="rounded-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">FAQs</p>
            <div className="mt-4 space-y-3">
              {[
                {
                  q: "What happens after I pay?",
                  a: "Your payment is verified instantly and installer downloads unlock on the install page without reloading.",
                },
                {
                  q: "Which wallets are supported?",
                  a: "Connect Exodus, Trust Wallet, Phantom, MetaMask, Coinbase, OKX, and custom providers across major networks.",
                },
                {
                  q: "Is wallet access custodial?",
                  a: "No. Wallet entries are watch-only and remain local to your device.",
                },
              ].map((item) => (
                <div key={item.q} className="rounded-xl border border-slate-700/65 bg-slate-900/55 px-4 py-3">
                  <p className="text-sm font-semibold text-white">{item.q}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-700/50 px-4 py-6 text-center text-xs text-slate-400">
        <p>Cryptex Miner (c) {new Date().getFullYear()} - Terms - Privacy</p>
        <p className="mt-1">No blockchain hashing, consensus execution, or private key generation is performed.</p>
      </footer>
    </div>
  );
}
