import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/layout/admin-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-4 text-white">
        <Link href="/admin/metricas" className="font-semibold">
          Backoffice — Super Admin
        </Link>
        <SignOutButton className="text-sm font-medium text-zinc-300" />
      </header>
      <div className="bg-zinc-900">
        <AdminNav />
      </div>
      <div className="flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
