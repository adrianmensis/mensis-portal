import { LoginForm } from "./login-form";

export function Hero() {
  return (
    <section className="relative h-screen overflow-hidden bg-[#050617] text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_900px_700px_at_22%_28%,rgba(99,102,241,0.38),transparent_62%),radial-gradient(ellipse_1000px_800px_at_78%_78%,rgba(236,72,153,0.22),transparent_60%),radial-gradient(ellipse_1200px_900px_at_50%_50%,rgba(39,59,124,0.28),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,6,23,0.4)_70%,#030312_100%)]"
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-12 px-6 text-center">
        <div className="flex flex-col items-center gap-5">
          <h1 className="max-w-5xl bg-gradient-to-br from-white via-white to-indigo-200 bg-clip-text font-serif text-5xl leading-[1.05] tracking-tight text-transparent sm:text-7xl">
            You know, access and learn
            <br className="hidden sm:block" />
            <span className="sm:inline"> </span>things no one else does.
          </h1>
          <p className="font-serif text-xl text-indigo-100/70 sm:text-2xl">
            Knowledge never dies.
          </p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
