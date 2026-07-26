"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/metricas", label: "Métricas" },
  { href: "/admin/afiliados", label: "Afiliados" },
  { href: "/admin/verificaciones", label: "Verificaciones" },
  { href: "/admin/roi", label: "Inteligencia Inversora" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-800 px-4">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium",
              active
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
