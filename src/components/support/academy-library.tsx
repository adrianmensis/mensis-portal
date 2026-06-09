"use client";

import { useState } from "react";
import { ACADEMY } from "@/lib/support-material";
import { VideoCard } from "./video-card";

export function AcademyLibrary() {
  // First folder open by default.
  const [open, setOpen] = useState<Record<string, boolean>>({ [ACADEMY[0]?.id]: true });

  return (
    <div className="flex flex-col gap-4">
      {ACADEMY.map((pl) => {
        const isOpen = open[pl.id];
        return (
          <div key={pl.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <button
                onClick={() => setOpen((p) => ({ ...p, [pl.id]: !p[pl.id] }))}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h6a2 2 0 0 1 2 2 2 2 0 0 1 2-2h6v14h-6a2 2 0 0 0-2 2 2 2 0 0 0-2-2H4z" />
                  </svg>
                </span>
                <div>
                  <div className="text-sm font-semibold text-zinc-800">{pl.title}</div>
                  <div className="text-xs text-zinc-400">
                    {pl.videos.length} video{pl.videos.length === 1 ? "" : "s"}
                    {pl.description ? ` · ${pl.description}` : ""}
                  </div>
                </div>
              </button>
              <a
                href={`https://www.youtube.com/playlist?list=${pl.playlistId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-brand hover:underline sm:inline-flex"
              >
                Ver playlist
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" /><path d="M7 7h10v10" />
                </svg>
              </a>
            </div>

            {isOpen && (
              <div className="border-t border-zinc-100 bg-zinc-50/40 p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pl.videos.map((v) => (
                    <VideoCard key={v.youtubeId} item={{ type: "video", title: v.title, url: `https://www.youtube.com/watch?v=${v.youtubeId}`, youtubeId: v.youtubeId }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
