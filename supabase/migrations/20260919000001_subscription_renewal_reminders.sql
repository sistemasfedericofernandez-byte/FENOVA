-- Registra para qué período ya se mandó el recordatorio de renovación, así
-- el cron diario no manda el mismo email varios días seguidos mientras la
-- suscripción sigue dentro de la ventana de aviso (p. ej. 3 días antes del
-- próximo débito automático de Mercado Pago).
alter table subscriptions add column if not exists renewal_reminder_period_end date;
