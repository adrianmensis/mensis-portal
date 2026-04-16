"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  category: string;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
};

type FollowUp = {
  id: string;
  lead_id: string;
  content: string;
  type: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-zinc-100 text-zinc-700",
  contacted: "bg-blue-100 text-blue-700",
  responded: "bg-indigo-100 text-indigo-700",
  qualified: "bg-amber-100 text-amber-700",
  proposal: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const TYPE_ICONS: Record<string, string> = {
  call: "phone",
  email: "mail",
  meeting: "calendar",
  note: "file-text",
  task: "check-square",
};

const TYPE_COLORS: Record<string, string> = {
  call: "bg-green-100 text-green-700",
  email: "bg-blue-100 text-blue-700",
  meeting: "bg-purple-100 text-purple-700",
  note: "bg-zinc-100 text-zinc-700",
  task: "bg-amber-100 text-amber-700",
};

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-sm text-zinc-800">{value}</p>
    </div>
  );
}

export function ContactDetail({
  lead,
  followUps: initialFollowUps,
}: {
  lead: Lead;
  followUps: FollowUp[];
}) {
  const router = useRouter();
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("note");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    const res = await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        content: content.trim(),
        type,
        due_date: dueDate || null,
      }),
    });

    if (res.ok) {
      const newFollowUp = await res.json();
      setFollowUps((prev) => [newFollowUp, ...prev]);
      setContent("");
      setType("note");
      setDueDate("");
      setShowForm(false);
    }
    setSaving(false);
  }

  async function toggleDone(followUp: FollowUp) {
    const res = await fetch("/api/follow-ups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: followUp.id, done: !followUp.done }),
    });

    if (res.ok) {
      setFollowUps((prev) =>
        prev.map((f) => (f.id === followUp.id ? { ...f, done: !f.done } : f)),
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-zinc-900">{lead.name}</h1>
          {lead.company && (
            <p className="mt-0.5 text-sm text-zinc-500">{lead.company}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? "bg-zinc-100 text-zinc-700"}`}>
              {lead.status}
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              {lead.category === "partner" ? "Partner" : "Cliente Final"}
            </span>
            {lead.source && (
              <span className="rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-500">
                {lead.source}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Field label="Email" value={lead.email} />
            <Field label="Phone" value={lead.phone} />
            <Field label="Title" value={lead.title} />
            <Field
              label="Created"
              value={new Date(lead.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />
          </div>

          {lead.notes && (
            <div className="mt-6 border-t border-zinc-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Notes</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <h2 className="text-base font-semibold text-zinc-900">
              Follow-ups
              <span className="ml-2 text-sm font-normal text-zinc-400">
                {followUps.length}
              </span>
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand/90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="border-b border-zinc-100 px-6 py-4">
              <div className="flex flex-wrap gap-3">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                </select>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10"
                  placeholder="Due date"
                />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What needs to happen next?"
                rows={2}
                className="mt-3 w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || saving}
                  className="rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-zinc-100">
            {followUps.length > 0 ? (
              followUps.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-start gap-3 px-6 py-4 transition-colors ${f.done ? "opacity-50" : ""}`}
                >
                  <button
                    onClick={() => toggleDone(f)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      f.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 hover:border-zinc-400"
                    }`}
                  >
                    {f.done && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${TYPE_COLORS[f.type] ?? "bg-zinc-100 text-zinc-700"}`}>
                        {f.type}
                      </span>
                      {f.due_date && (
                        <span className="text-xs text-zinc-400">
                          Due {new Date(f.due_date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-zinc-300">
                        {new Date(f.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm leading-relaxed ${f.done ? "line-through text-zinc-400" : "text-zinc-700"}`}>
                      {f.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                No follow-ups yet. Add one to start tracking.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
