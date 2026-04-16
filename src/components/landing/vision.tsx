type Pillar = {
  title: string;
  body: string;
};

const pillars: Pillar[] = [
  {
    title: "Avatares de expertos",
    body: "Cada experto entrena su avatar una sola vez. Desde ahí responde con su contexto, tono y criterio — 24/7.",
  },
  {
    title: "IA donde trabaja tu equipo",
    body: "Integraciones con Slack, WhatsApp y Teams para que el conocimiento viva en los canales que ya usan.",
  },
  {
    title: "Escala sin perder la voz",
    body: "Más de 10,000 usuarios activos en Costa Rica, Panamá, Colombia, Miami y Perú.",
  },
];

export function Vision() {
  return (
    <section id="vision" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-brand sm:text-4xl">
            Una empresa. Su conocimiento vivo.
          </h2>
          <p className="text-base leading-relaxed text-zinc-600">
            Mensis convierte el expertise humano en IA útil — sin scripts, sin
            chatbots, sin perder criterio.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="flex flex-col gap-3 rounded-xl border border-brand-light/50 bg-white p-6 transition-colors hover:border-brand-light"
            >
              <div className="h-10 w-10 rounded-full bg-brand" />
              <h3 className="text-lg font-semibold text-brand">{p.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
