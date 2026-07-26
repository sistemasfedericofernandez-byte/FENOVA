import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <span className="font-semibold">Panel de agencia</span>
      </header>
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
