"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { SavedAddress, WalletProvider } from "@/store/app-store";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { label: string; network: string; address: string; provider: WalletProvider }) => void;
  initial?: SavedAddress | null;
}

const providers: { id: WalletProvider; label: string; logo: string }[] = [
  { id: "exodus", label: "Exodus", logo: "/wallet-logos/exodus.png" },
  { id: "metamask", label: "MetaMask", logo: "/wallet-logos/metamask.png" },
  { id: "phantom", label: "Phantom", logo: "/wallet-logos/phantom.png" },
  { id: "trustwallet", label: "Trust Wallet", logo: "/wallet-logos/trustwallet.png" },
  { id: "coinbase", label: "Coinbase", logo: "/wallet-logos/coinbase.png" },
];

export function AddressModal({ isOpen, onClose, onSubmit, initial }: AddressModalProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [network, setNetwork] = useState(initial?.network ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [provider, setProvider] = useState<WalletProvider>(initial?.provider ?? "exodus");

  const title = useMemo(() => (initial ? "Edit wallet address" : "Save wallet address"), [initial]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Watch-only entries are stored locally on this device."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!label.trim() || !network.trim() || !address.trim()) {
            return;
          }

          onSubmit({
            label: label.trim(),
            network: network.trim(),
            address: address.trim(),
            provider,
          });

          onClose();
        }}
      >
        <label className="block text-sm text-slate-200">
          Label
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="focus-ring mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white"
            placeholder="Primary wallet"
            required
          />
        </label>

        <label className="block text-sm text-slate-200">
          Network
          <input
            value={network}
            onChange={(event) => setNetwork(event.target.value)}
            className="focus-ring mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white"
            placeholder="Bitcoin, Ethereum, Solana"
            required
          />
        </label>

        <label className="block text-sm text-slate-200">
          Address
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={3}
            className="focus-ring mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white"
            placeholder="Watch-only address"
            required
          />
        </label>

        <fieldset>
          <legend className="text-sm text-slate-200">Wallet provider</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {providers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setProvider(item.id)}
                className={`focus-ring flex items-center gap-2 rounded-xl border px-2 py-2 text-xs transition ${
                  provider === item.id
                    ? "border-cyan-300/70 bg-cyan-300/15 text-cyan-100"
                    : "border-slate-700 bg-slate-900/60 text-slate-300"
                }`}
              >
                <Image src={item.logo} alt={`${item.label} logo`} width={18} height={18} className="rounded-sm" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}


