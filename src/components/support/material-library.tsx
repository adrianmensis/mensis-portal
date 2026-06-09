import { SUPPORT_MATERIAL } from "@/lib/support-material";
import { VideoCard } from "./video-card";
import { MaterialCard } from "./material-card";

export function MaterialLibrary() {
  return (
    <div className="flex flex-col gap-10">
      {SUPPORT_MATERIAL.map((section) => (
        <section key={section.id} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{section.title}</h2>
            <p className="mt-0.5 text-sm text-zinc-500">{section.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, i) =>
              item.type === "video" ? (
                <VideoCard key={i} item={item} />
              ) : (
                <MaterialCard key={i} item={item} />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
