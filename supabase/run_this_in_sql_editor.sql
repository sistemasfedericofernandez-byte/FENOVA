-- Extensiones
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('super_admin', 'inmobiliaria', 'hotel', 'dueno_directo', 'afiliado');
create type profile_status as enum ('activo', 'suspendido', 'pendiente_validacion');
create type verification_status as enum ('no_iniciado', 'pendiente', 'aprobado', 'rechazado');
create type subscription_status as enum ('activa', 'pausada', 'vencida', 'cancelada');
create type payment_status as enum ('aprobado', 'rechazado', 'pendiente', 'reembolsado');
create type operation_type as enum ('venta', 'alquiler', 'alquiler_temporal');
create type property_type as enum ('casa', 'departamento', 'terreno', 'local', 'oficina', 'galpon', 'quinta', 'otro');
create type price_currency as enum ('ARS', 'USD');
create type property_status as enum ('borrador', 'publicada', 'oculta', 'pausada_por_impago');
create type bulk_upload_status as enum ('procesando', 'completado', 'completado_con_errores', 'fallido');
create type property_event_type as enum ('view', 'whatsapp_click');
-- 1.1 Usuarios y Roles

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null,
  full_name text,
  phone text,
  whatsapp_number text,
  avatar_url text,
  status profile_status not null default 'activo',
  referred_by_affiliate_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agencies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles (id) on delete cascade,
  business_name text not null,
  cuit text,
  city text not null default 'Corrientes',
  logo_url text,
  is_verified_owner boolean not null default false,
  verification_doc_url text,
  verification_status verification_status not null default 'no_iniciado',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table affiliates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  full_name text not null,
  referral_code text not null unique,
  commission_percent numeric(5, 2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_referred_by_affiliate_id_fkey
  foreign key (referred_by_affiliate_id) references affiliates (id) on delete set null;

-- 1.2 Suscripciones y Pagos

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_ars numeric(12, 2) not null,
  max_active_listings int not null,
  allows_csv_bulk_upload boolean not null default false,
  allows_advanced_stats boolean not null default false,
  mercadopago_plan_id text,
  active boolean not null default true
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null unique references agencies (id) on delete cascade,
  plan_id uuid not null references subscription_plans (id),
  status subscription_status not null default 'pausada',
  mercadopago_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  mercadopago_payment_id text not null unique,
  status payment_status not null,
  amount_ars numeric(12, 2) not null,
  paid_at timestamptz,
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now()
);

-- 1.3 Propiedades

create table neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Corrientes',
  active boolean not null default true,
  unique (name, city)
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  operation_type operation_type not null,
  property_type property_type not null,
  neighborhood_id uuid references neighborhoods (id),
  address_text text,
  lat numeric,
  lng numeric,
  price_amount numeric(14, 2) not null,
  price_currency price_currency not null default 'ARS',
  expenses_amount numeric(14, 2),
  surface_total_m2 numeric,
  surface_covered_m2 numeric,
  bedrooms int,
  bathrooms int,
  features jsonb not null default '{}'::jsonb,
  status property_status not null default 'borrador',
  views_count int not null default 0,
  whatsapp_clicks_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index properties_agency_id_idx on properties (agency_id);
create index properties_status_idx on properties (status);
create index properties_neighborhood_id_idx on properties (neighborhood_id);
create index properties_operation_type_idx on properties (operation_type);

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  cloudinary_public_id text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index property_images_property_id_idx on property_images (property_id);

create table bulk_upload_jobs (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  file_url text not null,
  status bulk_upload_status not null default 'procesando',
  total_rows int not null default 0,
  success_rows int not null default 0,
  error_rows int not null default 0,
  error_log jsonb,
  created_at timestamptz not null default now()
);

-- 1.4 Interacción Pública

create table search_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  operation_type operation_type,
  property_type property_type,
  neighborhood_id uuid references neighborhoods (id),
  price_max numeric,
  raw_query_text text,
  active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

create table property_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  event_type property_event_type not null,
  created_at timestamptz not null default now()
);

create index property_events_property_id_idx on property_events (property_id);

-- 1.5 Sistema Privado de Calificación de Inquilinos

