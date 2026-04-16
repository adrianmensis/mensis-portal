"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type ImageAttachment = {
  base64: string;
  mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp";
  preview: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: ImageAttachment[];
};

function fileToBase64(file: File): Promise<ImageAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve({
        base64,
        mediaType: file.type as ImageAttachment["mediaType"],
        preview: dataUrl,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files).filter((f) =>
      ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(f.type),
    );
    const converted = await Promise.all(valid.map(fileToBase64));
    setImages((prev) => [...prev, ...converted]);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if ((!text && images.length === 0) || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text || "(image attached)",
      images: images.length > 0 ? [...images] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImages([]);
    setLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const apiMessages = [...messages, userMsg].map((m) => {
      if (m.images && m.images.length > 0) {
        const content: Array<
          | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
          | { type: "text"; text: string }
        > = [];
        for (const img of m.images) {
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: img.mediaType,
              data: img.base64,
            },
          });
        }
        if (m.content && m.content !== "(image attached)") {
          content.push({ type: "text", text: m.content });
        }
        return { role: m.role, content };
      }
      return { role: m.role, content: m.content };
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
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

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      const dt = new DataTransfer();
      imageFiles.forEach((f) => dt.items.add(f));
      handleFiles(dt.files);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  const isEmpty = messages.length === 0;
  const hasContent = input.trim() || images.length > 0;

  const imagePreview = images.length > 0 && (
    <div className="flex gap-2 px-4 pt-3 flex-wrap">
      {images.map((img, i) => (
        <div key={i} className="relative group">
          <img
            src={img.preview}
            alt=""
            className="h-16 w-16 rounded-lg object-cover ring-1 ring-zinc-200"
          />
          <button
            type="button"
            onClick={() => removeImage(i)}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );

  const attachButton = (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:text-zinc-600"
      title="Attach image"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </button>
  );

  return (
    <div
      className="-m-8 flex h-screen flex-col bg-[#fafbfd]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-4 -mt-20">
            <h2 className="mb-8 text-4xl font-light tracking-tight text-zinc-800">
              What can I help you sell today?
            </h2>

            <div
              className="w-full max-w-3xl rounded-2xl bg-white p-1.5 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-900/5"
              onPaste={handlePaste}
            >
              {imagePreview}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or paste/drop a screenshot..."
                rows={3}
                className="w-full resize-none rounded-xl bg-transparent px-5 py-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              />
              <div className="flex items-center justify-between px-2 pb-2">
                {attachButton}
                <button
                  type="button"
                  onClick={handleSubmit as unknown as React.MouseEventHandler}
                  disabled={!hasContent || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white transition-all hover:bg-brand/90 disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                      {msg.images && msg.images.length > 0 && (
                        <div className="mb-2 flex gap-2 flex-wrap">
                          {msg.images.map((img, i) => (
                            <img
                              key={i}
                              src={img.preview}
                              alt=""
                              className="max-h-40 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}
                      {msg.content !== "(image attached)" && (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
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
        <div className="px-6 pb-6 pt-2" onPaste={handlePaste}>
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-white p-1.5 shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-900/5">
              {imagePreview}
              <div className="flex items-end">
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
              </div>
              <div className="flex items-center justify-between px-2 pb-2">
                {attachButton}
                <button
                  type="submit"
                  disabled={!hasContent || loading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-all hover:bg-brand/90 disabled:opacity-30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
