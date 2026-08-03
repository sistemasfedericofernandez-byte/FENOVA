"use client";

import { useEffect, useRef } from "react";

/** Registra una vista de la ficha (propiedad u hotel) una sola vez por carga de página. */
export function ViewTracker({
  propertyId,
  kind = "property",
}: {
  propertyId: string;
  kind?: "property" | "hotel";
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const endpoint =
      kind === "hotel" ? "/api/hotels/track-event" : "/api/properties/track-event";
    const idField = kind === "hotel" ? "hotelId" : "propertyId";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [idField]: propertyId, eventType: "view" }),
      keepalive: true,
    }).catch(() => {});
  }, [propertyId, kind]);

  return null;
}
