"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function SiteHeader({
  isLoggedIn,
  dashboardHref,
}: {
  isLoggedIn: boolean;
  dashboardHref: string;
}) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/propiedades", label: "Propiedades" },
    { href: "/hoteles", label: "Hoteles" },
    { href: "/alertas", label: "Alertas" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold" onClick={() => setOpen(false)}>
          Argentina Inmuebles
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                Mi panel
              </Link>
              <SignOutButton className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              Ingresar
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          className="flex h-11 w-11 items-center justify-center rounded-lg sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6l-12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <nav className="flex flex-col border-t border-zinc-200 px-4 py-2 sm:hidden dark:border-zinc-800">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium"
              >
                Mi panel
              </Link>
              <SignOutButton className="flex min-h-11 items-center text-left text-sm font-medium" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      ) : null}
    </header>
  );
}
