"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { useToast } from "@/lib/hooks/use-toast";
import type { PartnerWithCount } from "@/lib/services/partners";
import { fmtDate, partnerCode } from "@/lib/format";
import { COUNTRIES, flagEmoji } from "@/lib/countries";
import {
  DEFAULT_PARTNER_STAGE,
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LABELS,
  PARTNER_STAGES,
  PARTNER_STAGE_TONES,
  ROLE_LABELS,
  isPartnerStage,
  type PartnerCategory,
  type PartnerStage,
} from "@/lib/types";
import { LoadingRow } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

function Breadcrumb({ code }: { code?: string }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400">
      <Link href="/app/partners" className="transition-colors hover:text-zinc-600">
        ← Partners
      </Link>
      {code && (
        <>
          <span className="text-zinc-300">/</span>
          <span className="font-mono text-brand">{code}</span>
        </>
      )}
    </nav>
  );
}

function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{children}</p>;
}

export function PartnerDetail({ id }: { id: string }) {
  const { data: partner, loading, error, reload } = useResource(() => api.partners.get(id));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Breadcrumb code={partner ? partnerCode(partner.seq) : undefined} />

      {loading && <LoadingRow label="Cargando partner…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}
      {partner && <Content key={partner.id} partner={partner} reload={reload} />}
    </div>
  );
}

