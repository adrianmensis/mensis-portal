"use client";

import { useState, useEffect, useCallback } from "react";

export function ContextEditor() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/context")
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content ?? "");
        setLoading(false);
      });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch("/api/context", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [content]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [save]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-brand" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Context
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Business context the Sales Agent uses for analysis and recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-emerald-600">Saved</span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-3">
          <p className="text-xs text-zinc-400">
            Write about your company, products, pricing, sales strategies, goals, competitors, etc.
            The Sales Agent will use this as context when answering analytical questions.
          </p>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Example:\n\n## About Mensis Mentor\nMensis Mentor is a SaaS platform that...\n\n## Pricing\n- Standard: $30/avatar/month\n- Enterprise: Custom pricing\n\n## Sales Strategy\n- Target market: Latin America & US Hispanic\n- Focus on partners who resell to end clients\n\n## Competitors\n- Competitor A: ...\n- Competitor B: ...`}
          className="min-h-[500px] w-full resize-y bg-transparent px-5 py-4 text-sm leading-relaxed text-zinc-800 placeholder:text-zinc-300 focus:outline-none"
        />
      </div>

      <p className="text-xs text-zinc-400">
        Tip: Press Cmd+S / Ctrl+S to save quickly
      </p>
    </div>
  );
}
