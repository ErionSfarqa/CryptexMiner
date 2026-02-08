"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Lock, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { LiveTickerStrip } from "@/components/market/live-ticker-strip";
import { ProductTour } from "@/components/marketing/product-tour";
import { MarketPulsePanel } from "@/components/market/market-pulse";
import { InstallStepperPreview } from "@/components/marketing/install-stepper-preview";
import { PayPalHostedButton } from "@/components/payments/PayPalHostedButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePaymentGate } from "@/lib/payment-gate";

const featureStats = [
  { label: "Install completion rate", value: "92%" },
  { label: "Avg first-session duration", value: "11m" },
  { label: "User satisfaction score", value: "4.8/5" },
];

const securePaymentCards = [
  {
    eyebrow: "Secure Checkout",
    title: "One-time purchase, encrypted payment",
    body: "Checkout runs through PayPal with a clean EUR payment flow and protected transaction handling.",
    points: ["Encrypted transfer", "Buyer protection", "Secure order processing"],
    icon: BadgeCheck,
  },
  {
    eyebrow: "Protected Payments",
    title: "No card storage on our servers",
    body: "Sensitive payment details stay with PayPal. Cryptex receives only verification status for access unlock.",
    points: ["No card retention", "Server-side entitlement", "Reduced fraud surface"],
    icon: ShieldCheck,
  },
  {
    eyebrow: "Instant Access",
    title: "Install unlocks after confirmation",
    body: "Once payment is verified, installer downloads become available directly from the install page.",
    points: ["Fast unlock", "Cross-device access", "Clear activation status"],
    icon: Lock,
  },
];

const PAYPAL_HOSTED_BUTTON_ID = "GVDXTBZQFAVD4";
const PAYPAL_CONTAINER_ID = "paypal-container-GVDXTBZQFAVD4";

type SecureCard = (typeof securePaymentCards)[number];

function SecurePaymentInfoCard({ item }: { item: SecureCard }) {
  return (
    <Card className="group w-full max-w-xl rounded-2xl border-slate-700/65 bg-slate-900/55 p-5 transition duration-300 hover:border-cyan-300/40 hover:shadow-[0_18px_50px_-30px_rgba(34,211,238,0.7)]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-200">
          <item.icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{item.eyebrow}</p>
          <h3 className="mt-1 whitespace-normal break-words text-xl font-semibold text-white">{item.title}</h3>
          <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-slate-300">{item.body}</p>
          <ul className="mt-3 space-y-1.5">
            {item.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-slate-200">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
                <span className="whitespace-normal break-words">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export default function MarketingPage() {
  const { isPaid } = usePaymentGate();
  const firstSecureCard = securePaymentCards[0];
  const secondSecureCard = securePaymentCards[1];
  const thirdSecureCard = securePaymentCards[2];

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
            className="mx-auto max-w-2xl text-center"
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

          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
            {firstSecureCard ? (
              <motion.div
                className="flex justify-center md:justify-end"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.26 }}
              >
                <SecurePaymentInfoCard item={firstSecureCard} />
              </motion.div>
            ) : null}

            {secondSecureCard ? (
              <motion.div
                className="flex justify-center md:justify-start"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.26, delay: 0.04 }}
              >
                <SecurePaymentInfoCard item={secondSecureCard} />
              </motion.div>
            ) : null}

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.24 }}
              transition={{ duration: 0.24 }}
            >
              <Card className="mx-auto w-full max-w-md rounded-2xl border-cyan-200/20 bg-cyan-500/5 text-center">
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Unlock Access</p>
                      <h3 className="mt-2 whitespace-normal break-words text-2xl font-semibold text-white">One-time PayPal activation</h3>
                      <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-slate-300">
                        Complete checkout to unlock installer downloads and activate access across devices.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      <Lock className="h-3.5 w-3.5" />
                      Secure checkout
                    </span>
                  </div>

                  <div className="mx-auto w-full rounded-2xl border border-slate-700/65 bg-slate-900/55 p-4">
                    <div className="flex justify-center">
                      <div className="w-full max-w-[360px] min-h-[56px]">
                        <PayPalHostedButton hostedButtonId={PAYPAL_HOSTED_BUTTON_ID} containerId={PAYPAL_CONTAINER_ID} />
                      </div>
                    </div>
                    <p className="mt-3 whitespace-normal break-words text-center text-xs text-slate-400">
                      After checkout, return to the Install page to download.
                    </p>
                  </div>

                  <ul className="grid gap-2">
                    <li className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
                      <BadgeCheck className="h-4 w-4 text-cyan-300" />
                      <span className="whitespace-normal break-words text-center">PayPal secure checkout</span>
                    </li>
                    <li className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
                      <ShieldCheck className="h-4 w-4 text-cyan-300" />
                      <span className="whitespace-normal break-words text-center">No card details stored on our servers</span>
                    </li>
                    <li className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/65 bg-slate-900/40 px-3 py-2 text-xs text-slate-200">
                      <Smartphone className="h-4 w-4 text-cyan-300" />
                      <span className="whitespace-normal break-words text-center">Instant unlock on confirmation</span>
                    </li>
                  </ul>

                  <div className="flex justify-center">
                    <Link href="/install" className="w-full max-w-[240px]">
                      <Button className="w-full" size="sm">
                        Open Install Page
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>

            {thirdSecureCard ? (
              <motion.div
                className="flex justify-center md:justify-end"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.26, delay: 0.08 }}
              >
                <SecurePaymentInfoCard item={thirdSecureCard} />
              </motion.div>
            ) : null}
          </div>
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
