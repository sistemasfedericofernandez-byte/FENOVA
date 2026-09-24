import type { ReactNode } from "react";

/** Encabezado estándar de cada pantalla del panel: título claro, una línea
 * que explica para qué sirve la pantalla y (opcional) la acción principal. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-[#0d2740] sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-[15px] leading-relaxed text-zinc-700">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const TONES = {
  green: "bg-emerald-100 text-emerald-900",
  amber: "bg-amber-100 text-amber-900",
  blue: "bg-sky-100 text-sky-900",
  gray: "bg-zinc-200 text-zinc-800",
  red: "bg-red-100 text-red-900",
} as const;

export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
