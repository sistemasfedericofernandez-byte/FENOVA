import Link from "next/link";

const LINK = "text-sm text-foreground/75 underline-offset-4 hover:text-foreground hover:underline";

/** Pie de página: enlaces internos a las búsquedas principales (ayuda a Google y a las personas). */
export function SiteFooter() {
  return (
    <footer className="mx-auto mt-10 w-full max-w-6xl border-t border-zinc-300/70 px-4 pb-32 pt-10 sm:px-6 sm:pb-12">
      <div className="grid gap-8 sm:grid-cols-4">
        <div className="flex flex-col gap-2 sm:col-span-1">
          <span className="text-lg font-extrabold tracking-tight text-accent-strong">PropiMarket</span>
          <p className="text-sm leading-relaxed text-foreground/75">
            Propiedades y hoteles de Corrientes. Buscá sin registrarte y contactá directo por WhatsApp.
          </p>
        </div>

        <nav aria-label="Buscar" className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">Buscar</span>
          <Link href="/alquiler-en-corrientes" className={LINK}>Alquiler en Corrientes</Link>
          <Link href="/venta-en-corrientes" className={LINK}>Venta en Corrientes</Link>
          <Link href="/alquiler-temporal-en-corrientes" className={LINK}>Alquiler temporal</Link>
          <Link href="/hoteles" className={LINK}>Hoteles en Corrientes</Link>
          <Link href="/mapa" className={LINK}>Mapa con precios</Link>
        </nav>

        <nav aria-label="Inmobiliarias" className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">Inmobiliarias y hoteles</span>
          <Link href="/registro" className={LINK}>Publicá tus propiedades</Link>
          <Link href="/login" className={LINK}>Ingresar a mi panel</Link>
          <Link href="/alertas" className={LINK}>Crear una alerta de búsqueda</Link>
        </nav>

        <nav aria-label="Legal" className="flex flex-col gap-2">
          <span className="text-sm font-bold text-foreground">Información</span>
          <Link href="/terminos" className={LINK}>Términos y condiciones</Link>
        </nav>
      </div>

      <p className="mt-8 text-xs text-foreground/65">
        © {new Date().getFullYear()} PropiMarket · Corrientes, Argentina
      </p>
    </footer>
  );
}
