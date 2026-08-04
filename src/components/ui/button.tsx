"use client";

import type { ComponentProps } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground shadow-sm shadow-accent/20 hover:bg-accent-strong",
  secondary: "bg-accent-soft text-accent-strong hover:brightness-95 dark:text-accent-strong",
  ghost: "bg-transparent hover:bg-accent-soft",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof motion.button> & { variant?: ButtonVariant }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-base sm:text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
