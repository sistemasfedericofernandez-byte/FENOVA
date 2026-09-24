import { BulkUploadForm } from "@/components/dashboard/bulk-upload-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default function CargaMasivaPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Carga masiva" description={"Subí un archivo CSV o Excel con tus propiedades. Disponible solo para planes Profesional y Premium."} />
      <BulkUploadForm />
    </div>
  );
}
