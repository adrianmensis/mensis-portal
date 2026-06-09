import Image from "next/image";
import { LoginForm } from "./login-form";

const PARTNER_BENEFITS = [
  "Manage your referrals and accounts in one place",
  "Track Digital Twins deployed across your clients",
  "Real-time commissions and performance",
  "Resources and onboarding to grow with Mensis",
];

export function Hero() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-[#eef1f7] p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_-24px_rgba(39,59,124,0.25)] md:grid-cols-2">
        {/* Left — login */}
        <div className="flex flex-col justify-center gap-8 px-8 py-12 sm:px-12">
          <Image
            src="/isotipo.png"
            alt="Mensis"
            width={48}
            height={48}
            className="rounded-xl"
          />

          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Log In
            </h1>
            <p className="text-sm text-zinc-400">
              to continue to the Mensis Partner Portal
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Right — brand panel */}
        <div className="relative hidden flex-col justify-center gap-8 overflow-hidden bg-brand px-10 py-12 md:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_-10%,rgba(173,188,238,0.25),transparent)]" />

          <div className="relative flex flex-col gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Welcome, Partner.
            </h2>
            <p className="text-sm leading-relaxed text-brand-light">
              Your gateway to the Mensis Digital Twin Platform — built to help
              you grow alongside us.
            </p>
          </div>

          <ul className="relative flex flex-col gap-4">
            {PARTNER_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-sm leading-snug text-white/90">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
