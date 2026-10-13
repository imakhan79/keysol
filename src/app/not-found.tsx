import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-ink px-4 py-24 text-center text-white">
      <div>
        <p className="text-sm font-semibold tracking-[0.18em] text-accent uppercase">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-slate-300">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/contact" className="btn-ghost-light">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
