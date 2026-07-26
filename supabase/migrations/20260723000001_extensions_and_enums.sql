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
