-- Respaldo de que cada cuenta aceptó los Términos y Condiciones al
-- registrarse (fecha + versión del documento vigente en ese momento).
-- Se completa desde el trigger de alta de usuario, con los mismos datos
-- que ya viajan en raw_user_meta_data desde el formulario de registro.
alter table profiles add column if not exists terms_accepted_at timestamptz;
alter table profiles add column if not exists terms_version text;

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'dueno_directo');

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
