import type Anthropic from "@anthropic-ai/sdk";

const obj = { type: "object" as const };
const str = (desc: string) => ({ type: "string" as const, description: desc });
const num = (desc: string) => ({ type: "number" as const, description: desc });
const strEnum = (values: string[], desc: string) => ({
  type: "string" as const,
  enum: values,
  description: desc,
});

function queryTool(name: string, description: string): Anthropic.Tool {
  return { name, description, input_schema: { ...obj, properties: {}, required: [] } };
}

export const tools: Anthropic.Tool[] = [
  queryTool("query_contacts", "Query all contacts/leads from the database. Returns name, email, company, status, category, source, notes, phone, title."),
  queryTool("query_clients", "Query all clients from the database. Returns name, description, employee_count, user_count, avatar_count, price_per_avatar, country, tenant_url, contact info."),
  queryTool("query_trials", "Query all trials/pilots from the database. Returns name, description, employee_count, user_count, avatar_count, country, tenant_url, contact info."),
  queryTool("query_partners", "Query all partners from the database. Partners are leads with category 'partner'."),
  queryTool("query_goals", "Query goals with real-time avatar/partner counts. Returns goals, current_avatars_real, current_partners_real."),
  queryTool("query_objectives", "Query all strategic objectives/goals. Returns name, description, category (sales/product/fundraising), status, progress, target_date."),
  queryTool("query_tenants", "Query all tenant requests. Returns name, status (requested/in_progress/completed), tenant_id, tenant_url, country, licenses."),

  {
    name: "create_contact",
    description: "Create a new contact/lead. Extract info from conversations the user pastes.",
    input_schema: {
      ...obj,
      properties: {
        name: str("Full name of the contact"),
        email: str("Email address"),
        phone: str("Phone number"),
        company: str("Company name"),
        title: str("Job title or company description"),
        category: strEnum(["partner", "cliente_final"], "partner or cliente_final"),
        status: strEnum(["new", "contacted", "responded", "qualified", "proposal", "won", "lost"], "Current status"),
        source: str("Where this lead came from"),
        notes: str("Summary notes about the interaction"),
      },
      required: ["name", "category"],
    },
  },
  {
    name: "create_client",
    description: "Create a new client. Use the company name as the 'name' field.",
    input_schema: {
      ...obj,
      properties: {
        name: str("Company name"),
        description: str("What the company does"),
        employee_count: num("Number of employees"),
        user_count: num("Number of platform users"),
        avatar_count: num("Number of avatars/licenses"),
        price_per_avatar: num("Price per avatar in USD"),
        country: str("Country"),
        tenant_url: str("Tenant URL (e.g. company.mensismentor.com)"),
        contact_first_name: str("Contact first name"),
        contact_last_name: str("Contact last name"),
        contact_email: str("Contact email"),
        contact_phone: str("Contact phone"),
      },
      required: ["name"],
    },
  },
  {
    name: "create_trial",
    description: "Create a new trial/pilot. Use the company name as the 'name' field.",
    input_schema: {
      ...obj,
      properties: {
        name: str("Company name"),
        description: str("What the company does"),
        employee_count: num("Number of employees"),
        user_count: num("Number of platform users"),
        avatar_count: num("Number of avatars/licenses"),
        country: str("Country"),
        tenant_url: str("Tenant URL"),
        contact_first_name: str("Contact first name"),
        contact_last_name: str("Contact last name"),
        contact_email: str("Contact email"),
        contact_phone: str("Contact phone"),
      },
      required: ["name"],
    },
  },
  {
    name: "create_partner",
    description: "Create a confirmed partner in the partners table.",
    input_schema: {
      ...obj,
      properties: {
        name: str("Partner company or person name"),
        description: str("What the partner does"),
        country: str("Country"),
        contact_first_name: str("Contact first name"),
        contact_last_name: str("Contact last name"),
        contact_email: str("Contact email"),
        contact_phone: str("Contact phone"),
      },
      required: ["name"],
    },
  },
  {
    name: "create_goal",
    description: "Create a new monthly goal. Provide month as YYYY-MM-01 format.",
    input_schema: {
      ...obj,
      properties: {
        month: str("Month in YYYY-MM-01 format"),
        current_avatars: num("Current number of avatars"),
        target_avatars: num("Target number of avatars"),
        target_partners: num("Target number of partners"),
        current_partners: num("Current number of partners"),
      },
      required: ["month", "target_avatars"],
    },
  },
  {
    name: "create_objective",
    description: "Create a new strategic objective/goal.",
    input_schema: {
      ...obj,
      properties: {
        name: str("Objective name"),
        description: str("What this objective entails"),
        category: strEnum(["sales", "product", "fundraising"], "Category"),
        status: strEnum(["not_started", "in_progress", "completed"], "Status"),
        target_date: str("Target date YYYY-MM-DD"),
        progress: num("Progress percentage 0-100"),
      },
      required: ["name", "category"],
    },
  },
  {
    name: "create_tenant_request",
    description: "Create a new tenant provisioning request for the dev team.",
    input_schema: {
      ...obj,
      properties: {
        name: str("Company/tenant name"),
        description: str("Company description"),
        acquired_licenses: num("Number of licenses/avatars"),
        calendar_platform: str("Calendar platform"),
        website: str("Company website"),
        meeting_platform: str("Meeting platform"),
        country: str("Country"),
        contact_name: str("Contact person name"),
        contact_email: str("Contact email"),
        contact_phone: str("Contact phone"),
        employee_count: num("Number of employees"),
        max_mentor_sessions: num("Max mentor sessions"),
        max_user_sessions: num("Max user sessions"),
        pricing_by_user: num("Price per user"),
      },
      required: ["name"],
    },
  },
  {
    name: "update_contact",
    description: "Update an existing contact/lead. Provide the contact id and fields to update.",
    input_schema: {
      ...obj,
      properties: {
        id: str("UUID of the contact to update"),
        name: { type: "string" }, email: { type: "string" }, phone: { type: "string" },
        company: { type: "string" }, title: { type: "string" },
        category: strEnum(["partner", "cliente_final"], "Category"),
        status: strEnum(["new", "contacted", "responded", "qualified", "proposal", "won", "lost"], "Status"),
        source: { type: "string" }, notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_client",
    description: "Update an existing client. Provide the client id and fields to update.",
    input_schema: {
      ...obj,
      properties: {
        id: str("UUID of the client to update"),
        name: { type: "string" }, description: { type: "string" },
        employee_count: { type: "number" }, user_count: { type: "number" },
        avatar_count: { type: "number" }, price_per_avatar: { type: "number" },
        country: { type: "string" }, tenant_url: { type: "string" },
        contact_first_name: { type: "string" }, contact_last_name: { type: "string" },
        contact_email: { type: "string" }, contact_phone: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_trial",
    description: "Update an existing trial. Provide the trial id and fields to update.",
    input_schema: {
      ...obj,
      properties: {
        id: str("UUID of the trial to update"),
        name: { type: "string" }, description: { type: "string" },
        employee_count: { type: "number" }, user_count: { type: "number" },
        avatar_count: { type: "number" }, country: { type: "string" },
        tenant_url: { type: "string" },
        contact_first_name: { type: "string" }, contact_last_name: { type: "string" },
        contact_email: { type: "string" }, contact_phone: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_goal",
    description: "Update an existing goal. Provide the goal id and fields to update.",
    input_schema: {
      ...obj,
      properties: {
        id: str("UUID of the goal to update"),
        current_avatars: { type: "number" }, target_avatars: { type: "number" },
        target_partners: { type: "number" }, current_partners: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_objective",
    description: "Update an existing objective. Provide the id and fields to update.",
    input_schema: {
      ...obj,
      properties: {
        id: str("UUID of the objective"),
        name: { type: "string" }, description: { type: "string" },
        status: strEnum(["not_started", "in_progress", "completed"], "Status"),
        progress: { type: "number" }, target_date: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_tenant",
    description: "Update an existing tenant request.",
    input_schema: {
      ...obj,
      properties: {
        id: str("UUID of the tenant to update"),
        status: strEnum(["requested", "in_progress", "completed"], "Status"),
        tenant_id: { type: "string" }, tenant_url: { type: "string" },
        starknet_wallet: { type: "string" }, name: { type: "string" },
        description: { type: "string" }, acquired_licenses: { type: "number" },
        employee_count: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_record",
    description: "Delete a record from any table (leads, clients, trials, partners).",
    input_schema: {
      ...obj,
      properties: {
        table: strEnum(["leads", "clients", "trials", "partners"], "Table to delete from"),
        id: str("UUID of the record to delete"),
      },
      required: ["table", "id"],
    },
  },
];
