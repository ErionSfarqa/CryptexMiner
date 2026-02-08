"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: number;
  className?: string;
}

export function LogoMark({ src, alt, fallback, size = 20, className }: LogoMarkProps) {
  const genericFallbackSrc = "/wallet-logos/generic.png";
  const [erroredSources, setErroredSources] = useState<Record<string, true>>({});
  const [genericFailed, setGenericFailed] = useState(false);
  const source = src?.trim() ?? "";
  const sourceErrored = source.length > 0 ? Boolean(erroredSources[source]) : false;
  const currentSrc = sourceErrored ? genericFallbackSrc : source;

  if (!currentSrc || (sourceErrored && genericFailed)) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-slate-600/70 bg-slate-800 text-[10px] font-semibold uppercase text-slate-100",
          className,
        )}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-md", className)}
      onError={() => {
        if (currentSrc !== genericFallbackSrc) {
          setErroredSources((previous) => ({
            ...previous,
            [source]: true,
          }));
          return;
        }

        setGenericFailed(true);
      }}
    />
  );
}
