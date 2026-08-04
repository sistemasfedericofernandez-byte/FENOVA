"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export function HomeHero({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex flex-col items-center gap-4 px-6 py-16 text-center sm:py-24">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-5"
      >
        <motion.h1
          variants={fadeInUp}
          className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl"
        >
          Encontrá tu <span className="text-accent-strong">próximo lugar</span>
          <br className="hidden sm:block" /> en Corrientes
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="max-w-md text-base text-foreground/60"
        >
          Propiedades y hoteles en venta, alquiler o alquiler temporal, sin
          necesidad de registrarte.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
