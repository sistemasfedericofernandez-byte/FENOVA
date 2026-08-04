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
        backgroundColor: scrolled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0)",
        boxShadow: scrolled
          ? "0 8px 24px -14px rgba(27,31,25,0.18)"
          : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="sticky top-0 z-40 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-[19px] font-extrabold tracking-tight text-accent-strong"
          onClick={() => setOpen(false)}
        >
          FENOVA
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-accent-soft hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-accent-soft hover:text-foreground"
              >
                Mi panel
              </Link>
              <SignOutButton className="rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-accent-soft hover:text-foreground" />
            </>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy} className="ml-1">
              <Link
                href="/login"
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/25"
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
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-sm shadow-black/5 sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
            className="mx-4 overflow-hidden rounded-2xl bg-surface shadow-lg shadow-black/5 sm:hidden"
          >
            <div className="flex flex-col p-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-accent-soft"
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-accent-soft"
                  >
                    Mi panel
                  </Link>
                  <SignOutButton className="flex min-h-11 items-center rounded-xl px-3 text-left text-sm font-semibold hover:bg-accent-soft" />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold hover:bg-accent-soft"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-accent-strong hover:bg-accent-soft"
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
