"use client";

import { motion } from "motion/react";

/** Wordmark FENOVA con un trazo dorado tipo firma debajo — no un subrayado recto. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`relative inline-block leading-none ${className ?? ""}`}>
      FENOVA
      <svg
        viewBox="0 0 120 20"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full"
      >
        <motion.path
          d="M2 8 C 18 15, 30 2, 46 9 S 76 16, 92 6 S 112 8, 118 11"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
        />
      </svg>
    </span>
  );
}
