"use client";

import type { ComponentProps } from "react";
import { motion } from "motion/react";
import { buttonClass, type ButtonVariant } from "@/lib/button-styles";
import { springSnappy } from "@/lib/motion";

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof motion.button> & { variant?: ButtonVariant }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      className={buttonClass(variant, className)}
      {...props}
    />
  );
}
