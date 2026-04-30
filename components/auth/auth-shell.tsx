import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerLabel: string;
  footerHref: string;
  footerAction: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footerLabel,
  footerHref,
  footerAction,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f1ec_0%,#f7fbfa_42%,#f2f5f4_100%)] px-6 py-14 text-slate-900">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.95fr]">
        <section className="rounded-[32px] border border-white/70 bg-slate-950 px-8 py-10 text-white shadow-[0_20px_80px_rgba(15,23,42,0.16)] lg:px-12 lg:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
            {description}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Secure email and password authentication",
              "Realtime dashboard access after login",
              "App Router friendly client-side protection",
              "Reusable auth state across the whole app",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:p-10">
          {children}
          <p className="mt-6 text-sm text-slate-600">
            {footerLabel}{" "}
            <Link className="font-semibold text-emerald-700" href={footerHref}>
              {footerAction}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
