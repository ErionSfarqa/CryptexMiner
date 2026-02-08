import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border border-cyan-200/30 bg-[linear-gradient(135deg,#45e1d6_0%,#1eb7ad_90%)] text-slate-950 shadow-[0_14px_30px_rgba(33,206,194,0.3)] hover:brightness-105",
  secondary:
    "border border-white/20 bg-slate-900/70 text-slate-100 hover:border-cyan-300/45 hover:bg-slate-800/75",
  ghost: "border border-transparent bg-transparent text-slate-300 hover:bg-slate-800/65 hover:text-white",
  danger: "border border-rose-300/30 bg-rose-600/90 text-white shadow-[0_12px_28px_rgba(244,63,94,0.2)] hover:bg-rose-500",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
});


