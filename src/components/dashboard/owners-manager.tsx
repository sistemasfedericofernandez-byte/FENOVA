"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createOwner, updateOwner, deleteOwner } from "@/server/actions/owners";

type Owner = {
  id: string;
  full_name: string;
  dni_cuit: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type OwnerFormValues = {
  fullName: string;
  dniCuit: string;
  phone: string;
  email: string;
  notes: string;
};

const emptyForm: OwnerFormValues = {
  fullName: "",
  dniCuit: "",
  phone: "",
  email: "",
  notes: "",
};

function toFormValues(owner: Owner): OwnerFormValues {
  return {
    fullName: owner.full_name,
    dniCuit: owner.dni_cuit ?? "",
    phone: owner.phone ?? "",
    email: owner.email ?? "",
    notes: owner.notes ?? "",
  };
}

function OwnerFields({
  values,
  onChange,
}: {
  values: OwnerFormValues;
  onChange: (values: OwnerFormValues) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        required
        placeholder="Nombre y apellido"
        value={values.fullName}
        onChange={(e) => onChange({ ...values, fullName: e.target.value })}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="DNI / CUIT (opcional)"
          value={values.dniCuit}
          onChange={(e) => onChange({ ...values, dniCuit: e.target.value })}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="text"
          placeholder="Teléfono (opcional)"
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </div>
      <input
        type="email"
        placeholder="Email (opcional)"
        value={values.email}
        onChange={(e) => onChange({ ...values, email: e.target.value })}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
      <textarea
        placeholder="Notas (opcional)"
        value={values.notes}
        onChange={(e) => onChange({ ...values, notes: e.target.value })}
        rows={2}
        className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
    </div>
  );
}

export function OwnersManager({ owners }: { owners: Owner[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newValues, setNewValues] = useState<OwnerFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<OwnerFormValues>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createOwner(newValues);
    setLoading(false);
    if (!result.ok) {
      setError(typeof result.error === "string" ? result.error : "Revisá los datos");
      return;
    }
    setNewValues(emptyForm);
    setCreating(false);
    router.refresh();
  }

  function startEdit(owner: Owner) {
    setEditingId(owner.id);
    setEditValues(toFormValues(owner));
    setError(null);
  }

  async function handleUpdate(e: SyntheticEvent, ownerId: string) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateOwner(ownerId, editValues);
    setLoading(false);
    if (!result.ok) {
      setError(typeof result.error === "string" ? result.error : "Revisá los datos");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(ownerId: string) {
    if (!confirm("¿Eliminar este propietario? Las propiedades que lo tengan asignado quedan sin propietario.")) {
      return;
    }
    setLoading(true);
    const result = await deleteOwner(ownerId);
    setLoading(false);
    if (!result.ok) {
      setError(typeof result.error === "string" ? result.error : "No se pudo eliminar");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {!creating ? (
        <Button type="button" variant="secondary" onClick={() => setCreating(true)}>
          + Nuevo propietario
        </Button>
      ) : (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <OwnerFields values={newValues} onChange={setNewValues} />
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar propietario"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => {
                setCreating(false);
                setNewValues(emptyForm);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!owners.length ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Todavía no cargaste ningún propietario.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {owners.map((owner) =>
            editingId === owner.id ? (
              <form
                key={owner.id}
                onSubmit={(e) => handleUpdate(e, owner.id)}
                className="flex flex-col gap-3 p-4"
              >
                <OwnerFields values={editValues} onChange={setEditValues} />
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div
                key={owner.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{owner.full_name}</span>
                  <span className="text-sm text-zinc-600">
                    {[owner.dni_cuit, owner.phone, owner.email].filter(Boolean).join(" · ") ||
                      "Sin datos de contacto"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() => startEdit(owner)}
                    className="flex min-h-11 items-center underline underline-offset-4"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(owner.id)}
                    className="flex min-h-11 items-center text-red-600 underline underline-offset-4"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
