"use client";

import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { importFromFacebookHtml } from "@/server/actions/facebook-import";
import { createProperty } from "@/server/actions/properties";
import { buttonClass } from "@/lib/button-styles";
import {
  inferNeighborhoodId,
  inferNumbers,
  inferOperation,
  inferType,
} from "@/lib/infer-listing";
import { ImportIcon, CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Item = {
  id: number;
  fileName: string;
  status: "working" | "done" | "error";
  message?: string;
  title?: string;
  propertyId?: string;
  details?: string;
};

const OPERATION_LABEL = {
  venta: "Venta",
  alquiler: "Alquiler",
  alquiler_temporal: "Alquiler temporal",
} as const;

const TYPE_LABEL = {
  casa: "Casa",
  departamento: "Departamento",
  terreno: "Terreno",
  local: "Local",
  oficina: "Oficina",
  galpon: "Galpón",
  quinta: "Quinta",
  otro: "Propiedad",
} as const;

export function FacebookBulkImport({
  neighborhoods,
}: {
  neighborhoods: { id: string; name: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(id: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function importFile(file: File, id: number) {
    try {
      const html = await file.text();
      const imported = await importFromFacebookHtml(html);

      if (!imported.ok) {
        update(id, { status: "error", message: imported.error });
        return;
      }

      const { title, description, priceAmount, priceCurrency, images } = imported.data;

      if (!priceAmount || priceAmount <= 0) {
        update(id, {
          status: "error",
          title,
          message:
            "No encontramos el precio en esta publicación. Cargala desde “Publicar propiedad” para poner el precio a mano.",
        });
        return;
      }

      const text = `${title} ${description}`;
      const operationType = inferOperation(text);
      const propertyType = inferType(text);
      const neighborhoodId = inferNeighborhoodId(text, neighborhoods);
      const neighborhoodName = neighborhoods.find((n) => n.id === neighborhoodId)?.name;

      const created = await createProperty({
        title: title.slice(0, 120),
        description: description ? description.slice(0, 4000) : undefined,
        operationType,
        propertyType,
        neighborhoodId: neighborhoodId ?? undefined,
        priceAmount,
        priceCurrency,
        ...inferNumbers(text),
        status: "borrador",
        images,
      });

      if (!created.ok) {
        update(id, {
          status: "error",
          title,
          message: typeof created.error === "string" ? created.error : "No se pudo guardar la propiedad.",
        });
        return;
      }

      update(id, {
        status: "done",
        title,
        propertyId: created.property.id,
        details: [
          `${TYPE_LABEL[propertyType]} en ${OPERATION_LABEL[operationType].toLowerCase()}`,
          neighborhoodName ? `Barrio ${neighborhoodName}` : "Falta elegir el barrio",
          images.length
            ? `${images.length} foto${images.length === 1 ? "" : "s"}`
            : "Sin fotos: agregalas al revisar",
        ].join(" · "),
      });
    } catch {
      update(id, {
        status: "error",
        message: "No pudimos leer este archivo. Probá guardarlo de nuevo desde Facebook.",
      });
    }
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => /\.(html?|mhtml?)$/i.test(f.name));
    if (!files.length || busy) return;

    setBusy(true);
    const created = files.map((file) => ({ file, id: nextId.current++ }));
    setItems((prev) => [
      ...created.map(({ file, id }) => ({ id, fileName: file.name, status: "working" as const })),
      ...prev,
    ]);

    for (const { file, id } of created) {
      await importFile(file, id);
    }
    setBusy(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  const done = items.filter((i) => i.status === "done").length;

  return (
    <div className="flex flex-col gap-6">
      <ol className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Abrí tu publicación",
            text: "Desde tu computadora, entrá a Facebook y abrí una de tus publicaciones de Marketplace.",
          },
          {
            title: "Guardá la página",
            text: "Apretá las teclas Ctrl + S (en Mac: Cmd + S) y tocá “Guardar”. Sirve la opción que venga marcada.",
          },
          {
            title: "Subila acá",
            text: "Arrastrá el archivo a la caja de abajo, enseguida (las fotos de Facebook vencen rápido). Podés subir varias juntas.",
          },
        ].map((step, index) => (
          <li key={step.title} className="card flex flex-col gap-2 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2740] text-base font-bold text-white">
              {index + 1}
            </span>
            <h2 className="text-base font-bold text-[#0d2740]">{step.title}</h2>
            <p className="text-sm leading-relaxed text-zinc-700">{step.text}</p>
          </li>
        ))}
      </ol>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragging ? "border-[#163a5c] bg-[#dfe7ee]" : "border-zinc-400 bg-white hover:border-[#163a5c]",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe7ee] text-[#163a5c]">
          <ImportIcon width={26} height={26} />
        </span>
        <span className="text-lg font-bold text-[#0d2740]">
          {busy ? "Importando, un momento…" : "Arrastrá acá los archivos guardados"}
        </span>
        <span className="text-sm text-zinc-700">
          {busy ? "No cierres esta pantalla." : "o tocá para elegirlos desde tu computadora"}
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".html,.htm,.mhtml,.mht,text/html"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {items.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-[#0d2740]">
            {busy ? "Importando…" : `Listo: ${done} de ${items.length} propiedades cargadas`}
          </h2>
          <ul className="card divide-y divide-zinc-200">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      item.status === "done" && "bg-emerald-600 text-white",
                      item.status === "error" && "bg-red-100 text-red-800",
                      item.status === "working" && "bg-zinc-200 text-zinc-700",
                    )}
                  >
                    {item.status === "done" ? (
                      <CheckIcon width={16} height={16} strokeWidth={3} />
                    ) : item.status === "error" ? (
                      "!"
                    ) : (
                      "…"
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-zinc-900">
                      {item.title ?? item.fileName}
                    </span>
                    {item.status === "done" ? (
                      <span className="text-sm text-zinc-700">{item.details}</span>
                    ) : item.status === "error" ? (
                      <span className="text-sm font-medium text-red-700">{item.message}</span>
                    ) : (
                      <span className="text-sm text-zinc-700">Leyendo la publicación y subiendo las fotos…</span>
                    )}
                  </div>
                </div>
                {item.status === "done" && item.propertyId ? (
                  <Link
                    href={`/dashboard/propiedades/${item.propertyId}/editar`}
                    className="shrink-0 text-sm font-semibold text-[#163a5c] underline underline-offset-4"
                  >
                    Revisar y publicar
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>

          {!busy && done > 0 ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-[#f4e8cd] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#3a2c0c]">
                Quedaron como <strong>borrador</strong>: todavía no se ven en el sitio. Revisá cada una
                (sobre todo el barrio y la dirección) y publicala.
              </p>
              <Link href="/dashboard/propiedades" className={buttonClass("primary", "shrink-0")}>
                Ver mis propiedades
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <details className="card p-5 text-sm text-zinc-800">
        <summary className="cursor-pointer text-base font-semibold text-[#0d2740]">
          ¿Algo no funciona?
        </summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Tiene que ser desde una computadora (Chrome, Edge o Firefox); desde el celular no se puede guardar la página.</li>
          <li>Estate con tu sesión de Facebook iniciada y esperá a que la publicación cargue completa antes de apretar Ctrl + S.</li>
          <li>Tiene que ser la página de <strong>una</strong> publicación (no la lista de todas).</li>
          <li>Si una propiedad queda <strong>sin fotos</strong>, es porque Facebook las venció: guardá la página de nuevo y subila enseguida, o agregá las fotos a mano al revisar.</li>
          <li>Si dice que no encontró el precio, la propiedad no se carga: usala desde “Publicar propiedad”.</li>
          <li>Si algo sigue fallando, cargá la propiedad a mano: son 2 minutos.</li>
        </ul>
      </details>
    </div>
  );
}
