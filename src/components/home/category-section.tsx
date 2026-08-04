"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type Tone = "plain" | "tint";

const TONE_PANEL: Record<Tone, string> = {
  plain: "bg-surface/80",
  tint: "bg-accent-soft/70",
};

export function CategorySection({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
  tone,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href: string;
  hrefLabel: string;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <section className="w-full px-4 py-6 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-7 rounded-[32px] px-5 py-10 backdrop-blur-sm sm:px-10 sm:py-14",
          TONE_PANEL[tone],
        )}
      >
        <motion.div variants={fadeInUp} className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent-strong">
            {eyebrow}
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
            <Link
              href={href}
              className="text-sm font-semibold text-accent-strong underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              {hrefLabel} →
            </Link>
          </div>
          {description ? (
            <p className="max-w-xl text-sm text-foreground/60">{description}</p>
          ) : null}
        </motion.div>

        {children}
      </motion.div>
    </section>
  );
}
