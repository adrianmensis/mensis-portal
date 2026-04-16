"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.error
            ? `Error: ${data.error}`
            : (data.content ?? "Sorry, something went wrong."),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Failed to connect. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="-m-8 flex h-screen flex-col bg-[#fafbfd]">
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-4 -mt-20">
            <h2 className="mb-8 text-4xl font-light tracking-tight text-zinc-800">
              What can I help you sell today?
            </h2>

            <div className="w-full max-w-3xl rounded-2xl bg-white p-1.5 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-900/5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                rows={3}
                className="w-full resize-none rounded-xl bg-transparent px-5 py-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              />
              <div className="flex items-center justify-end px-2 pb-2">
                <button
                  type="button"
                  onClick={handleSubmit as unknown as React.MouseEventHandler}
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white transition-all hover:bg-brand/90 disabled:opacity-30"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl bg-[rgb(232,237,248)] px-5 py-3 text-[15px] leading-relaxed text-zinc-800">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-zinc max-w-none text-[15px] leading-relaxed prose-headings:text-zinc-800 prose-headings:font-semibold prose-p:text-zinc-700 prose-strong:text-zinc-800 prose-li:text-zinc-700 prose-li:marker:text-zinc-400">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-1.5 py-4">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-300 [animation-delay:300ms]" />
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="px-6 pb-6 pt-2">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex items-end rounded-2xl bg-white p-1.5 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-900/5">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Reply..."
                rows={2}
                className="flex-1 resize-none bg-transparent px-5 py-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                style={{ maxHeight: "150px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 150)}px`;
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="mb-1.5 mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-all hover:bg-brand/90 disabled:opacity-30"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
