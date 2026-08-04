export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatArs(amount: number, currency: "ARS" | "USD" = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Genera el link de WhatsApp con mensaje predefinido, incluyendo el ID de la propiedad. */
export function buildWhatsappLink(params: {
  phone: string;
  propertyId: string;
  propertyTitle: string;
}) {
  const { phone, propertyId, propertyTitle } = params;
  const message = `Hola! Te escribo por la propiedad "${propertyTitle}" (ID: ${propertyId}) que vi en FENOVA.`;
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
