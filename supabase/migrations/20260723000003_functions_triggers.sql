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
