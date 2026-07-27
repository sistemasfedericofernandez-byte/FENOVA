export function PropertyMap({ lat, lng }: { lat: number; lng: number }) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Ubicación</h2>
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <iframe
          src={src}
          width="100%"
          height="280"
          style={{ border: 0 }}
          loading="lazy"
          title="Ubicación de la propiedad"
        />
      </div>
    </div>
  );
}
