import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col bg-brand text-white">
      <div className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/isotipo.png"
            alt="Mensis"
            width={28}
            height={28}
            priority
          />
          <span className="text-sm font-medium tracking-wide text-white/90">
            mensis.ai
          </span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          Enter →
        </Link>
      </div>

      <div className="flex flex-1 items-center">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-20 text-center sm:px-10">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            You know things
            <br />
            no one else does.
          </h1>
          <p className="font-serif text-2xl text-brand-light sm:text-3xl">
            Knowledge never dies.
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 text-center sm:px-10">
        <span className="text-xs uppercase tracking-[0.25em] text-white/50">
          Scroll
        </span>
      </div>
    </section>
  );
}
