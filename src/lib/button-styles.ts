import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground shadow-sm shadow-accent/20 hover:bg-accent-strong",
  secondary: "bg-accent-soft text-accent-strong hover:brightness-95",
  ghost: "bg-transparent text-accent-strong hover:bg-accent-soft",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

const baseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-base sm:text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** Clases de botón; sirven tanto para <Button> como para <Link>/<a> (también desde componentes de servidor). */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(baseClasses, variantClasses[variant], className);
}
