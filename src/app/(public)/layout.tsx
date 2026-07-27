import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";

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
      <div className="pb-16 sm:pb-0">{children}</div>
      <BottomNav isLoggedIn={Boolean(user)} dashboardHref={dashboardHref} />
    </>
  );
}
