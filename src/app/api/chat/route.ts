import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { SYSTEM_PROMPT } from "@/lib/claude/system-prompt";
import { tools } from "@/lib/claude/tools";
import { handleToolCall } from "@/lib/claude/handlers";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 2048;

const anthropic = new Anthropic();

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

    const systemPrompt = contextData?.content
      ? `${SYSTEM_PROMPT}\n\n## Business Context (provided by the team):\n${contextData.content}`
      : SYSTEM_PROMPT;

    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string | Anthropic.ContentBlockParam[] }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }),
    );

    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
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
          supabase,
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
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
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