create table tenants_registry (
  id uuid primary key default gen_random_uuid(),
  dni text not null unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table tenant_ratings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants_registry (id) on delete cascade,
  rated_by_agency_id uuid not null references agencies (id),
  score int not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index tenant_ratings_tenant_id_idx on tenant_ratings (tenant_id);

create table tenant_lookup_audit (
  id uuid primary key default gen_random_uuid(),
  dni_queried text not null,
  queried_by_agency_id uuid not null references agencies (id),
  queried_by_profile_id uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create index tenant_lookup_audit_dni_idx on tenant_lookup_audit (dni_queried);

-- 1.6 Backoffice / Métricas

create table neighborhood_roi_snapshot (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods (id) on delete cascade,
  avg_sale_price_m2 numeric,
  avg_rent_price numeric,
  estimated_roi_percent numeric,
  sample_size_sale int not null default 0,
  sample_size_rent int not null default 0,
  calculated_at timestamptz not null default now()
);

create index neighborhood_roi_snapshot_neighborhood_id_idx on neighborhood_roi_snapshot (neighborhood_id);
-- updated_at automático
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger agencies_set_updated_at before update on agencies
  for each row execute function set_updated_at();
create trigger affiliates_set_updated_at before update on affiliates
  for each row execute function set_updated_at();
create trigger subscriptions_set_updated_at before update on subscriptions
  for each row execute function set_updated_at();
create trigger properties_set_updated_at before update on properties
  for each row execute function set_updated_at();

-- Alta automática de profile al registrarse en Supabase Auth.
-- El rol llega en auth.users.raw_user_meta_data->>'role' (seteado por el
-- formulario de registro); si no viene, se asume dueno_directo.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'dueno_directo'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- Incrementa contadores agregados de properties (views_count / whatsapp_clicks_count)
-- desde el endpoint público de tracking, evitando exponer UPDATE directo a anónimos.
create or replace function increment_property_counter(p_property_id uuid, p_column text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_column = 'views_count' then
    update properties set views_count = views_count + 1 where id = p_property_id;
  elsif p_column = 'whatsapp_clicks_count' then
    update properties set whatsapp_clicks_count = whatsapp_clicks_count + 1 where id = p_property_id;
  else
    raise exception 'Columna no permitida: %', p_column;
  end if;
end;
$$;

-- Helper: ¿el usuario autenticado es una inmobiliaria validada? Devuelve su agency_id o null.
create or replace function current_validated_agency_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select a.id
  from agencies a
  join profiles p on p.id = a.profile_id
  where p.id = auth.uid()
    and p.role = 'inmobiliaria'
    and a.verification_status = 'aprobado'
  limit 1;
$$;

-- Búsqueda de antecedentes por DNI. Solo inmobiliarias validadas; cada
-- consulta se audita atómicamente antes de devolver resultados.
create or replace function lookup_tenant_by_dni(p_dni text)
returns table (
  tenant_id uuid,
  full_name text,
  score int,
  comment text,
  rated_by_agency_id uuid,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_agency_id uuid;
begin
  v_agency_id := current_validated_agency_id();

  if v_agency_id is null then
    raise exception 'Acceso denegado: solo inmobiliarias validadas pueden consultar inquilinos';
  end if;

  insert into tenant_lookup_audit (dni_queried, queried_by_agency_id, queried_by_profile_id)
  values (p_dni, v_agency_id, auth.uid());

  return query
    select r.tenant_id, t.full_name, r.score, r.comment, r.rated_by_agency_id, r.created_at
    from tenant_ratings r
    join tenants_registry t on t.id = r.tenant_id
    where t.dni = p_dni
    order by r.created_at desc;
end;
$$;

-- Alta de calificación de inquilino (crea el registro si no existe).
create or replace function rate_tenant_by_dni(
  p_dni text,
  p_full_name text,
  p_score int,
  p_comment text
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_agency_id uuid;
  v_tenant_id uuid;
  v_rating_id uuid;
begin
  v_agency_id := current_validated_agency_id();

  if v_agency_id is null then
    raise exception 'Acceso denegado: solo inmobiliarias validadas pueden calificar inquilinos';
  end if;

  insert into tenants_registry (dni, full_name)
  values (p_dni, p_full_name)
  on conflict (dni) do update set full_name = coalesce(excluded.full_name, tenants_registry.full_name)
  returning id into v_tenant_id;

  insert into tenant_ratings (tenant_id, rated_by_agency_id, score, comment)
  values (v_tenant_id, v_agency_id, p_score, p_comment)
  returning id into v_rating_id;

  return v_rating_id;
end;
$$;
-- Helper: ¿el usuario autenticado es super_admin?
create or replace function is_super_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Helper: agency_id del usuario autenticado (si tiene una agencia propia).
create or replace function current_agency_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select id from agencies where profile_id = auth.uid() limit 1;
$$;

alter table profiles enable row level security;
alter table agencies enable row level security;
alter table affiliates enable row level security;
alter table subscription_plans enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table neighborhoods enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table bulk_upload_jobs enable row level security;
alter table search_alerts enable row level security;
alter table property_events enable row level security;
alter table tenants_registry enable row level security;
alter table tenant_ratings enable row level security;
alter table tenant_lookup_audit enable row level security;
alter table neighborhood_roi_snapshot enable row level security;

-- profiles: cada usuario ve/edita el suyo; super_admin ve todos.
create policy profiles_select_own_or_admin on profiles
  for select using (id = auth.uid() or is_super_admin());
create policy profiles_update_own_or_admin on profiles
  for update using (id = auth.uid() or is_super_admin());

-- agencies: público puede leer datos básicos (para mostrar en el frontend
-- de propiedades); dueño y super_admin pueden modificar.
create policy agencies_select_public on agencies
  for select using (true);
create policy agencies_insert_own on agencies
  for insert with check (profile_id = auth.uid());
create policy agencies_update_own_or_admin on agencies
  for update using (profile_id = auth.uid() or is_super_admin());

-- affiliates: solo super_admin.
create policy affiliates_admin_only on affiliates
  for all using (is_super_admin()) with check (is_super_admin());

-- subscription_plans: lectura pública de planes activos; escritura solo admin.
create policy subscription_plans_select_public on subscription_plans
  for select using (active = true or is_super_admin());
create policy subscription_plans_admin_write on subscription_plans
  for insert with check (is_super_admin());
create policy subscription_plans_admin_update on subscription_plans
  for update using (is_super_admin());

-- subscriptions: la agencia ve/gestiona la suya; admin ve todas.
create policy subscriptions_select_own_or_admin on subscriptions
  for select using (agency_id = current_agency_id() or is_super_admin());
create policy subscriptions_admin_write on subscriptions
  for all using (is_super_admin()) with check (is_super_admin());

-- payments: solo la agencia dueña de la suscripción o admin.
create policy payments_select_own_or_admin on payments
  for select using (
    exists (
      select 1 from subscriptions s
      where s.id = payments.subscription_id
        and (s.agency_id = current_agency_id() or is_super_admin())
    )
  );

-- neighborhoods: lectura pública; escritura solo admin.
create policy neighborhoods_select_public on neighborhoods
  for select using (true);
create policy neighborhoods_admin_write on neighborhoods
  for all using (is_super_admin()) with check (is_super_admin());

-- properties: público solo ve publicadas; la agencia dueña ve/edita todo lo suyo; admin todo.
create policy properties_select_public on properties
  for select using (
    status = 'publicada' or agency_id = current_agency_id() or is_super_admin()
  );
create policy properties_insert_own on properties
  for insert with check (agency_id = current_agency_id());
create policy properties_update_own_or_admin on properties
  for update using (agency_id = current_agency_id() or is_super_admin());
create policy properties_delete_own_or_admin on properties
  for delete using (agency_id = current_agency_id() or is_super_admin());

-- property_images: sigue la visibilidad de la propiedad.
create policy property_images_select_public on property_images
  for select using (
    exists (
      select 1 from properties p
      where p.id = property_images.property_id
        and (p.status = 'publicada' or p.agency_id = current_agency_id() or is_super_admin())
    )
  );
create policy property_images_write_own on property_images
  for all using (
    exists (
      select 1 from properties p
      where p.id = property_images.property_id
        and (p.agency_id = current_agency_id() or is_super_admin())
    )
  ) with check (
    exists (
      select 1 from properties p
      where p.id = property_images.property_id
        and (p.agency_id = current_agency_id() or is_super_admin())
    )
  );

-- bulk_upload_jobs: solo la agencia dueña o admin.
create policy bulk_upload_jobs_own_or_admin on bulk_upload_jobs
  for all using (agency_id = current_agency_id() or is_super_admin())
  with check (agency_id = current_agency_id() or is_super_admin());

-- search_alerts: inserción pública (anónimos dejan su email); lectura solo admin.
create policy search_alerts_insert_public on search_alerts
  for insert with check (true);
create policy search_alerts_select_admin on search_alerts
  for select using (is_super_admin());

-- property_events: inserción pública vía RPC/endpoint; lectura de la agencia dueña o admin.
create policy property_events_insert_public on property_events
  for insert with check (true);
create policy property_events_select_own_or_admin on property_events
  for select using (
    exists (
      select 1 from properties p
      where p.id = property_events.property_id
        and (p.agency_id = current_agency_id() or is_super_admin())
    )
  );

-- tenants_registry / tenant_ratings / tenant_lookup_audit:
-- SIN policies de acceso directo desde el cliente. Todo pasa por las
-- funciones SECURITY DEFINER lookup_tenant_by_dni / rate_tenant_by_dni,
-- que validan el rol y auditan cada consulta. Solo super_admin puede
-- inspeccionar estas tablas directamente (soporte/legal).
create policy tenants_registry_admin_only on tenants_registry
  for select using (is_super_admin());
create policy tenant_ratings_admin_only on tenant_ratings
  for select using (is_super_admin());
create policy tenant_lookup_audit_admin_only on tenant_lookup_audit
  for select using (is_super_admin());

-- neighborhood_roi_snapshot: módulo oculto, solo super_admin.
create policy neighborhood_roi_snapshot_admin_only on neighborhood_roi_snapshot
  for select using (is_super_admin());
insert into subscription_plans (name, slug, price_ars, max_active_listings, allows_csv_bulk_upload, allows_advanced_stats)
values
  ('Básico', 'basico', 15000, 10, false, false),
  ('Profesional', 'profesional', 35000, 50, true, true),
  ('Premium', 'premium', 65000, 200, true, true)
on conflict (slug) do nothing;

insert into neighborhoods (name, city)
values
  ('Centro', 'Corrientes'),
  ('Cambá Cué', 'Corrientes'),
  ('Laguna Seca', 'Corrientes'),
  ('Molina Punta', 'Corrientes'),
  ('San Benito', 'Corrientes'),
  ('Punta Tacuara', 'Corrientes'),
  ('Yapeyú', 'Corrientes'),
  ('Bajada Vieja', 'Corrientes')
on conflict (name, city) do nothing;
