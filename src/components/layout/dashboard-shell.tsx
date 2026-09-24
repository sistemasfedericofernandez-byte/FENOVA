"use client";

import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/layout/sign-out-button";
import {
  BuildingIcon,
  CardIcon,
  ChartIcon,
  CloseIcon,
  ExternalIcon,
  HomeIcon,
  ImportIcon,
  KeyIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database.types";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};
type NavGroup = { title?: string; items: NavItem[] };

const AGENCY_NAV: NavGroup[] = [
  { items: [{ href: "/dashboard", label: "Inicio", icon: HomeIcon }] },
  {
    title: "Propiedades",
    items: [
      { href: "/dashboard/propiedades", label: "Mis propiedades", icon: BuildingIcon },
      { href: "/dashboard/propiedades/nueva", label: "Publicar propiedad", icon: PlusIcon },
      { href: "/dashboard/propiedades/importar", label: "Importar de Facebook", icon: ImportIcon },
      { href: "/dashboard/propiedades/carga-masiva", label: "Carga masiva", icon: UploadIcon },
    ],
  },
  {
    title: "Gestión",
    items: [
      { href: "/dashboard/alquileres", label: "Alquileres", icon: KeyIcon },
      { href: "/dashboard/propietarios", label: "Propietarios", icon: UsersIcon },
      { href: "/dashboard/estadisticas", label: "Estadísticas", icon: ChartIcon },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      { href: "/dashboard/perfil", label: "Perfil", icon: UserIcon },
      { href: "/dashboard/suscripcion", label: "Suscripción", icon: CardIcon },
      { href: "/dashboard/verificacion", label: "Propietario Seguro", icon: ShieldIcon },
      { href: "/dashboard/inquilinos", label: "Calificar inquilinos", icon: SearchIcon },
    ],
  },
];

const HOTEL_NAV: NavGroup[] = [
  {
    items: [
      { href: "/dashboard/hotel", label: "Mi hotel", icon: BuildingIcon },
      { href: "/dashboard/estadisticas", label: "Estadísticas", icon: ChartIcon },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      { href: "/dashboard/suscripcion", label: "Suscripción", icon: CardIcon },
      { href: "/dashboard/verificacion", label: "Propietario Seguro", icon: ShieldIcon },
    ],
  },
];

function findActiveHref(pathname: string, groups: NavGroup[]) {
  if (pathname.includes("/alquilar")) return "/dashboard/alquileres";

  let best: string | null = null;
  for (const item of groups.flatMap((g) => g.items)) {
    const matches =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.length)) best = item.href;
  }
  return best;
}

function NavList({
  groups,
  activeHref,
  onNavigate,
}: {
  groups: NavGroup[];
  activeHref: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-5" aria-label="Menú del panel">
      {groups.map((group, index) => (
        <div key={group.title ?? index} className="flex flex-col gap-1">
          {group.title ? (
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
              {group.title}
            </p>
          ) : null}
          {group.items.map((item) => {
            const active = item.href === activeHref;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors",
                  active
                    ? "bg-white text-[#0d2740] shadow-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className={active ? "text-[#b6862f]" : "text-white/70"} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({
  groups,
  activeHref,
  agencyName,
  onNavigate,
}: {
  groups: NavGroup[];
  activeHref: string | null;
  agencyName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Link href="/dashboard" onClick={onNavigate} className="px-3 pt-1">
        <Logo className="text-[22px] font-extrabold tracking-tight text-white" />
      </Link>

      <div className="flex-1 overflow-y-auto pr-1">
        <NavList groups={groups} activeHref={activeHref} onNavigate={onNavigate} />
      </div>

      <div className="flex flex-col gap-1 border-t border-white/15 pt-4">
        <p className="truncate px-3 pb-1 text-sm font-semibold text-white" title={agencyName}>
          {agencyName}
        </p>
        <Link
          href="/"
          target="_blank"
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-white/90 hover:bg-white/10"
        >
          <ExternalIcon className="text-white/70" />
          Ver sitio público
        </Link>
        <SignOutButton className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-white/90 hover:bg-white/10">
          <LogoutIcon className="text-white/70" />
        </SignOutButton>
      </div>
    </div>
  );
}

export function DashboardShell({
  role,
  agencyName,
  children,
}: {
  role?: UserRole;
  agencyName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // El menú del celular se cierra solo al cambiar de pantalla: queda abierto
  // únicamente mientras la ruta sea la misma en la que se abrió.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const groups = role === "hotel" ? HOTEL_NAV : AGENCY_NAV;
  const activeHref = findActiveHref(pathname, groups);


  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17.5rem_1fr]">
      {/* Menú lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-screen bg-[#0d2740] p-5 lg:block">
        <SidebarContent groups={groups} activeHref={activeHref} agencyName={agencyName} />
      </aside>

      {/* Barra superior (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#0d2740] px-4 py-3 lg:hidden">
        <Link href="/dashboard">
          <Logo className="text-xl font-extrabold tracking-tight text-white" />
        </Link>
        <button
          type="button"
          onClick={() => setOpenPath(pathname)}
          aria-label="Abrir menú"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10"
        >
          <MenuIcon />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpenPath(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute left-0 top-0 h-full w-[18rem] max-w-[85vw] bg-[#0d2740] p-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpenPath(null)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
            >
              <CloseIcon />
            </button>
            <SidebarContent
              groups={groups}
              activeHref={activeHref}
              agencyName={agencyName}
              onNavigate={() => setOpenPath(null)}
            />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
