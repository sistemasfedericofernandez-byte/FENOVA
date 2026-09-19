-- Endurecimiento de seguridad.
--
-- 1) El rol de una cuenta nueva llegaba tal cual desde el navegador
--    (raw_user_meta_data.role): cualquiera podía registrarse como
--    'super_admin'. Ahora solo se aceptan los roles de auto-registro.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_requested text := new.raw_user_meta_data->>'role';
  v_role user_role;
begin
  v_role := case
    when v_requested in ('inmobiliaria', 'hotel', 'dueno_directo') then v_requested::user_role
    else 'dueno_directo'::user_role
  end;

  insert into profiles (id, role, full_name, terms_accepted_at, terms_version)
  values (
    new.id,
    v_role,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'terms_accepted_at', '')::timestamptz,
    nullif(new.raw_user_meta_data->>'terms_version', '')
  );

  if v_role in ('inmobiliaria', 'hotel', 'dueno_directo') then
    insert into agencies (profile_id, business_name, whatsapp_number)
    values (
      new.id,
      coalesce(
        nullif(new.raw_user_meta_data->>'business_name', ''),
        new.raw_user_meta_data->>'full_name',
        'Sin nombre'
      ),
      nullif(new.raw_user_meta_data->>'whatsapp_number', '')
    );
  end if;

  return new;
end;
$$;

-- 2) Las policies de UPDATE de profiles/agencies/properties/hotels dejaban
--    a cada usuario editar CUALQUIER columna de su fila (p. ej. su propio
--    `role`, o marcarse `is_verified_owner`). Estos triggers revierten los
--    cambios a columnas protegidas cuando quien escribe no es super_admin.
--    (auth.uid() es null para service_role / SQL Editor: ahí no se aplica.)
create or replace function protect_profile_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not is_super_admin() then
    new.role := old.role;
    new.status := old.status;
    new.referred_by_affiliate_id := old.referred_by_affiliate_id;
    new.terms_accepted_at := old.terms_accepted_at;
    new.terms_version := old.terms_version;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns before update on profiles
  for each row execute function protect_profile_columns();

create or replace function protect_agency_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not is_super_admin() then
    new.profile_id := old.profile_id;
    new.is_verified_owner := old.is_verified_owner;
    new.verified_at := old.verified_at;
    -- La agencia solo puede pedir la verificación (pasar a 'pendiente');
    -- aprobar/rechazar es exclusivo del super_admin.
    if new.verification_status is distinct from old.verification_status
       and not (new.verification_status = 'pendiente'
                and old.verification_status in ('no_iniciado', 'rechazado')) then
      new.verification_status := old.verification_status;
    end if;
  end if;
  return new;
end;
$$;

create trigger agencies_protect_columns before update on agencies
  for each row execute function protect_agency_columns();

create or replace function protect_agency_id_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not is_super_admin() then
    new.agency_id := old.agency_id;
  end if;
  return new;
end;
$$;

create trigger properties_protect_agency_id before update on properties
  for each row execute function protect_agency_id_column();
create trigger hotels_protect_agency_id before update on hotels
  for each row execute function protect_agency_id_column();

-- 3) `agencies` es de lectura pública (para mostrar la inmobiliaria en cada
--    aviso), pero eso exponía `verification_doc_url` (foto del DNI/comprobante
--    subido para "Propietario Seguro") a cualquiera con la API pública.
--    Se restringe la lectura a columnas públicas. Si se agrega una columna
--    nueva a `agencies` que deba leerse desde el cliente, hay que sumarla acá.
--    El super_admin lee el comprobante con el cliente de servicio.
revoke select on agencies from anon, authenticated;
grant select (
  id, profile_id, business_name, cuit, city, logo_url, whatsapp_number,
  is_verified_owner, verification_status, verified_at, created_at, updated_at
) on agencies to anon, authenticated;
