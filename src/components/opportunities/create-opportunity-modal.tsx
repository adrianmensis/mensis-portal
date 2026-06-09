"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { OpportunityForm } from "./opportunity-form";

export function CreateOpportunityModal({
  onCreated,
  label = "+ Nueva oportunidad",
  variant = "primary",
}: {
  onCreated?: () => void;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva oportunidad"
        subtitle="Registra un nuevo cliente potencial."
      >
        <OpportunityForm
          onSuccess={() => {
            setOpen(false);
            onCreated?.();
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
