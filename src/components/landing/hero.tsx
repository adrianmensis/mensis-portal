import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/40 to-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center sm:py-32">
        <span className="rounded-full border border-brand-light bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand">
          Mensis Mentor
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-brand sm:text-6xl">
          Entrena una vez.{" "}
          <span className="text-brand-dark">Tu IA responde para siempre.</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl">
          Construimos avatares de conocimiento que escalan la experiencia de tus
          equipos sin diluir su voz.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            Entrar al portal
          </Link>
          <a
            href="#vision"
            className="inline-flex h-11 items-center justify-center rounded-md border border-brand-light bg-white px-6 text-sm font-medium text-brand transition-colors hover:bg-brand-light/30"
          >
            Conocer Mensis
          </a>
        </div>
      </div>
    </section>
  );
}
