import { AreaMap } from "@/components/property/area-map";
import { resolveLocation, zoneLabel } from "@/lib/corrientes";

/** Bloque "¿Dónde queda?" del detalle de un aviso: texto de la zona + mapa. */
export function LocationSection({
  lat,
  lng,
  neighborhoodName,
  addressText,
}: {
  lat: number | null;
  lng: number | null;
  neighborhoodName: string | null;
  addressText: string | null;
}) {
  const location = resolveLocation(lat, lng, neighborhoodName);
  const zone = zoneLabel(neighborhoodName);

  if (!location && !addressText && !neighborhoodName) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">¿Dónde queda?</h2>
        <p className="font-medium text-foreground">
          {addressText ? `${addressText} · ${zone}` : zone}
        </p>
        {location ? (
          <p className="text-sm text-foreground/75">
            {location.approximate
              ? "Ubicación aproximada de la zona."
              : "El círculo marca la zona donde queda la propiedad."}
          </p>
        ) : null}
      </div>

      {location ? (
        <>
          <AreaMap lat={location.lat} lng={location.lng} approximate={location.approximate} />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-semibold text-accent-strong underline underline-offset-4"
          >
            Ver en Google Maps
          </a>
        </>
      ) : null}
    </section>
  );
}
