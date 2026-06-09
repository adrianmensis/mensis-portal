"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { MaterialItem } from "@/lib/support-material";

export function VideoCard({ item }: { item: MaterialItem }) {
  const [open, setOpen] = useState(false);
  const hasMedia = Boolean(item.youtubeId || item.playlistId);
  const thumb = item.youtubeId
    ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`
    : null;
  const embedUrl = item.youtubeId
    ? `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1`
    : item.playlistId
      ? `https://www.youtube.com/embed/videoseries?list=${item.playlistId}&autoplay=1`
      : "";

  function onClick() {
    if (hasMedia) setOpen(true);
    else if (item.url && item.url !== "#") window.open(item.url, "_blank");
  }

  return (
    <>
      <button
        onClick={onClick}
        className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-brand to-brand/70">
          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          )}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-brand">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {item.playlistId && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="14" y2="18" />
                <polyline points="3 6 4 7 6 5" />
              </svg>
              Playlist
            </span>
          )}
          {!hasMedia && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white">
              Próximamente
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="text-sm font-semibold text-zinc-800">{item.title}</h3>
          {item.description && <p className="text-xs text-zinc-500">{item.description}</p>}
        </div>
      </button>

      {hasMedia && (
        <Modal open={open} onClose={() => setOpen(false)} title={item.title}>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              className="h-full w-full"
              src={open ? embedUrl : ""}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Modal>
      )}
    </>
  );
}
