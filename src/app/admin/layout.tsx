import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-zinc-900 px-6 py-4 text-white dark:border-zinc-800">
        <span className="font-semibold">Backoffice — Super Admin</span>
      </header>
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
