/**
 * Envío de emails vía Resend (https://resend.com). Si RESEND_API_KEY no
 * está configurada, el envío se omite silenciosamente (solo se loguea) en
 * vez de romper el flujo — así el matching de alertas funciona igual,
 * queda listo para mandar emails el día que carguemos la API key.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[resend] RESEND_API_KEY no configurada, se omite envío a ${params.to}`);
    return { sent: false as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "FENOVA <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[resend] error enviando email:", text);
    return { sent: false as const, error: text };
  }

  return { sent: true as const };
}
