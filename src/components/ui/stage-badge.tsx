import { Badge, type BadgeTone } from "./badge";
import { STAGE_LABELS, type OpportunityStage } from "@/lib/types";

const TONE_BY_STAGE: Record<OpportunityStage, BadgeTone> = {
  lead: "neutral",
  meeting_scheduled: "amber",
  pilot: "blue",
  tenant_creation: "brand",
  client: "emerald",
  closed_lost: "red",
};

export function StageBadge({ stage }: { stage: OpportunityStage }) {
  return <Badge tone={TONE_BY_STAGE[stage]}>{STAGE_LABELS[stage]}</Badge>;
}
