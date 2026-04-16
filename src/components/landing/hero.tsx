import { LoginForm } from "./login-form";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-10 bg-[#fafbfd] px-6 text-center">
      <div className="relative flex flex-col items-center gap-4">
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.08] tracking-tight text-zinc-900 sm:text-7xl">
          You know, access and learn
          <br className="hidden sm:block" />
          <span className="sm:inline"> </span>things no one else does.
        </h1>
        <p className="font-serif text-xl text-zinc-500 sm:text-2xl">
          Knowledge never dies.
        </p>
      </div>

      <LoginForm />
    </section>
  );
}
