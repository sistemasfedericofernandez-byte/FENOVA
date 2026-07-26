import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

/**
 * Planes de suscripción (PreApprovalPlan). En esta cuenta, crear un
 * `preapproval` standalone sin `preapproval_plan_id` devuelve 500 — el
 * flujo que funciona es: crear un preapproval_plan (con external_reference
 * = agency_id) y redirigir al `init_point` que ese plan trae consigo.
 */
export const preApprovalPlanClient = new PreApprovalPlan(client);

/** Suscripciones recurrentes (PreApproval = "Suscripciones" de MercadoPago). */
export const preApprovalClient = new PreApproval(client);

/** Consulta de pagos individuales, usada al recibir un webhook. */
export const paymentClient = new Payment(client);

export default client;
