import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dashboardHref = "/dashboard/propiedades";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "super_admin") {
      dashboardHref = "/admin/metricas";
    }
  }

  return (
    <>
      <SiteHeader isLoggedIn={Boolean(user)} dashboardHref={dashboardHref} />
      {children}
    </>
  );
}
