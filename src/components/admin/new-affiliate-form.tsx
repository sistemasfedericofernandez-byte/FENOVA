"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createAffiliate } from "@/server/actions/affiliates";

export function NewAffiliateForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const result = await createAffiliate({
      fullName,
      referralCode,
      commissionPercent: Number(commissionPercent),
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo crear el afiliado");
      return;
    }

    setFullName("");
    setReferralCode("");
    setCommissionPercent("10");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 p-4">
      <h3 className="font-medium">Nuevo afiliado</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm"
        />
        <input
          type="text"
          placeholder="Código de referido (ej: JUAN10)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm"
        />
        <input
          type="number"
          placeholder="Comisión %"
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-transparent px-3 py-2.5 text-base sm:text-sm"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button
        disabled={!fullName || !referralCode || loading}
        onClick={handleSubmit}
      >
        {loading ? "Creando..." : "Crear afiliado"}
      </Button>
    </div>
  );
}
