type Pillar = {
  eyebrow: string;
  title: string;
  body: string;
};

const pillars: Pillar[] = [
  {
    eyebrow: "People",
    title: "Every expert, an avatar.",
    body: "Your voice. Your judgment. Your presence — captured as a living avatar that answers in your name, 24/7.",
  },
  {
    eyebrow: "Data",
    title: "Refined, curated, alive.",
    body: "We turn scattered documents, conversations and decisions into clean, queryable knowledge — no more lost context.",
  },
  {
    eyebrow: "Presence",
    title: "From one desk to every channel.",
    body: "Your expertise shows up in Slack, WhatsApp, Teams and the web — without losing its soul.",
  },
];

export function Pillars() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <div className="mb-16 flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.25em] text-brand/60">
            The product
          </span>
          <h2 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight text-brand sm:text-5xl">
            From real people.
            <br />
            To infinite presence.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-brand-light/50 bg-brand-light/40 sm:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.eyebrow}
              className="flex flex-col gap-3 bg-white p-8"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-brand/60">
                {p.eyebrow}
              </span>
              <h3 className="font-serif text-2xl leading-snug text-brand">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
