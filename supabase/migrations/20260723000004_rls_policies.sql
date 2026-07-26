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
