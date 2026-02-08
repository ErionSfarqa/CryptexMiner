import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Cryptex Miner",
    template: "%s | Cryptex Miner",
  },
  description:
    "Install in seconds. Mining made easy. Premium mining interface with live Binance markets.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cryptex Miner",
  },
};

export const viewport: Viewport = {
  themeColor: "#050b16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${heading.variable} ${body.variable} bg-[var(--color-bg)] text-[var(--color-text)] antialiased`}>
        <Script
          id="paypal-sdk"
          src="https://www.paypal.com/sdk/js?client-id=BAAG_G8uU08NOfUAHgVcL7RAHk5Bts9tXMeSYGjLm1AffxSQQ7obn7yrj8MLAA6J1iUFeAUvw38iPKQoiU&components=hosted-buttons&disable-funding=venmo&currency=EUR"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script id="smartsupp" strategy="afterInteractive">
          {`var _smartsupp = _smartsupp || {};
_smartsupp.key = '6e9f7f52f8ff98a0999592f4bea229dff08a75c0';
window.smartsupp||(function(d) {
  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[],
  s=d.getElementsByTagName('script')[0];c=d.createElement('script');
  c.type='text/javascript';c.charset='utf-8';c.async=true;
  c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
})(document);`}
        </Script>
        <noscript>
          Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>
        </noscript>
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}


