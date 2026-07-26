"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { reviewVerificationRequest } from "@/server/actions/verification";

export function VerificationReviewItem({
  agencyId,
  businessName,
  docUrl,
}: {
  agencyId: string;
  businessName: string;
  docUrl: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"aprobado" | "rechazado" | null>(null);

  async function handleReview(decision: "aprobado" | "rechazado") {
    setLoading(decision);
    await reviewVerificationRequest(agencyId, decision);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {docUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={docUrl}
            alt={`Comprobante de ${businessName}`}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : null}
        <span className="font-medium">{businessName}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={loading !== null}
          onClick={() => handleReview("rechazado")}
          className="flex-1 sm:flex-none"
        >
          {loading === "rechazado" ? "..." : "Rechazar"}
        </Button>
        <Button
          disabled={loading !== null}
          onClick={() => handleReview("aprobado")}
          className="flex-1 sm:flex-none"
        >
          {loading === "aprobado" ? "..." : "Aprobar"}
        </Button>
      </div>
    </div>
  );
}
