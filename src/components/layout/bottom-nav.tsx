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
      className="glass-strong fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-[28px] px-2 backdrop-blur-2xl backdrop-saturate-150 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex min-w-11 flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-semibold"
          >
            <motion.span
              animate={{
                backgroundColor: active ? "var(--accent-soft)" : "rgba(0,0,0,0)",
                scale: active ? 1 : 0.9,
              }}
              transition={springSoft}
              className="flex h-8 w-11 items-center justify-center rounded-full"
            >
              <span
                className={cn(active ? "text-accent-strong" : "text-foreground/40")}
              >
                <Icon width={19} height={19} />
              </span>
            </motion.span>
            <span
              className={cn(active ? "text-accent-strong" : "text-foreground/40")}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
