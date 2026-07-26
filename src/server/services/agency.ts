import { createClient } from "@/lib/supabase/server";

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now().toString(36)}`
  );
}

export async function requireAgencyId(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!agency) throw new Error("La cuenta no tiene una agencia asociada");
  return agency.id;
}
