-- CRM privado de la agencia: el dueño real de cada inmueble, distinto del
-- inquilino/garante (property_tenancies). No tiene login ni rol propio —
-- es solo un registro interno de contacto.
create table owners (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  full_name text not null,
  dni_cuit text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index owners_agency_id_idx on owners (agency_id);

create trigger owners_set_updated_at before update on owners
  for each row execute function set_updated_at();

alter table owners enable row level security;

create policy owners_select_own_or_admin on owners
  for select using (agency_id = current_agency_id() or is_super_admin());
create policy owners_insert_own on owners
  for insert with check (agency_id = current_agency_id());
create policy owners_update_own_or_admin on owners
  for update using (agency_id = current_agency_id() or is_super_admin());
create policy owners_delete_own_or_admin on owners
  for delete using (agency_id = current_agency_id() or is_super_admin());

-- Vínculo opcional propiedad -> propietario. Nullable: propiedades
-- existentes no tienen uno asignado todavía. on delete set null para que
-- borrar un propietario nunca rompa una propiedad.
alter table properties add column owner_id uuid references owners (id) on delete set null;
create index properties_owner_id_idx on properties (owner_id);
