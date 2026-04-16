import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex h-screen flex-col items-center justify-between overflow-hidden bg-[radial-gradient(ellipse_at_center,_#273b7c_0%,_#121a3d_60%,_#0a1230_100%)] px-6 py-12 text-center text-white">
      <Image
        src="/isotipo.png"
        alt="Mensis"
        width={48}
        height={48}
        priority
        className="h-12 w-12"
      />

      <div className="flex flex-col items-center gap-5">
        <h1 className="max-w-5xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
          You know, access and learn
          <br className="hidden sm:block" />
          <span className="sm:inline"> </span>things no one else does.
        </h1>
        <p className="font-serif text-xl text-brand-light/80 sm:text-2xl">
          Knowledge never dies.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex h-11 items-center justify-center rounded-full border border-white/30 bg-white/5 px-7 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:border-white/60 hover:text-white"
      >
        Login
      </Link>
    </section>
  );
}
