import { LoginForm } from "./login-form";

export function Hero() {
  return (
    <section className="relative flex h-screen flex-col items-center justify-center gap-12 overflow-hidden bg-gradient-to-b from-[#EEF1FC] via-white to-[#E4E9F8] px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_900px_500px_at_50%_0%,rgba(173,188,238,0.55),transparent_70%),radial-gradient(ellipse_700px_500px_at_50%_100%,rgba(173,188,238,0.45),transparent_70%)]"
      />

      <div className="relative flex flex-col items-center gap-5">
        <h1 className="max-w-5xl font-serif text-5xl leading-[1.05] tracking-tight text-brand sm:text-7xl">
          You know, access and learn
          <br className="hidden sm:block" />
          <span className="sm:inline"> </span>things no one else does.
        </h1>
        <p className="font-serif text-xl text-brand/60 sm:text-2xl">
          Knowledge never dies.
        </p>
      </div>

      <div className="relative">
        <LoginForm />
      </div>
    </section>
  );
}
