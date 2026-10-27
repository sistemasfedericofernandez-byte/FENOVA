-- Dos planes: hasta 15 propiedades ($40.000) y propiedades ilimitadas ($60.000).
-- "Ilimitado" se representa con un tope muy alto (100000).
update subscription_plans
set name = 'Hasta 15 propiedades', price_ars = 40000, max_active_listings = 15,
    allows_csv_bulk_upload = true, allows_advanced_stats = true, active = true
where slug = 'basico';

update subscription_plans
set name = 'Ilimitado', price_ars = 60000, max_active_listings = 100000,
    allows_csv_bulk_upload = true, allows_advanced_stats = true, active = true
where slug = 'profesional';

update subscription_plans set active = false where slug = 'premium';
