"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/text-field";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneField } from "@/components/ui/phone-field";

type Created = { email: string; password: string };

function today() {
  // YYYY-MM-DD in local time for the date input default.
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CreatePartnerModal({
  onCreated,
  label = "+ New partner",
  variant = "primary",
}: {
  onCreated?: () => void;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  function close() {
    setOpen(false);
    setError(null);
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
      linkedin_url: String(fd.get("linkedin_url") ?? ""),
      entry_date: String(fd.get("entry_date") ?? ""),
    };
    startTransition(async () => {
      try {
        const res = await api.partners.create(input);
        setCreated(res);
        setError(null);
        onCreated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create partner.");
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
        onClose={close}
        title="New partner"
        subtitle={created ? undefined : "Capture the partner's intake details."}
      >
        {created ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Partner created ✓</p>
              <p className="mt-1 text-sm text-emerald-700">
                Share these credentials securely — the password is shown only once.
              </p>
              <div className="mt-3 grid gap-1 font-mono text-sm text-emerald-900">
                <span>Email: {created.email}</span>
                <span>Password: {created.password}</span>
              </div>
            </div>
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
            <TextField label="Nombre completo *" name="full_name" required placeholder="María Gómez" wrapperClassName="sm:col-span-2" />
            <TextField label="Correo electrónico *" name="email" type="email" required placeholder="maria@partner.com" />
            <PhoneField label="Teléfono personal" name="phone" />
            <CountrySelect label="País de residencia actual" name="country" />
            <TextField label="Fecha de ingreso" name="entry_date" type="date" defaultValue={today()} />
            <TextField label="Enlace a perfil de LinkedIn" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" wrapperClassName="sm:col-span-2" />

            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-500 sm:col-span-2">{error}</p>
            )}

            <div className="sm:col-span-2 mt-2 flex items-center gap-3">
              <Button type="submit" disabled={pending} className="px-6">
                {pending ? "Creating…" : "Create partner"}
              </Button>
              <button
                type="button"
                onClick={close}
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
