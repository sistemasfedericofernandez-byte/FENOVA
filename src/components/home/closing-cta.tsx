"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeInUp, staggerContainer, springSnappy } from "@/lib/motion";

export function ClosingCta() {
  return (
    <section className="w-full px-4 py-16 sm:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={staggerContainer}
        className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          ¿Tenés una <span className="text-accent-strong">inmobiliaria</span>,
          hotel o propiedad para publicar?
        </motion.h2>
        <motion.p variants={fadeInUp} className="max-w-md text-sm text-foreground/60">
          Sumate a FENOVA y llegá a quienes buscan propiedades y hoteles en
          Corrientes todos los días.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }} transition={springSnappy}>
            <Link
              href="/registro"
              className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-colors hover:bg-accent-strong"
            >
              Crear cuenta gratis
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
