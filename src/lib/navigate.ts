import type { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

/**
 * Cambia de pantalla después de guardar algo. No se combina `router.push` con
 * `router.refresh()` porque el segundo pisaba al primero y la persona se
 * quedaba mirando el formulario con el botón en "Guardando...". Si por
 * cualquier motivo el cambio no ocurre, se fuerza con una navegación normal.
 */
export function goTo(router: Router, url: string) {
  router.push(url);
  const path = url.split("?")[0];
  window.setTimeout(() => {
    if (window.location.pathname !== path) window.location.assign(url);
  }, 2000);
}
