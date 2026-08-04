"use client";

import { motion } from "motion/react";

/** Wordmark FENOVA con un trazo dorado natural debajo, como si alguien
 * la subrayara a mano de un solo gesto — una curva simple con un
 * pequeño repunte al final, no un garabato ondulado. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`relative inline-block leading-none ${className ?? ""}`}>
      FENOVA
      <svg
        viewBox="0 0 120 16"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full"
      >
        <motion.path
          d="M3 8.5 Q 40 13.5 78 8 T 114 6.5 L 120 3"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut", delay: 0.25 }}
        />
      </svg>
    </span>
  );
}
