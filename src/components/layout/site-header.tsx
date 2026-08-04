"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { springSnappy } from "@/lib/motion";

export function SiteHeader({
  isLoggedIn,
  dashboardHref,
}: {
  isLoggedIn: boolean;
  dashboardHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  const navLinks = [
    { href: "/propiedades", label: "Propiedades" },
    { href: "/hoteles", label: "Hoteles" },
    { href: "/alertas", label: "Alertas" },
  ];

  return (
    <motion.header
      animate={{
        boxShadow: scrolled
          ? "0 1px 0 0 rgba(10,10,12,0.06), 0 8px 24px -12px rgba(10,10,12,0.12)"
          : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/75"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-[17px] font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          FENOVA
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                Mi panel
              </Link>
              <SignOutButton className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" />
            </>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy}>
              <Link
                href="/login"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-zinc-900"
              >
                Ingresar
              </Link>
            </motion.div>
          )}
        </nav>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={springSnappy}
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
            <motion.path
              animate={open ? { d: "M6 6l12 12M18 6l-12 12" } : { d: "M4 7h16M4 12h16M4 17h16" }}
              transition={{ duration: 0.2 }}
            />
          </svg>
        </motion.button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col overflow-hidden border-t border-zinc-200 px-4 sm:hidden dark:border-zinc-800"
          >
            <div className="flex flex-col py-2">
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
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
