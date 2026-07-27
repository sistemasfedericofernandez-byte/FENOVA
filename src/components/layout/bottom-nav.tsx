"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, BellIcon, UserIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function BottomNav({
  isLoggedIn,
  dashboardHref,
}: {
  isLoggedIn: boolean;
  dashboardHref: string;
}) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Inicio", icon: HomeIcon },
    { href: "/propiedades", label: "Buscar", icon: SearchIcon },
    { href: "/alertas", label: "Alertas", icon: BellIcon },
    {
      href: isLoggedIn ? dashboardHref : "/login",
      label: isLoggedIn ? "Mi panel" : "Ingresar",
      icon: UserIcon,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-11 flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium",
              active
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            <Icon width={20} height={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
