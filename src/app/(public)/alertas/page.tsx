import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AlertForm } from "@/components/alert-form";

export const metadata: Metadata = {
  title: "Alertas de búsqueda",
  description:
    "Dejá tu email y te avisamos apenas publiquemos una propiedad que coincida con lo que buscás.",
};

export default async function AlertasPage() {
  const supabase = await createClient();
  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Creá una alerta de búsqueda</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Dejá tu email y te avisamos apenas publiquemos algo que coincida.
        </p>
      </div>

      <AlertForm neighborhoods={neighborhoods ?? []} />
    </main>
  );
}
