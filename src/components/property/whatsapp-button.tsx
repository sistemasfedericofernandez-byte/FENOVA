"use client";

import { buildWhatsappLink } from "@/lib/utils";

export function WhatsappButton({
  phone,
  propertyId,
  propertyTitle,
}: {
  phone: string;
  propertyId: string;
  propertyTitle: string;
}) {
  const href = buildWhatsappLink({ phone, propertyId, propertyTitle });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        fetch("/api/properties/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, eventType: "whatsapp_click" }),
          keepalive: true,
        }).catch(() => {});
      }}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 font-medium text-white transition-colors hover:bg-green-700 active:bg-green-800"
    >
      Contactar por WhatsApp
    </a>
  );
}
