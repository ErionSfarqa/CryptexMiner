"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LogoMark } from "@/components/wallet/logo-mark";
import {
  networkById,
  normalizeWalletNetwork,
  normalizeWalletProvider,
  providerById,
  validateAddressForNetwork,
  walletNetworkOptions,
  walletProviderOptions,
} from "@/lib/wallet-config";
import type { SavedAddress, WalletNetwork, WalletProvider } from "@/store/app-store";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { label: string; network: WalletNetwork; address: string; provider: WalletProvider }) => void;
  initial?: SavedAddress | null;
}

interface LogoDropdownProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ id: T; label: string; logo: string }>;
  fallbackFor: (value: T) => string;
}

function LogoDropdown<T extends string>({ label, value, onChange, options, fallbackFor }: LogoDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.id === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    const onDocumentPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onDocumentPointer);

    return () => {
      window.removeEventListener("mousedown", onDocumentPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-1 text-sm text-slate-200">{label}</p>
      <button
        type="button"
        className="focus-ring flex w-full items-center justify-between rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <LogoMark
            src={selected.logo}
            alt={`${selected.label} logo`}
            fallback={fallbackFor(selected.id)}
            size={20}
          />
          {selected.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-600 bg-slate-950/95 shadow-lg"
          role="listbox"
        >
          {options.map((option) => {
            const active = option.id === value;

            return (
              <button
                key={option.id}
                type="button"
                className={`focus-ring flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                  active ? "bg-cyan-300/15 text-cyan-100" : "text-slate-200 hover:bg-slate-800/80"
                }`}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                role="option"
                aria-selected={active}
              >
                <span className="inline-flex items-center gap-2">
                  <LogoMark
                    src={option.logo}
                    alt={`${option.label} logo`}
                    fallback={fallbackFor(option.id)}
                    size={20}
                  />
                  {option.label}
                </span>
                {active ? <Check className="h-4 w-4 text-cyan-200" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AddressModal({ isOpen, onClose, onSubmit, initial }: AddressModalProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [network, setNetwork] = useState<WalletNetwork>(normalizeWalletNetwork(initial?.network ?? "bitcoin"));
  const [address, setAddress] = useState(initial?.address ?? "");
  const [provider, setProvider] = useState<WalletProvider>(normalizeWalletProvider(initial?.provider ?? "exodus"));
  const [showAddressError, setShowAddressError] = useState(false);

  const title = useMemo(() => (initial ? "Edit connected wallet" : "Connect wallet"), [initial]);
  const addressError = useMemo(() => validateAddressForNetwork(network, address), [network, address]);
  const shouldShowAddressError = Boolean(addressError) && (showAddressError || address.trim().length > 0);
  const canSubmit = address.trim().length > 0 && !addressError;

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

          if (!canSubmit) {
            setShowAddressError(true);
            return;
          }

          onSubmit({
            label: label.trim(),
            network,
            address: address.trim(),
            provider,
          });

          onClose();
        }}
      >
        <LogoDropdown
          label="Wallet provider"
          value={provider}
          onChange={setProvider}
          options={walletProviderOptions}
          fallbackFor={(value) => (value === "trustwallet" ? "TW" : value.slice(0, 2).toUpperCase())}
        />

        <LogoDropdown
          label="Network"
          value={network}
          onChange={setNetwork}
          options={walletNetworkOptions}
          fallbackFor={(value) => (value === "bitcoin" ? "BTC" : "ETH")}
        />

        <label className="block text-sm text-slate-200">
          Address
          <textarea
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setShowAddressError(false);
            }}
            rows={3}
            className={`focus-ring mt-1 w-full rounded-xl border bg-slate-900/70 px-3 py-2 text-sm text-white ${
              shouldShowAddressError ? "border-rose-400/70" : "border-slate-600"
            }`}
            placeholder={network === "bitcoin" ? "bc1..., 1..., or 3..." : "0x..."}
            required
          />
          {shouldShowAddressError ? <p className="mt-1 text-xs text-rose-300">{addressError}</p> : null}
        </label>

        <label className="block text-sm text-slate-200">
          Label (optional)
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="focus-ring mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white"
            placeholder={`${providerById(provider).label} ${networkById(network).label}`}
          />
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Wallet</Button>
        </div>
      </form>
    </Modal>
  );
}
