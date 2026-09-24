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

/**
 * Genera el link de WhatsApp con un mensaje que le permite a la inmobiliaria
 * identificar el aviso al instante: título, tipo y precio, ubicación y el
 * enlace directo al aviso (al tocarlo abre su propio anuncio).
 */
export function buildWhatsappLink(params: {
  phone: string;
  title: string;
  url: string;
  summary?: string;
  location?: string;
}) {
  const { phone, title, url, summary, location } = params;
  const lines = [
    "Hola! Te escribo por tu aviso en PropiMarket:",
    "",
    `*${title}*`,
    summary,
    location ? `Ubicación: ${location}` : undefined,
    `Ver aviso: ${url}`,
    "",
    "Me gustaría recibir más información. ¡Gracias!",
  ].filter((line): line is string => line !== undefined);

  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(lines.join("\n"))}`;
}
