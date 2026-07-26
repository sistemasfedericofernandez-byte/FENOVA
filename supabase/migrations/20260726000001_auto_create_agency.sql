-- Contacto público de la agencia (para el botón de WhatsApp en el frontend).
-- Va en `agencies` -no en `profiles`- porque `agencies` es de lectura pública
-- y `profiles` está restringido por RLS al dueño/admin.
alter table agencies add column if not exists whatsapp_number text;

-- Además del profile, crea automáticamente el registro de agencies para los
-- roles que operan como cuenta comercial (inmobiliaria, hotel, dueno_directo).
-- business_name / whatsapp_number llegan en raw_user_meta_data (seteados por
-- el formulario de registro); si no vino business_name, usamos el full_name.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'dueno_directo');

  insert into profiles (id, role, full_name)
  values (
    new.id,
    v_role,
    new.raw_user_meta_data->>'full_name'
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
