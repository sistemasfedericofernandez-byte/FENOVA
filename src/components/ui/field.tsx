import type { ReactNode } from "react";

/** Campo de formulario con etiqueta visible arriba (más claro que un placeholder,
 * que desaparece al escribir) y una ayuda opcional debajo. */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-semibold text-zinc-800">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-snug text-zinc-600">{hint}</span> : null}
    </label>
  );
}
