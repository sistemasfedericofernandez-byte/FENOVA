"use client";

import { motion } from "motion/react";
import { buildWhatsappLink } from "@/lib/utils";
import { springSnappy } from "@/lib/motion";

export function WhatsappButton({
  phone,
  propertyId,
  propertyTitle,
  kind = "property",
}: {
  phone: string;
  propertyId: string;
  propertyTitle: string;
  kind?: "property" | "hotel";
}) {
  const href = buildWhatsappLink({ phone, propertyId, propertyTitle });
  const endpoint =
    kind === "hotel" ? "/api/hotels/track-event" : "/api/properties/track-event";
  const idField = kind === "hotel" ? "hotelId" : "propertyId";

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      onClick={() => {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [idField]: propertyId, eventType: "whatsapp_click" }),
          keepalive: true,
        }).catch(() => {});
      }}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 font-medium text-white shadow-lg shadow-green-600/25 transition-colors hover:bg-green-700 active:bg-green-800"
    >
      Contactar por WhatsApp
    </motion.a>
  );
}
