import { Badge, type BadgeTone } from "./badge";
import { STATUS_LABELS, type OpportunityStatus } from "@/lib/types";

const TONE_BY_STATUS: Record<OpportunityStatus, BadgeTone> = {
  pending: "amber",
  approved: "blue",
  won: "emerald",
  lost: "neutral",
};

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{STATUS_LABELS[status]}</Badge>;
}
