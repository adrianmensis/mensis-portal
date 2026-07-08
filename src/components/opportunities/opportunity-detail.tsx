"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import { useResource } from "@/lib/hooks/use-resource";
import { useToast } from "@/lib/hooks/use-toast";
import type { OpportunityWithPartner } from "@/lib/services/opportunities";
import { fmtCurrency, fmtDate, opportunityCode } from "@/lib/format";
import {
  COMMISSION_RATE,
  annualAmount,
  commission,
  type PlanKey,
  type BillingPeriod,
} from "@/lib/pricing";
import {
  STAGE_LABELS,
  VIDEO_PLATFORMS,
  VIDEO_PLATFORM_LABELS,
  stageRequiresClientRequest,
  stageReached,
  type Role,
  type VideoPlatform,
} from "@/lib/types";
import { LoadingRow } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NumberField } from "@/components/ui/number-field";
import { Button } from "@/components/ui/button";
import { StagePath } from "./stage-path";
import { PlanPicker } from "./plan-picker";

function Breadcrumb({ code }: { code?: string }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400">
      <Link href="/app/opportunities" className="transition-colors hover:text-zinc-600">
        ← Oportunidades
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

export function OpportunityDetail({ id, role }: { id: string; role: Role }) {
  const { data: opp, loading, error, reload } = useResource(() => api.opportunities.get(id));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Breadcrumb code={opp ? opportunityCode(opp.seq) : undefined} />

      {loading && <LoadingRow label="Cargando oportunidad…" />}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}
      {opp && <Content key={opp.id} opp={opp} role={role} reload={reload} />}
    </div>
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-xs font-medium text-zinc-400">{label}</dt>
      <dd className="text-right text-sm text-zinc-800">{children}</dd>
    </div>
  );
}

function Tile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-brand/15 bg-brand/[0.03]" : "border-zinc-200 bg-white"}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${accent ? "text-brand" : "text-zinc-400"}`}>{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? "text-brand" : "text-zinc-900"}`}>{value}</p>
    </div>
  );
}

