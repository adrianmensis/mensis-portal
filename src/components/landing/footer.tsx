import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-brand-light/40 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:px-10">
        <span>© 2026 Mensis · San José, Costa Rica</span>
        <Link
          href="/login"
          className="font-medium text-brand transition-colors hover:text-brand/70"
        >
          Enter the portal →
        </Link>
      </div>
    </footer>
  );
}
