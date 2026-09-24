import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: agency }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user?.id ?? "").maybeSingle(),
    supabase.from("agencies").select("business_name").eq("profile_id", user?.id ?? "").maybeSingle(),
  ]);

  return (
    <DashboardShell role={profile?.role} agencyName={agency?.business_name ?? "Mi cuenta"}>
      {children}
    </DashboardShell>
  );
}