function Content({ opp, role, reload }: { opp: OpportunityWithPartner; role: Role; reload: () => void }) {
  const toast = useToast();
  const isAdmin = role === "admin";
  const canEdit = true; // rows shown are the viewer's own (partner) or all (admin)
  const [saving, setSaving] = useState(false);

  // Información de la oportunidad (editable).
  const [clientName, setClientName] = useState(opp.client_name);
  const [website, setWebsite] = useState(opp.website ?? "");
  const [collaborators, setCollaborators] = useState(opp.collaborators ?? 0);
  const [avatars, setAvatars] = useState(opp.estimated_avatars ?? 0);
  const [plan, setPlan] = useState<PlanKey>(opp.plan);
  const [billing, setBilling] = useState<BillingPeriod>(opp.billing_period);
  const [customPrice, setCustomPrice] = useState(opp.custom_price ?? 0);
  const [notes, setNotes] = useState(opp.notes ?? "");

  const [country, setCountry] = useState(opp.country ?? "");
  const [platform, setPlatform] = useState<VideoPlatform | "">(opp.video_platform ?? "");
  const [pilot, setPilot] = useState<"" | "yes" | "no">(
    opp.requires_pilot == null ? "" : opp.requires_pilot ? "yes" : "no",
  );
  const [contactName, setContactName] = useState(opp.contact_name ?? "");
  const [contactEmail, setContactEmail] = useState(opp.contact_email ?? "");
  const [tenantUrl, setTenantUrl] = useState(opp.tenant_url ?? "");
  const [adminUser, setAdminUser] = useState(opp.admin_user ?? "");

  const montoAnual = annualAmount(avatars, plan, billing, customPrice);
  const comisionAnual = commission(montoAnual);

  async function save(patch: Parameters<typeof api.opportunities.update>[1], okMsg: string) {
    setSaving(true);
    try {
      await api.opportunities.update(opp.id, patch);
      toast.success(okMsg);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const gateNote = stageRequiresClientRequest(opp.stage)
    ? null
    : "Requerido para pasar a “Piloto”.";
  // La solicitud y la provisión aparecen a partir de "Creación de tenant".
  const showTenantWork = stageReached(opp.stage, "tenant_creation");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold tracking-wider text-brand">{opportunityCode(opp.seq)}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{opp.client_name}</h1>
      </div>

      {/* Stage path (Salesforce-style) */}
      <StagePath
        stage={opp.stage}
        disabled={!canEdit || saving}
        onSelect={(s) => {
          if (s !== opp.stage) save({ stage: s }, `Etapa → ${STAGE_LABELS[s]}`);
        }}
      />

      {/* Sección 1: Información de la oportunidad (editable) */}
      <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <SectionTitle>Información de la oportunidad</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del cliente" htmlFor="io-name" className="sm:col-span-2">
            <Input id="io-name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corp" />
          </Field>
          <Field label="Sitio web" htmlFor="io-web" className="sm:col-span-2">
            <Input id="io-web" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" />
          </Field>
          <NumberField label="Cantidad de colaboradores" defaultValue={opp.collaborators ?? 0} onValue={setCollaborators} />
          <NumberField label="Cantidad de gemelos digitales" defaultValue={opp.estimated_avatars ?? 0} onValue={setAvatars} />
          <div className="sm:col-span-2">
            <PlanPicker
              plan={plan}
              onPlan={setPlan}
              billing={billing}
              onBilling={setBilling}
              customPrice={customPrice}
              onCustomPrice={setCustomPrice}
              twins={avatars}
              disabled={!canEdit}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="io-notes">Notas</Label>
            <textarea
              id="io-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto del prospecto…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </div>

        {/* Derivados (en vivo) + registrado */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Monto anual" value={fmtCurrency(montoAnual)} />
          <Tile label={`Comisión anual (${COMMISSION_RATE * 100}%)`} value={fmtCurrency(comisionAnual)} accent />
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Registrado</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">{fmtDate(opp.created_at)}</p>
            {isAdmin && <p className="mt-0.5 text-xs text-zinc-400">Partner: {opp.partner_name ?? "—"}</p>}
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <Button
              onClick={() =>
                save(
                  {
                    client_name: clientName.trim(),
                    website: website.trim() || null,
                    collaborators,
                    estimated_avatars: avatars,
                    plan,
                    billing_period: billing,
                    custom_price: plan === "enterprise" ? customPrice : null,
                    notes: notes.trim() || null,
                  },
                  "Información guardada.",
                )
              }
              disabled={saving}
              variant="secondary"
              className="px-4"
            >
              {saving ? "Guardando…" : "Guardar información"}
            </Button>
          </div>
        )}
      </section>

      {/* Sección 2: Solicitud de creación de tenant — desde la etapa Piloto */}
      {showTenantWork && (
      <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-baseline justify-between gap-3">
          <SectionTitle>Solicitud de creación de tenant</SectionTitle>
          {gateNote && <span className="text-[11px] text-zinc-400">{gateNote}</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="País de la empresa" htmlFor="cr-country">
            <Input id="cr-country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={!canEdit} placeholder="México" />
          </Field>
          <Field label="Plataforma de videollamadas" htmlFor="cr-platform">
            <Select id="cr-platform" value={platform} onChange={(e) => setPlatform(e.target.value as VideoPlatform | "")} disabled={!canEdit}>
              <option value="">Sin especificar</option>
              {VIDEO_PLATFORMS.map((p) => (
                <option key={p} value={p}>{VIDEO_PLATFORM_LABELS[p]}</option>
              ))}
            </Select>
          </Field>
          <Field label="¿Requiere piloto de 1 mes?" htmlFor="cr-pilot">
            <Select id="cr-pilot" value={pilot} onChange={(e) => setPilot(e.target.value as "" | "yes" | "no")} disabled={!canEdit}>
              <option value="">Sin especificar</option>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </Select>
          </Field>
          <Field label="Nombre del contacto" htmlFor="cr-contact">
            <Input id="cr-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} disabled={!canEdit} placeholder="María Gómez" />
          </Field>
          <Field label="Correo del contacto" htmlFor="cr-email" className="sm:col-span-2">
            <Input id="cr-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} disabled={!canEdit} placeholder="maria@empresa.com" />
          </Field>
        </div>
        {canEdit && (
          <div className="flex justify-end">
            <Button
              onClick={() =>
                save(
                  {
                    country: country.trim() || null,
                    video_platform: platform || null,
                    requires_pilot: pilot === "" ? null : pilot === "yes",
                    contact_name: contactName.trim() || null,
                    contact_email: contactEmail.trim() || null,
                  },
                  "Solicitud de creación de tenant guardada.",
                )
              }
              disabled={saving}
              variant="secondary"
              className="px-4"
            >
              {saving ? "Guardando…" : "Guardar solicitud"}
            </Button>
          </div>
        )}
      </section>
      )}

      {/* Sección 3: Provisión Mensis — desde la etapa Piloto */}
      {showTenantWork && (
      <section className="flex flex-col gap-4 rounded-2xl border border-brand/15 bg-brand/[0.03] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionTitle>Provisión Mensis</SectionTitle>
          <span className="text-[11px] text-zinc-400">
            La contraseña admin se envía por correo, no se guarda aquí.
          </span>
        </div>
        {isAdmin ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tenant URL / ID" htmlFor="pr-url">
                <Input id="pr-url" value={tenantUrl} onChange={(e) => setTenantUrl(e.target.value)} placeholder="acme.mensis.app" />
              </Field>
              <Field label="Usuario admin" htmlFor="pr-user">
                <Input id="pr-user" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="admin@acme.com" />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => save({ tenant_url: tenantUrl.trim() || null, admin_user: adminUser.trim() || null }, "Provisión guardada.")}
                disabled={saving}
                className="px-4"
              >
                {saving ? "Guardando…" : "Guardar provisión"}
              </Button>
            </div>
          </>
        ) : (
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <Row label="Tenant URL / ID">{opp.tenant_url ?? <span className="text-zinc-400">Pendiente</span>}</Row>
            <Row label="Usuario admin">{opp.admin_user ?? <span className="text-zinc-400">Pendiente</span>}</Row>
          </dl>
        )}
      </section>
      )}
    </div>
  );
}
