"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HomeIcon, SearchIcon, BellIcon, UserIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { springSoft } from "@/lib/motion";

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
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-zinc-200/70 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden dark:border-zinc-800/70 dark:bg-zinc-950/85"
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex min-w-11 flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium"
          >
            {active ? (
              <motion.span
                layoutId="bottom-nav-pill"
                transition={springSoft}
                className="absolute inset-x-2 top-0 h-8 rounded-xl bg-zinc-900/[0.06] dark:bg-white/10"
              />
            ) : null}
            <motion.span
              animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
              transition={springSoft}
              className={cn(
                "relative z-10",
                active ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              <Icon width={20} height={20} />
            </motion.span>
            <span
              className={cn(
                "relative z-10",
                active ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
