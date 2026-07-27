# Argentina Inmuebles

Marketplace inmobiliario para Corrientes (Argentina). Next.js 16 (App Router) +
Tailwind, Supabase (DB/Auth/RLS), Cloudinary (imágenes), MercadoPago
(suscripciones) y Resend (emails de alertas).

Desplegado en Vercel: https://fenova-seven.vercel.app

## Stack

- **Frontend/Backend**: Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS.
- **Base de datos y auth**: Supabase (Postgres + Auth + RLS). Esquema en [`supabase/migrations`](supabase/migrations).
- **Imágenes**: Cloudinary (subida firmada desde el cliente, la DB solo guarda URLs).
- **Pagos**: MercadoPago (Suscripciones / PreApprovalPlan).
- **Emails**: Resend (alertas de búsqueda que coinciden con nuevas propiedades).

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá:

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago Developers → Credenciales (de prueba o producción) |
| `MERCADOPAGO_WEBHOOK_SECRET` | MercadoPago Developers → Webhooks (necesita una URL pública configurada) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Resend Dashboard (necesita dominio verificado para mandar a destinatarios reales) |
| `CRON_SECRET` | Inventado por vos, protege `/api/cron/roi-snapshot` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` en dev, la URL real en producción |

### Base de datos

Las migraciones están en [`supabase/migrations`](supabase/migrations) en orden.
Para aplicarlas contra un proyecto Supabase nuevo, pegá el contenido de
[`supabase/run_this_in_sql_editor.sql`](supabase/run_this_in_sql_editor.sql)
(migraciones + seed combinados) en el SQL Editor del dashboard de Supabase, y
después corré también `20260726000001_auto_create_agency.sql` si no está
incluido ahí.

## Deploy en Vercel

1. Conectá el repo en [vercel.com/new](https://vercel.com/new).
2. Cargá todas las variables de entorno de la tabla de arriba en
   **Project Settings → Environment Variables** (usando las credenciales de
   **producción** de MercadoPago cuando corresponda).
3. Una vez que Vercel te dé el dominio, actualizá `NEXT_PUBLIC_SITE_URL` con
   esa URL y volvé a desplegar.
4. Configurá el webhook de MercadoPago apuntando a
   `https://tu-dominio/api/webhooks/mercadopago` y cargá el `MERCADOPAGO_WEBHOOK_SECRET`
   que te dé ahí.
5. (Opcional) Programá `GET /api/cron/roi-snapshot` con Vercel Cron
   (header `Authorization: Bearer <CRON_SECRET>`) para recalcular el ROI por
   barrio periódicamente.
