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
