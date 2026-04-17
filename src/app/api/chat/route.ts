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
    name: "query_tenants",
    description:
      "Query all tenant requests. Returns name, status (requested/in_progress/completed), tenant_id, tenant_url, country, licenses, etc.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_tenant_request",
    description:
      "Create a new tenant provisioning request for the dev team. Extract info from text/screenshots the user provides.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Company/tenant name" },
        description: { type: "string", description: "Company description" },
        acquired_licenses: { type: "number", description: "Number of licenses/avatars" },
        calendar_platform: { type: "string", description: "Calendar platform (Google Calendar, Outlook Calendar)" },
        website: { type: "string", description: "Company website" },
        meeting_platform: { type: "string", description: "Meeting platform (Google Meet, Microsoft Teams, Zoom)" },
        country: { type: "string", description: "Country" },
        contact_name: { type: "string", description: "Contact person name" },
        contact_email: { type: "string", description: "Contact email" },
        contact_phone: { type: "string", description: "Contact phone" },
        employee_count: { type: "number", description: "Number of employees" },
        max_mentor_sessions: { type: "number", description: "Max mentor sessions" },
        max_user_sessions: { type: "number", description: "Max user sessions" },
        pricing_by_user: { type: "number", description: "Price per user" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_tenant",
    description:
      "Update an existing tenant request. Can update status, tenant_id, tenant_url, starknet_wallet, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "UUID of the tenant to update" },
        status: { type: "string", enum: ["requested", "in_progress", "completed"] },
        tenant_id: { type: "string" },
        tenant_url: { type: "string" },
        starknet_wallet: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        acquired_licenses: { type: "number" },
        employee_count: { type: "number" },
      },
      required: ["id"],
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
  {
    name: "create_client",
    description:
      "Create a new client in the clients table. Use the company name as the 'name' field.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Company name" },
        description: { type: "string", description: "What the company does" },
        employee_count: { type: "number", description: "Number of employees" },
        user_count: { type: "number", description: "Number of platform users" },
        avatar_count: { type: "number", description: "Number of avatars/licenses" },
        price_per_avatar: { type: "number", description: "Price per avatar in USD" },
        country: { type: "string", description: "Country" },
        tenant_url: { type: "string", description: "Tenant URL (e.g. company.mensismentor.com)" },
        contact_first_name: { type: "string", description: "Contact first name" },
        contact_last_name: { type: "string", description: "Contact last name" },
        contact_email: { type: "string", description: "Contact email" },
        contact_phone: { type: "string", description: "Contact phone" },
      },
      required: ["name"],
    },
  },
  {
    name: "create_trial",
    description:
      "Create a new trial/pilot in the trials table. Use the company name as the 'name' field.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Company name" },
        description: { type: "string", description: "What the company does" },
        employee_count: { type: "number", description: "Number of employees" },
        user_count: { type: "number", description: "Number of platform users" },
        avatar_count: { type: "number", description: "Number of avatars/licenses" },
        country: { type: "string", description: "Country" },
        tenant_url: { type: "string", description: "Tenant URL (e.g. company.mensismentor.com)" },
        contact_first_name: { type: "string", description: "Contact first name" },
        contact_last_name: { type: "string", description: "Contact last name" },
        contact_email: { type: "string", description: "Contact email" },
        contact_phone: { type: "string", description: "Contact phone" },
      },
      required: ["name"],
    },
  },
  {
    name: "delete_record",
    description:
      "Delete a record from any table (leads, clients, trials, partners). Provide the table name and the record id.",
    input_schema: {
      type: "object" as const,
      properties: {
        table: { type: "string", enum: ["leads", "clients", "trials", "partners"], description: "Table to delete from" },
        id: { type: "string", description: "UUID of the record to delete" },
      },
      required: ["table", "id"],
    },
  },
  {
    name: "create_partner",
    description:
      "Create a confirmed partner in the partners table.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Partner company or person name" },
        description: { type: "string", description: "What the partner does" },
        country: { type: "string", description: "Country" },
        contact_first_name: { type: "string", description: "Contact first name" },
        contact_last_name: { type: "string", description: "Contact last name" },
        contact_email: { type: "string", description: "Contact email" },
        contact_phone: { type: "string", description: "Contact phone" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_contact",
    description:
      "Update an existing contact/lead. Provide the contact id and the fields to update.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "UUID of the contact to update" },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        company: { type: "string" },
        title: { type: "string" },
        category: { type: "string", enum: ["partner", "cliente_final"] },
        status: { type: "string", enum: ["new", "contacted", "responded", "qualified", "proposal", "won", "lost"] },
        source: { type: "string" },
        notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_client",
    description:
      "Update an existing client. Provide the client id and the fields to update.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "UUID of the client to update" },
        name: { type: "string" },
        description: { type: "string" },
        employee_count: { type: "number" },
        user_count: { type: "number" },
        avatar_count: { type: "number" },
        price_per_avatar: { type: "number" },
        country: { type: "string" },
        tenant_url: { type: "string" },
        contact_first_name: { type: "string" },
        contact_last_name: { type: "string" },
        contact_email: { type: "string" },
        contact_phone: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_trial",
    description:
      "Update an existing trial. Provide the trial id and the fields to update.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "UUID of the trial to update" },
        name: { type: "string" },
        description: { type: "string" },
        employee_count: { type: "number" },
        user_count: { type: "number" },
        avatar_count: { type: "number" },
        country: { type: "string" },
        tenant_url: { type: "string" },
        contact_first_name: { type: "string" },
        contact_last_name: { type: "string" },
        contact_email: { type: "string" },
        contact_phone: { type: "string" },
      },
      required: ["id"],
    },
  },
];

