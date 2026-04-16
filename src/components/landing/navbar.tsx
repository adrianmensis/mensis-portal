import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-brand-light/50 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/isotipo.png"
            alt="Mensis"
            width={32}
            height={32}
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-brand">
            mensis
          </span>
        </Link>
        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          Entrar
        </Link>
      </div>
    </nav>
  );
}
