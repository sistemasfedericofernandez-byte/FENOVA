import { BulkUploadForm } from "@/components/dashboard/bulk-upload-form";

export default function CargaMasivaPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Carga masiva</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Subí un archivo CSV o Excel con tus propiedades. Disponible solo para
        planes Profesional y Premium.
      </p>
      <BulkUploadForm />
    </div>
  );
}
