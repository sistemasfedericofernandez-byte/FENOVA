import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import type { OperationType, PriceCurrency, PropertyType } from "@/types/database.types";

type NewPublishedProperty = {
  id: string;
  slug: string;
  title: string;
  operationType: OperationType;
  propertyType: PropertyType;
  neighborhoodId: string | null | undefined;
  priceAmount: number;
  priceCurrency: PriceCurrency;
};

/**
 * Busca alertas activas que coincidan con una propiedad recién publicada y
 * les manda un email. Se llama desde createProperty / setPropertyStatus /
 * bulkCreateProperties cada vez que algo pasa a "publicada".
 *
 * `price_max` en `search_alerts` es un número sin moneda propia, así que
 * por ahora solo evaluamos coincidencias de precio contra propiedades en
 * ARS para evitar falsos positivos comparando ARS con USD.
 */
export async function notifyMatchingAlerts(property: NewPublishedProperty) {
  const supabase = createAdminClient();

  const { data: alerts } = await supabase
    .from("search_alerts")
    .select("id, email, operation_type, property_type, neighborhood_id, price_max")
    .eq("active", true);

  const matches = (alerts ?? []).filter((alert) => {
    if (alert.operation_type && alert.operation_type !== property.operationType)
      return false;
    if (alert.property_type && alert.property_type !== property.propertyType)
      return false;
    if (alert.neighborhood_id && alert.neighborhood_id !== property.neighborhoodId)
      return false;
    if (alert.price_max) {
      if (property.priceCurrency !== "ARS") return false;
      if (property.priceAmount > alert.price_max) return false;
    }
    return true;
  });

  for (const alert of matches) {
    await sendEmail({
      to: alert.email,
      subject: `Nueva propiedad que puede interesarte: ${property.title}`,
      html: `
        <p>Encontramos una propiedad publicada en Argentina Inmuebles que coincide con tu búsqueda:</p>
        <p><strong>${property.title}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/propiedades/${property.slug}">Ver propiedad</a></p>
      `,
    });

    await supabase
      .from("search_alerts")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", alert.id);
  }

  return { matched: matches.length };
}