function Content({ partner, reload }: { partner: PartnerWithCount; reload: () => void }) {
  const toast = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(partner.full_name ?? "");
  const [email, setEmail] = useState(partner.email ?? "");
  const [country, setCountry] = useState(partner.country ?? "");
  const [phone, setPhone] = useState(partner.phone ?? "");
  const [category, setCategory] = useState<PartnerCategory | "">(partner.category ?? "");
  // Una etapa vieja o vacía cae en la primera del embudo para que el select
  // nunca arranque sin selección.
  const [stage, setStage] = useState<PartnerStage>(
    isPartnerStage(partner.process_stage) ? partner.process_stage : DEFAULT_PARTNER_STAGE,
  );
  const [entryDate, setEntryDate] = useState(partner.entry_date ?? "");
  const [signedOn, setSignedOn] = useState(partner.signed_on ?? "");
  const [linkedin, setLinkedin] = useState(partner.linkedin_url ?? "");

  const [active, setActive] = useState(partner.active);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.partners.update(partner.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        country: country || null,
        phone: phone.trim() || null,
        category: category || null,
        process_stage: stage,
        // Solo se manda cuando está firmado: en otra etapa la base la limpia.
        signed_on: stage === "Partner!" ? signedOn || null : null,
        entry_date: entryDate || null,
        linkedin_url: linkedin.trim() || null,
      });
      toast.success("Partner actualizado.");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  // Optimistic: flip the switch immediately, revert if the call fails. El
  // servidor devuelve la fila ya guardada, así que el estado final sale de ahí
  // y no de lo que asumimos localmente.
  async function toggleActive() {
    const next = !active;
    setActive(next);
    try {
      const updated = await api.partners.setActive(partner.id, next);
      setActive(updated.active);
      toast.success(next ? "Partner activado." : "Partner desactivado.");
      reload();
    } catch (err) {
      setActive(!next);
      toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado.");
    }
  }

  async function resetPassword() {
    try {
      const res = await api.partners.resetPassword(partner.id);
      setNewPassword(res.password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo generar la contraseña.");
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await api.partners.remove(partner.id);
      toast.success(
        res.opportunity_count > 0
          ? `Partner eliminado junto con ${res.opportunity_count} oportunidad${res.opportunity_count === 1 ? "" : "es"}. Queda en el reporte de eliminados.`
          : "Partner eliminado. Queda en el reporte de eliminados.",
      );
      router.push("/app/partners");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold tracking-wider text-brand">{partnerCode(partner.seq)}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {partner.full_name ?? partner.email}
          </h1>
          <Badge tone={partner.role === "partner_admin" ? "brand" : "neutral"}>
            {ROLE_LABELS[partner.role]}
          </Badge>
          <Badge tone={active ? "emerald" : "red"}>{active ? "Activo" : "Inactivo"}</Badge>
          <Badge tone={PARTNER_STAGE_TONES[stage]}>{stage}</Badge>
        </div>
      </div>

      {/* Sección 1: Información del partner (editable) */}
      <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <SectionTitle>Información del partner</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" htmlFor="pd-name">
            <Input id="pd-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="María Gómez" />
          </Field>
          <Field label="Correo electrónico" htmlFor="pd-email">
            <Input id="pd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@partner.com" />
          </Field>

          <Field label="País de residencia" htmlFor="pd-country">
            <Select id="pd-country" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Sin especificar</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Teléfono" htmlFor="pd-phone">
            <Input id="pd-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+57 3001234567" />
          </Field>

          <Field label="Categoría" htmlFor="pd-category">
            <Select id="pd-category" value={category} onChange={(e) => setCategory(e.target.value as PartnerCategory | "")}>
              <option value="">Sin especificar</option>
              {PARTNER_CATEGORIES.map((c) => (
                <option key={c} value={c}>{PARTNER_CATEGORY_LABELS[c]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha de ingreso" htmlFor="pd-entry">
            <Input id="pd-entry" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
          </Field>

          <Field
            label="Etapa del proceso"
            htmlFor="pd-stage"
            className={stage === "Partner!" ? "" : "sm:col-span-2"}
          >
            <Select id="pd-stage" value={stage} onChange={(e) => setStage(e.target.value as PartnerStage)}>
              {PARTNER_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          {/* La fecha decide en qué semana cuenta para la meta, así que tiene
              que poder corregirse cuando el contrato se firmó antes de cargarlo. */}
          {stage === "Partner!" && (
            <Field label="Fecha de firma del contrato" htmlFor="pd-signed">
              <Input
                id="pd-signed"
                type="date"
                value={signedOn}
                onChange={(e) => setSignedOn(e.target.value)}
              />
            </Field>
          )}

          <Field label="Sitio web o LinkedIn" htmlFor="pd-linkedin" className="sm:col-span-2">
            <Input id="pd-linkedin" type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://acme.com o https://linkedin.com/in/…" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand/15 bg-brand/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Oportunidades</p>
            <p className="mt-1 text-xl font-bold text-brand">{partner.opportunity_count}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Registrado</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">{fmtDate(partner.created_at)}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} variant="secondary" className="px-4">
            {saving ? "Guardando…" : "Guardar información"}
          </Button>
        </div>
      </section>

      {/* Sección 2: Acceso */}
      <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <SectionTitle>Acceso al portal</SectionTitle>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-800">Cuenta {active ? "activa" : "inactiva"}</p>
            <p className="text-xs text-zinc-400">
              Al desactivarla, el partner deja de poder iniciar sesión.
            </p>
          </div>
          <Switch checked={active} onChange={toggleActive} label="Activar o desactivar partner" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-5">
          <div>
            <p className="text-sm font-medium text-zinc-800">Contraseña</p>
            <p className="text-xs text-zinc-400">
              Genera una nueva contraseña. Se muestra una sola vez.
            </p>
          </div>
          <Button onClick={resetPassword} variant="secondary" className="px-4">
            Restablecer contraseña
          </Button>
        </div>

        {newPassword && (
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">Contraseña nueva ✓</p>
            <p className="mt-1 text-sm text-emerald-700">
              Compártela de forma segura — no volverá a mostrarse.
            </p>
            <p className="mt-2 font-mono text-sm text-emerald-900">{newPassword}</p>
          </div>
        )}
      </section>

      {/* Sección 3: Zona de peligro */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50/40 p-6">
        <div>
          <p className="text-sm font-semibold text-red-700">Eliminar partner</p>
          <p className="mt-0.5 text-xs text-red-500">
            Se borra la cuenta y {partner.opportunity_count === 1 ? "la oportunidad" : `las ${partner.opportunity_count} oportunidades`} que registró. No se puede deshacer.
          </p>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Eliminar
        </button>
      </section>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar partner"
        subtitle="Esta acción no se puede deshacer."
        dismissible={!deleting}
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-zinc-600">
            Se eliminará <span className="font-medium text-zinc-900">{partner.full_name ?? partner.email}</span> y
            {" "}
            {partner.opportunity_count === 0
              ? "no tiene oportunidades registradas"
              : partner.opportunity_count === 1
                ? "la oportunidad que registró"
                : `las ${partner.opportunity_count} oportunidades que registró`}
            .
          </p>
          <p className="text-xs text-zinc-400">
            La baja queda registrada con tu nombre y la fecha en el reporte de partners eliminados.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={remove}
              disabled={deleting}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
