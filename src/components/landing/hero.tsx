import Image from "next/image";
import { LoginForm } from "./login-form";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fafbfd] px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(173,188,238,0.15),transparent)]" />

      <div className="relative flex flex-col items-center gap-12">
        <Image
          src="/isotipo.png"
          alt="Mensis"
          width={64}
          height={64}
          className="rounded-xl"
        />

        <div className="flex flex-col items-center gap-3">
          <h1 className="max-w-2xl text-center text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.15] tracking-tight text-zinc-800">
            You know, access and learn
            <br className="hidden sm:block" />
            things no one else does.
          </h1>
          <p className="text-base font-light tracking-wide text-zinc-400">
            Knowledge never dies.
          </p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
