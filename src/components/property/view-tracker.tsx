"use client";

import { useEffect, useRef } from "react";

/** Registra una vista de la ficha una sola vez por carga de página. */
export function ViewTracker({ propertyId }: { propertyId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch("/api/properties/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, eventType: "view" }),
      keepalive: true,
    }).catch(() => {});
  }, [propertyId]);

  return null;
}
