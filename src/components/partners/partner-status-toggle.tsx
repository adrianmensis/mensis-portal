"use client";

import { useEffect, useState, useTransition } from "react";
import { api } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/use-toast";
import { Switch } from "@/components/ui/toggle";

// Interactive Active/Inactive switch for a partner. Optimista: cambia al
// instante y revierte si el servidor rechaza.
export function PartnerStatusToggle({
  partnerId,
  active,
  onChanged,
}: {
  partnerId: string;
  active: boolean;
  // Se llama cuando el cambio quedó confirmado por el servidor, para que la
  // lista recargue y el resto de la fila deje de mostrar datos viejos.
  onChanged?: () => void;
}) {
  const [val, setVal] = useState(active);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  // La fila se reutiliza entre recargas de la lista (misma key), así que el
  // estado local no se reinicia solo: sin esto el switch se queda pegado en el
  // valor viejo cuando los datos llegan actualizados desde otro lado.
  useEffect(() => {
    setVal(active);
  }, [active]);

  function toggle() {
    const next = !val;
    setVal(next);
    startTransition(async () => {
      try {
        const updated = await api.partners.setActive(partnerId, next);
        setVal(updated.active);
        toast.success(next ? "Partner activado." : "Partner desactivado.");
        onChanged?.();
      } catch (err) {
        // Antes esto se tragaba el error en silencio: el switch volvía a su
        // sitio y parecía que "no se actualizaba" sin decir por qué.
        setVal(!next);
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch checked={val} onChange={toggle} disabled={pending} label="Activar o desactivar partner" />
      <span className={`text-xs font-medium ${val ? "text-emerald-600" : "text-zinc-400"}`}>
        {val ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}
