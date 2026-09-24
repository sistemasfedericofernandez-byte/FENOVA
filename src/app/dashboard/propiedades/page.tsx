import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { PageHeader, StatusBadge } from "@/components/dashboard/page-header";
import { buttonClass } from "@/lib/button-styles";
import { BuildingIcon, PlusIcon } from "@/components/ui/icons";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const STATUS: Record<string, { label: string; tone: "green" | "gray" | "amber" | "red" | "blue" }> = {
  publicada: { label: "Publicada", tone: "green" },
  borrador: { label: "Borrador", tone: "gray" },
  oculta: { label: "Oculta", tone: "amber" },
  pausada_por_impago: { label: "Pausada por impago", tone: "red" },
  alquilada: { label: "Alquilada", tone: "blue" },
};

export default async function DashboardPropiedadesPage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, status, price_amount, price_currency, views_count, whatsapp_clicks_count")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  const ids = (properties ?? []).map((p) => p.id);
  const { data: images } = ids.length
    ? await supabase
        .from("property_images")
        .select("property_id, url, sort_order")
        .in("property_id", ids)
        .order("sort_order", { ascending: true })
    : { data: [] };

  const firstImage = new Map<string, string>();
  for (const image of images ?? []) {
    if (!firstImage.has(image.property_id)) firstImage.set(image.property_id, image.url);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mis propiedades"
        description="Todas tus propiedades en un solo lugar. Entrá a una para editarla, pausarla o marcarla como alquilada."
        action={
          <Link href="/dashboard/propiedades/nueva" className={buttonClass("primary")}>
            <PlusIcon width={18} height={18} />
            Publicar propiedad
          </Link>
        }
      />

      {!properties?.length ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe7ee] text-[#163a5c]">
            <BuildingIcon width={26} height={26} />
          </span>
          <h2 className="text-lg font-bold text-[#0d2740]">Todavía no cargaste ninguna propiedad</h2>
          <p className="max-w-sm text-[15px] text-zinc-700">
            Publicá la primera en un par de minutos. También podés importarla desde Facebook
            Marketplace o cargar muchas juntas con un Excel.
          </p>
          <Link href="/dashboard/propiedades/nueva" className={buttonClass("primary")}>
            Publicar mi primera propiedad
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {properties.map((p) => {
            const status = STATUS[p.status] ?? { label: p.status, tone: "gray" as const };
            const image = firstImage.get(p.id);
            return (
              <li key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-200 sm:h-20 sm:w-28">
                  {image ? (
                    <Image src={image} alt="" fill sizes="(min-width: 640px) 112px, 100vw" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-zinc-500">
                      <BuildingIcon width={28} height={28} />
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-bold text-zinc-900">{p.title}</h2>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </div>
                  <p className="font-semibold text-[#163a5c]">
                    {formatArs(p.price_amount, p.price_currency as PriceCurrency)}
                  </p>
                  <p className="text-sm text-zinc-700">
                    {p.views_count} vistas · {p.whatsapp_clicks_count} consultas por WhatsApp
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                  <Link href={`/dashboard/propiedades/${p.id}/editar`} className={buttonClass("primary")}>
                    Editar
                  </Link>
                  <Link
                    href={`/dashboard/propiedades/${p.id}/alquilar`}
                    className={buttonClass("secondary")}
                  >
                    {p.status === "alquilada" ? "Ver contrato" : "Marcar alquilada"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
