import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "query_contacts",
    description:
      "Query all contacts/leads from the database. Returns name, email, company, status, category, source, notes, phone, title.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "query_clients",
    description:
      "Query all clients from the database. Returns name, description, employee_count, user_count, avatar_count, price_per_avatar, country, tenant_url, contact info.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "query_trials",
    description:
      "Query all trials/pilots from the database. Returns name, description, employee_count, user_count, avatar_count, country, tenant_url, contact info.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "query_partners",
    description:
      "Query all partners from the database. Partners are leads with category 'partner'.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "query_goals",
    description:
      "Query goals. Returns month, current_avatars, target_avatars, target_partners.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_contact",
    description:
      "Create a new contact/lead in the database. Extract info from conversations the user pastes (LinkedIn, email, etc).",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Full name of the contact" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number" },
        company: { type: "string", description: "Company name" },
        title: {
          type: "string",
          description: "Job title or company description",
        },
        category: {
          type: "string",
          enum: ["partner", "cliente_final"],
          description: "partner or cliente_final (end client)",
        },
        status: {
          type: "string",
          enum: [
            "new",
            "contacted",
            "responded",
            "qualified",
            "proposal",
            "won",
            "lost",
          ],
          description: "Current status of the lead",
        },
        source: {
          type: "string",
          description: "Where this lead came from (LinkedIn, Email, Call, etc)",
        },
        notes: {
          type: "string",
          description: "Summary notes about the interaction",
        },
      },
      required: ["name", "category"],
    },
  },
];

const SYSTEM_PROMPT = `You are Mensis AI, the internal sales assistant for Mensis Mentor LLC. You help the team manage their CRM — contacts, partners, trials, clients, goals, and revenue metrics.

Your capabilities:
- Query contacts, partners, trials, clients, and goals from the database using tools
- Create new contacts or partners from pasted conversations (LinkedIn messages, emails, etc)
- Provide insights about pipeline (contacts/partners → trials → clients), MRR, avatars, and growth potential
- Partners goal: 100 partners by end of 2026
- Avatars goal: 600 avatars by end of 2026

When the user pastes a conversation or text about a potential lead:
1. Extract the person's name, company, email, phone, and any other relevant info
2. Determine if they are a "partner" or "cliente_final" (end client) — if unclear, ask
3. Determine the appropriate status based on the conversation context
4. Create the contact using the create_contact tool
5. Confirm what was created

Always respond in the same language the user writes in (Spanish or English).
Be concise and helpful. Use markdown for formatting when useful.`;

async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
) {
  const supabase = await createClient();

  switch (toolName) {
    case "query_contacts": {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("category", "cliente_final")
        .order("created_at", { ascending: false });
      return JSON.stringify(data ?? []);
    }
    case "query_partners": {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("category", "partner")
        .order("created_at", { ascending: false });
      return JSON.stringify(data ?? []);
    }
    case "query_clients": {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      return JSON.stringify(data ?? []);
    }
    case "query_trials": {
      const { data } = await supabase
        .from("trials")
        .select("*")
        .order("created_at", { ascending: false });
      return JSON.stringify(data ?? []);
    }
    case "query_goals": {
      const { data } = await supabase
        .from("goals")
        .select("*")
        .order("month", { ascending: true });
      return JSON.stringify(data ?? []);
    }
    case "create_contact": {
      const { data, error } = await supabase
        .from("leads")
        .insert(toolInput)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await request.json();

  const anthropicMessages: Anthropic.MessageParam[] = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }),
  );

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages: anthropicMessages,
  });

  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (block) => block.type === "tool_use",
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      if (toolUse.type !== "tool_use") continue;
      const result = await handleToolCall(
        toolUse.name,
        toolUse.input as Record<string, unknown>,
      );
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: result,
      });
    }

    anthropicMessages.push({ role: "assistant", content: response.content });
    anthropicMessages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: anthropicMessages,
    });
  }

  const textBlock = response.content.find((block) => block.type === "text");
  const content =
    textBlock && textBlock.type === "text"
      ? textBlock.text
      : "No response generated.";

  return Response.json({ content });
}
