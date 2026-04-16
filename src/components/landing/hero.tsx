import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex h-screen flex-col overflow-hidden bg-[radial-gradient(ellipse_at_center,_#273b7c_0%,_#121a3d_60%,_#0a1230_100%)] text-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 text-center">
        <h1 className="max-w-5xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
          You know, access and learn
          <br className="hidden sm:block" />
          <span className="sm:inline"> </span>things no one else does.
        </h1>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/30 bg-white/5 px-7 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:border-white/60 hover:text-white"
        >
          Enter
        </Link>
      </div>

      <p className="pb-12 text-center font-serif text-xl text-brand-light/70 sm:text-2xl">
        Knowledge never dies.
      </p>
    </section>
  );
}
