-- Cuando una propiedad se alquila, la inmobiliaria la "cierra" (deja de
-- verse en el sitio público) pero necesita conservar un registro privado
-- de quién quedó viviendo ahí: inquilino, garante, DNI, fechas y monto.
-- Nuevo estado de propiedad, distinto de "oculta" (que es para pausas
-- manuales o impago de suscripción) para que el motivo quede explícito.
alter type property_status add value if not exists 'alquilada';

create table property_tenancies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  agency_id uuid not null references agencies (id) on delete cascade,
  status text not null default 'activo' check (status in ('activo', 'finalizado')),
  tenant_full_name text not null,
  tenant_dni text,
  guarantor_full_name text,
  guarantor_dni text,
  monthly_rent_amount numeric(14, 2),
  price_currency price_currency,
  start_date date,
  end_date date,
  notes text,
  -- Respaldo de que la inmobiliaria confirmó contar con el consentimiento
  -- del inquilino/garante para cargar sus datos (Ley 25.326).
  data_consent_confirmed_at timestamptz,
  -- Si la inmobiliaria pide borrar los datos personales de un contrato ya
  -- finalizado, se anonimizan los campos identificatorios y se deja esta
  -- marca de cuándo se hizo (el registro histórico del alquiler en sí no
  -- se borra, solo los datos personales de las personas involucradas).
  personal_data_erased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index property_tenancies_property_id_idx on property_tenancies (property_id);
create index property_tenancies_agency_id_idx on property_tenancies (agency_id);

create trigger property_tenancies_set_updated_at before update on property_tenancies
  for each row execute function set_updated_at();

alter table property_tenancies enable row level security;

-- Datos personales sensibles (DNI de inquilino y garante): nunca públicos,
-- solo la agencia dueña de la propiedad (o super_admin) puede leerlos o
-- tocarlos.
create policy property_tenancies_own_or_admin on property_tenancies
  for all using (agency_id = current_agency_id() or is_super_admin())
  with check (agency_id = current_agency_id() or is_super_admin());
