-- Un registro por mes calendario de un contrato de alquiler activo. Se
-- generan de a uno (lazy) cuando la agencia visita la vista de pagos del
-- contrato, no por cron ni trigger — carga manual simple, sin
-- recordatorios automáticos por ahora. El unique de abajo es lo que hace
-- segura esa generación perezosa (insert-if-missing, sin duplicados).
create table rent_payments (
  id uuid primary key default gen_random_uuid(),
  tenancy_id uuid not null references property_tenancies (id) on delete cascade,
  agency_id uuid not null references agencies (id) on delete cascade,
  period_month date not null,
  amount numeric(14, 2),
  price_currency price_currency,
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenancy_id, period_month)
);

create index rent_payments_tenancy_id_idx on rent_payments (tenancy_id);
create index rent_payments_agency_id_idx on rent_payments (agency_id);
create index rent_payments_status_idx on rent_payments (status);

create trigger rent_payments_set_updated_at before update on rent_payments
  for each row execute function set_updated_at();

alter table rent_payments enable row level security;

create policy rent_payments_own_or_admin on rent_payments
  for all using (agency_id = current_agency_id() or is_super_admin())
  with check (agency_id = current_agency_id() or is_super_admin());
