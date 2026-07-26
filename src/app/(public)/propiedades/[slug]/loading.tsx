export default function LoadingPropiedadDetalle() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6 sm:py-8">
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-2">
        <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </main>
  );
}
