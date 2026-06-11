"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/api/use-resource";
import { fmtBytes, fmtDate } from "@/lib/format";
import type { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";

const FileIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

export function UploadedMaterials({ isAdmin }: { isAdmin: boolean }) {
  const { data, loading, error, reload } = useResource<Material[]>(() => api.materials.list());
  const [open, setOpen] = useState(false);

  const materials = data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Archivos de Mensis</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Material descargable subido por el equipo Mensis.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpen(true)} className="h-10 shrink-0 px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Subir archivo
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : materials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 px-5 py-10 text-center text-sm text-zinc-400">
          Aún no hay archivos. {isAdmin ? "Sube el primero con el botón de arriba." : "Pronto encontrarás material aquí."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <MaterialFileCard key={m.id} item={m} isAdmin={isAdmin} onDeleted={reload} />
          ))}
        </div>
      )}

      {isAdmin && (
        <UploadModal open={open} onClose={() => setOpen(false)} onUploaded={reload} />
      )}
    </section>
  );
}

function MaterialFileCard({
  item,
  isAdmin,
  onDeleted,
}: {
  item: Material;
  isAdmin: boolean;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    setDeleting(true);
    try {
      await api.materials.remove(item.id);
      onDeleted();
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo eliminar.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/8 text-brand">{FileIcon}</span>
        {isAdmin && (
          <button
            onClick={remove}
            disabled={deleting}
            aria-label="Eliminar"
            className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-semibold text-zinc-800">{item.title}</h3>
        {item.description && <p className="text-xs text-zinc-500">{item.description}</p>}
        <p className="mt-1 text-[11px] text-zinc-400">
          {item.file_name}
          {item.size_bytes ? ` · ${fmtBytes(item.size_bytes)}` : ""} · {fmtDate(item.created_at)}
        </p>
      </div>
      <a
        href={`/api/materials/${item.id}/download`}
        className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand hover:underline"
      >
        Descargar
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>
    </div>
  );
}

function UploadModal({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setFile(null);
    setErr(null);
    setBusy(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErr("Selecciona un archivo.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await api.materials.upload({ title: title.trim() || file.name, description, file });
      reset();
      onClose();
      onUploaded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo subir el archivo.");
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Subir archivo" subtitle="Material que verán y descargarán los partners.">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <Field label="Título" htmlFor="material-title">
          <Input
            id="material-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Guía de implementación 2026"
          />
        </Field>

        <Field label="Descripción (opcional)" htmlFor="material-desc">
          <Input
            id="material-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del material"
          />
        </Field>

        <Field label="Archivo" htmlFor="material-file">
          <input
            id="material-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand/8 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/12"
          />
        </Field>

        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{err}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Subiendo…" : "Subir"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
