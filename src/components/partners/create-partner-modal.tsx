"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api/client";
import {
  DEFAULT_PARTNER_STAGE,
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LABELS,
  PARTNER_STAGES,
  type PartnerCategory,
  type PartnerStage,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneField } from "@/components/ui/phone-field";

type Created = { full_name: string; email: string; password: string };

function today() {
  // YYYY-MM-DD in local time for the date input default.
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// A read-only credential with a copy button. The password is only ever shown
// here, so copying has to be one click.
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied (insecure context / permission): the value is still
      // selectable on screen, so there's nothing to recover from.
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`copy-${label}`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={`copy-${label}`}
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 font-mono text-sm text-zinc-900 outline-none focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
        />
        <button
          type="button"
          onClick={copy}
          className={`h-11 shrink-0 rounded-xl border px-3.5 text-sm font-medium transition-colors ${
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

// Mensaje de bienvenida listo para pegar en correo o WhatsApp. La contraseña
// no se guarda en ningún lado, así que este es el único momento en que puede
// armarse: después solo queda restablecerla desde la ficha del partner.
function welcomeMessage(created: Created) {
  const portal = typeof window === "undefined" ? "" : window.location.origin;
  return [
    `¡Hola ${created.full_name}!`,
    "",
    "Ya tienes acceso al Portal de Partners de Mensis. Estos son tus datos de ingreso:",
    "",
    `Portal: ${portal}`,
    `Usuario: ${created.email}`,
    `Contraseña: ${created.password}`,
    "",
    "Te recomendamos cambiar la contraseña la primera vez que entres.",
    "",
    "¡Bienvenido a la red!",
  ].join("\n");
}

function CopyMessageButton({ created }: { created: Created }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(welcomeMessage(created));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Portapapeles denegado: las credenciales siguen visibles arriba.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex h-11 items-center rounded-xl border px-4 text-sm font-medium transition-colors ${
        copied
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {copied ? "Mensaje copiado ✓" : "Copiar mensaje de bienvenida"}
    </button>
  );
}

export function CreatePartnerModal({
  onCreated,
  label = "+ Nuevo partner",
  variant = "primary",
}: {
  onCreated?: () => void;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Set once the partner exists; swaps the form modal for the credentials one.
  const [created, setCreated] = useState<Created | null>(null);

  function closeForm() {
    setOpen(false);
    setError(null);
  }

  function dismissCredentials() {
    setCreated(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      full_name: String(fd.get("full_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      country: String(fd.get("country") ?? ""),
      // One link field: a website or a LinkedIn profile, both land in linkedin_url.
      linkedin_url: String(fd.get("linkedin_url") ?? ""),
      entry_date: String(fd.get("entry_date") ?? ""),
      category: (String(fd.get("category") ?? "") || null) as PartnerCategory | null,
      process_stage: String(fd.get("process_stage") ?? "") as PartnerStage,
    };
    startTransition(async () => {
      try {
        const res = await api.partners.create(input);
        setError(null);
        setOpen(false);
        setCreated({ ...res, full_name: input.full_name });
        onCreated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo crear el partner.");
      }
    });
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Modal
        open={open}
        onClose={closeForm}
        title="Nuevo partner"
        subtitle="Carga los datos de alta del partner."
      >
        <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nombre completo *" name="full_name" required placeholder="María Gómez" wrapperClassName="sm:col-span-2" />
          <TextField label="Correo electrónico *" name="email" type="email" required placeholder="maria@partner.com" />
          <PhoneField label="Teléfono personal" name="phone" />
          <CountrySelect label="País de residencia actual" name="country" />
          <TextField label="Fecha de ingreso" name="entry_date" type="date" defaultValue={today()} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Categoría</Label>
            <Select id="category" name="category" defaultValue="">
              <option value="">Sin especificar</option>
              {PARTNER_CATEGORIES.map((c) => (
                <option key={c} value={c}>{PARTNER_CATEGORY_LABELS[c]}</option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="process_stage">Etapa del proceso</Label>
            <Select id="process_stage" name="process_stage" defaultValue={DEFAULT_PARTNER_STAGE}>
              {PARTNER_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <TextField label="Sitio web o LinkedIn" name="linkedin_url" type="url" placeholder="https://acme.com o https://linkedin.com/in/…" wrapperClassName="sm:col-span-2" />

          {error && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-500 sm:col-span-2">{error}</p>
          )}

          <div className="sm:col-span-2 mt-2 flex items-center gap-3">
            <Button type="submit" disabled={pending} className="px-6">
              {pending ? "Creando…" : "Crear partner"}
            </Button>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* The password exists only in this render — never stored, never resent.
          Not dismissible by backdrop or Escape so it can't be lost by accident. */}
      <Modal
        open={created !== null}
        onClose={dismissCredentials}
        title="Partner creado"
        subtitle={created ? `${created.full_name} ya puede iniciar sesión.` : undefined}
        dismissible={false}
      >
        {created && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-amber-50 px-3.5 py-2.5">
              <p className="text-sm text-amber-800">
                Copia la contraseña ahora: se genera una sola vez y no vuelve a mostrarse.
                Si la pierdes, tendrás que restablecerla desde la ficha del partner.
              </p>
            </div>

            <CopyRow label="Correo" value={created.email} />
            <CopyRow label="Contraseña" value={created.password} />

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={dismissCredentials} className="px-6">
                Listo
              </Button>
              {/* El mensaje completo en un clic: es lo que de verdad se le
                  envía al partner, con el enlace del portal incluido. */}
              <CopyMessageButton created={created} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
