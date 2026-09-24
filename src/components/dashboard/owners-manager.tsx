"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PlusIcon, UsersIcon } from "@/components/ui/icons";
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
    <div className="flex flex-col gap-4">
      <Field label="Nombre y apellido">
        <input
          type="text"
          required
          value={values.fullName}
          onChange={(e) => onChange({ ...values, fullName: e.target.value })}
          className="field"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teléfono" hint="Opcional.">
          <input
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(e) => onChange({ ...values, phone: e.target.value })}
            className="field"
          />
        </Field>
        <Field label="Email" hint="Opcional.">
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            className="field"
          />
        </Field>
      </div>
      <Field label="DNI o CUIT" hint="Opcional.">
        <input
          type="text"
          value={values.dniCuit}
          onChange={(e) => onChange({ ...values, dniCuit: e.target.value })}
          className="field"
        />
      </Field>
      <Field label="Notas" hint="Opcional. Por ejemplo: prefiere que le escriban por la tarde.">
        <textarea
          value={values.notes}
          onChange={(e) => onChange({ ...values, notes: e.target.value })}
          rows={2}
          className="field resize-none"
        />
      </Field>
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
    <div className="flex max-w-2xl flex-col gap-5">
      {!creating ? (
        <div>
          <Button type="button" onClick={() => setCreating(true)}>
            <PlusIcon width={18} height={18} />
            Agregar propietario
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="card flex flex-col gap-5 p-5 sm:p-6">
          <h2 className="text-base font-bold text-[#0d2740]">Nuevo propietario</h2>
          <OwnerFields values={newValues} onChange={setNewValues} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar propietario"}
            </Button>
            <Button
              type="button"
              variant="secondary"
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

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      {!owners.length ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe7ee] text-[#163a5c]">
            <UsersIcon width={26} height={26} />
          </span>
          <p className="max-w-sm text-[15px] text-zinc-700">
            Todavía no cargaste ningún propietario. Anotalos acá y después podés asignarlos a cada
            propiedad.
          </p>
        </div>
      ) : (
        <ul className="card divide-y divide-zinc-200">
          {owners.map((owner) =>
            editingId === owner.id ? (
              <li key={owner.id}>
                <form onSubmit={(e) => handleUpdate(e, owner.id)} className="flex flex-col gap-5 p-5">
                  <OwnerFields values={editValues} onChange={setEditValues} />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </li>
            ) : (
              <li
                key={owner.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="font-semibold text-zinc-900">{owner.full_name}</span>
                  <span className="text-sm text-zinc-700">
                    {[owner.phone, owner.email, owner.dni_cuit].filter(Boolean).join(" · ") ||
                      "Sin datos de contacto"}
                  </span>
                </div>
                <div className="flex items-center gap-5 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => startEdit(owner)}
                    className="flex min-h-11 items-center text-[#163a5c] underline underline-offset-4"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(owner.id)}
                    className="flex min-h-11 items-center text-red-700 underline underline-offset-4"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
