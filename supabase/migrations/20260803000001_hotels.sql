-- Sección de Hoteles: entidad propia, distinta de "properties". Un hotel no
-- es una unidad que se vende/alquila una vez, es un establecimiento completo
-- con habitaciones, precio por noche y amenities — por eso va en tablas
-- separadas en vez de forzarlo dentro del esquema de propiedades. Reutiliza
-- los enums property_status y property_event_type (mismo ciclo de vida
-- borrador/publicada/oculta y mismos eventos view/whatsapp_click).

create table hotels (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null unique references agencies (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  neighborhood_id uuid references neighborhoods (id),
  address_text text,
  lat numeric,
  lng numeric,
  star_rating int check (star_rating between 1 and 5),
  price_per_night numeric(12, 2) not null,
  price_currency price_currency not null default 'ARS',
  total_rooms int,
  amenities jsonb not null default '[]'::jsonb,
  status property_status not null default 'borrador',
  views_count int not null default 0,
  whatsapp_clicks_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index hotels_neighborhood_id_idx on hotels (neighborhood_id);
create index hotels_status_idx on hotels (status);

create table hotel_images (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels (id) on delete cascade,
  cloudinary_public_id text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index hotel_images_hotel_id_idx on hotel_images (hotel_id);

create table hotel_events (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels (id) on delete cascade,
  event_type property_event_type not null,
  created_at timestamptz not null default now()
);

create index hotel_events_hotel_id_idx on hotel_events (hotel_id);

create trigger hotels_set_updated_at before update on hotels
  for each row execute function set_updated_at();

-- Incrementa contadores agregados de hotels (views_count / whatsapp_clicks_count)
-- desde el endpoint público de tracking, igual que increment_property_counter.
create or replace function increment_hotel_counter(p_hotel_id uuid, p_column text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_column = 'views_count' then
    update hotels set views_count = views_count + 1 where id = p_hotel_id;
  elsif p_column = 'whatsapp_clicks_count' then
    update hotels set whatsapp_clicks_count = whatsapp_clicks_count + 1 where id = p_hotel_id;
  else
    raise exception 'Columna no permitida: %', p_column;
  end if;
end;
$$;

alter table hotels enable row level security;
alter table hotel_images enable row level security;
alter table hotel_events enable row level security;

-- hotels: público solo ve publicados; la agencia dueña ve/edita todo lo suyo; admin todo.
create policy hotels_select_public on hotels
  for select using (
    status = 'publicada' or agency_id = current_agency_id() or is_super_admin()
  );
create policy hotels_insert_own on hotels
  for insert with check (agency_id = current_agency_id());
create policy hotels_update_own_or_admin on hotels
  for update using (agency_id = current_agency_id() or is_super_admin());
create policy hotels_delete_own_or_admin on hotels
  for delete using (agency_id = current_agency_id() or is_super_admin());

-- hotel_images: sigue la visibilidad del hotel.
create policy hotel_images_select_public on hotel_images
  for select using (
    exists (
      select 1 from hotels h
      where h.id = hotel_images.hotel_id
        and (h.status = 'publicada' or h.agency_id = current_agency_id() or is_super_admin())
    )
  );
create policy hotel_images_write_own on hotel_images
  for all using (
    exists (
      select 1 from hotels h
      where h.id = hotel_images.hotel_id
        and (h.agency_id = current_agency_id() or is_super_admin())
    )
  ) with check (
    exists (
      select 1 from hotels h
      where h.id = hotel_images.hotel_id
        and (h.agency_id = current_agency_id() or is_super_admin())
    )
  );

-- hotel_events: inserción pública vía endpoint de tracking; lectura de la agencia dueña o admin.
create policy hotel_events_insert_public on hotel_events
  for insert with check (true);
create policy hotel_events_select_own_or_admin on hotel_events
  for select using (
    exists (
      select 1 from hotels h
      where h.id = hotel_events.hotel_id
        and (h.agency_id = current_agency_id() or is_super_admin())
    )
  );
