import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-medium text-zinc-500">Error 404</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        No encontramos esta página
      </h1>
      <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
        Puede que el link esté roto o que la propiedad ya no esté disponible.
      </p>
      <Link
        href="/propiedades"
        className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
      >
        Ver propiedades
      </Link>
    </main>
  );
}
