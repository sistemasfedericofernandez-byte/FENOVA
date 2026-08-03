import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HotelForm } from "@/components/dashboard/hotel-form";

export default async function DashboardHotelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (profile?.role !== "hotel") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Mi hotel</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Este panel es solo para cuentas de tipo Hotel. Tu cuenta gestiona
          propiedades en{" "}
          <Link href="/dashboard/propiedades" className="underline underline-offset-4">
            Mis propiedades
          </Link>
          .
        </p>
      </div>
    );
  }

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("profile_id", user?.id ?? "")
    .maybeSingle();

  const [{ data: neighborhoods }, { data: hotel }] = await Promise.all([
    supabase.from("neighborhoods").select("id, name").eq("active", true).order("name"),
    agency
      ? supabase.from("hotels").select("*").eq("agency_id", agency.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const { data: images } = hotel
    ? await supabase
        .from("hotel_images")
        .select("id, url")
        .eq("hotel_id", hotel.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Mi hotel</h1>

      {hotel ? (
        <div className="flex gap-6 text-sm text-zinc-500">
          <span>{hotel.views_count} vistas</span>
          <span>{hotel.whatsapp_clicks_count} clics WhatsApp</span>
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">
          Completá los datos de tu hotel y guardá como borrador o publicá
          directamente.
        </p>
      )}

      <HotelForm
        neighborhoods={neighborhoods ?? []}
        initialHotel={hotel}
        initialImages={images ?? []}
      />
    </div>
  );
}
