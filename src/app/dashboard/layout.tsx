import type { ReactNode } from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <Link
          href={profile?.role === "hotel" ? "/dashboard/hotel" : "/dashboard/propiedades"}
          className="font-semibold"
        >
          Panel de agencia
        </Link>
        <SignOutButton className="text-sm font-medium text-zinc-600 dark:text-zinc-400" />
      </header>
      <DashboardNav role={profile?.role} />
      <div className="flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
