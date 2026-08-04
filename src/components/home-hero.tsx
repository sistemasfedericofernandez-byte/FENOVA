"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export function HomeHero({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex flex-col items-center gap-4 overflow-hidden px-6 py-16 text-center sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/20" />
        <div
          className="animate-float-blob absolute -right-16 top-10 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/15"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="animate-float-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-500/10"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-4"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl font-bold tracking-tight sm:text-5xl"
        >
          FENOVA
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="max-w-md text-base text-zinc-600 dark:text-zinc-400"
        >
          Marketplace inmobiliario de Corrientes. Buscá propiedades y hoteles
          en venta, alquiler o alquiler temporal sin necesidad de registrarte.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
