import { LoginForm } from "./login-form";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-10 bg-[#fafbfd] px-6 text-center">
      <div className="relative flex flex-col items-center gap-4">
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
          You know, access and learn
          <br className="hidden sm:block" />
          <span className="sm:inline"> </span>things no one else does.
        </h1>
        <p className="text-lg text-zinc-400 sm:text-xl">
          Knowledge never dies.
        </p>
      </div>

      <LoginForm />
    </section>
  );
}
