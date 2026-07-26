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
