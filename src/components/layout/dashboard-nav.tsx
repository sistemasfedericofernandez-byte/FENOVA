"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/propiedades", label: "Mis propiedades" },
  { href: "/dashboard/propiedades/nueva", label: "Nueva propiedad" },
  { href: "/dashboard/propiedades/carga-masiva", label: "Carga masiva" },
  { href: "/dashboard/estadisticas", label: "Estadísticas" },
  { href: "/dashboard/suscripcion", label: "Suscripción" },
  { href: "/dashboard/verificacion", label: "Propietario Seguro" },
  { href: "/dashboard/inquilinos", label: "Inquilinos" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 dark:border-zinc-800">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium",
              active
                ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
