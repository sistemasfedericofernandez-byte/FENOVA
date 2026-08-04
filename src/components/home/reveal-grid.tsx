"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { staggerContainer } from "@/lib/motion";

export function RevealGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={staggerContainer}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {children}
    </motion.div>
  );
}