const SYSTEM_PROMPT = `You are Mensis AI, the internal sales assistant for Mensis Mentor LLC. You help the team manage their CRM — contacts, partners, trials, clients, goals, and revenue metrics.

Your capabilities:
- Query contacts, partners, trials, clients, and goals from the database using tools
- Create new contacts or partners from pasted conversations (LinkedIn messages, emails, etc)
- Create and update clients, trials, contacts, partners, and tenant requests
- Create tenant provisioning requests for the dev team (extract info from text/screenshots)
- Delete records from any table when asked
- When the user uploads a screenshot and says "create this client/trial", extract all info and use create_client or create_trial accordingly. The 'name' field should be the COMPANY name, not the contact person's name.
- Provide insights about pipeline (contacts/partners → trials → clients), MRR, avatars, and growth potential
- Partners goal: 100 partners by end of 2026
- Avatars goal: 600 avatars by end of 2026

You can see images and screenshots. When the user uploads a screenshot of a client, trial, partner, or lead, extract all visible information and use the appropriate tool to create or update the record.

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
    case "query_tenants": {
      const { data } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      return JSON.stringify(data ?? []);
    }
    case "create_tenant_request": {
      const { data, error } = await supabase
        .from("tenants")
        .insert(toolInput)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "update_tenant": {
      const { id, ...updates } = toolInput as { id: string; [key: string]: unknown };
      if (updates.status === "completed") {
        updates.completed_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from("tenants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "create_client": {
      const { data, error } = await supabase
        .from("clients")
        .insert(toolInput)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "create_trial": {
      const { data, error } = await supabase
        .from("trials")
        .insert(toolInput)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "delete_record": {
      const { table, id } = toolInput as { table: string; id: string };
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify({ success: true, deleted: id });
    }
    case "create_partner": {
      const { data, error } = await supabase
        .from("partners")
        .insert(toolInput)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "update_contact": {
      const { id, ...updates } = toolInput as { id: string; [key: string]: unknown };
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "update_client": {
      const { id, ...updates } = toolInput as { id: string; [key: string]: unknown };
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data);
    }
    case "update_trial": {
      const { id, ...updates } = toolInput as { id: string; [key: string]: unknown };
      const { data, error } = await supabase
        .from("trials")
        .update(updates)
        .eq("id", id)
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
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await request.json();

    const { data: contextData } = await supabase
      .from("context")
      .select("content")
      .limit(1)
      .single();

    const businessContext = contextData?.content
      ? `\n\n## Business Context (provided by the team):\n${contextData.content}`
      : "";

    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string | Anthropic.ContentBlockParam[] }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }),
    );

    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT + businessContext,
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
        system: SYSTEM_PROMPT + businessContext,
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
