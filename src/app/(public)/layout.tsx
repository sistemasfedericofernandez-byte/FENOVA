import { Suspense, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { BackgroundToneProvider } from "@/components/background-tone-provider";
import { RouteTone } from "@/components/route-tone";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dashboardHref = "/dashboard";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "super_admin") {
      dashboardHref = "/admin/metricas";
    } else if (profile?.role === "hotel") {
      dashboardHref = "/dashboard/hotel";
    }
  }

  return (
    <BackgroundToneProvider>
      <Suspense fallback={null}>
        <RouteTone />
      </Suspense>
      <SiteHeader isLoggedIn={Boolean(user)} dashboardHref={dashboardHref} />
      <div>
        {children}
        <SiteFooter />
      </div>
      <BottomNav isLoggedIn={Boolean(user)} dashboardHref={dashboardHref} />
    </BackgroundToneProvider>
  );
}
