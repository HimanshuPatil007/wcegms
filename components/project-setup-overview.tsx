import Link from "next/link";

const setupItems = [
  {
    title: "App Router Ready",
    description:
      "This project already uses the Next.js App Router, so we can build the dashboard with route groups, layouts, and protected sections.",
  },
  {
    title: "Core Packages Installed",
    description:
      "Firebase, Leaflet, and React Leaflet are installed and ready for the upcoming data, auth, and map steps.",
  },
  {
    title: "Production-Friendly Structure",
    description:
      "Shared code is organized into components, hooks, and lib folders so each feature stays modular as the dashboard grows.",
  },
];

const nextSteps = [
  "Step 2 now includes Firebase initialization and reusable Realtime Database helpers.",
  "Step 3 now adds Firebase Authentication with protected dashboard access.",
  "Step 4 onward will build the live dashboard, bin cards, maps, and alerts.",
];

export function ProjectSetupOverview() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f1ec_0%,#f7fbfa_42%,#f2f5f4_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr] lg:px-12 lg:py-12">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold tracking-wide text-emerald-700">
                IoT Garbage Management System
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Firebase auth and data access are in place, and the dashboard foundation is ready for live monitoring screens.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  The project now includes Firebase Authentication, route guards,
                  and a reusable Realtime Database layer so the next UI steps can
                  focus directly on live bin data and operations workflows.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  href="/login"
                >
                  Open Login
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  href="/signup"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Installed Packages
              </p>
              <div className="mt-5 grid gap-3">
                {["firebase", "leaflet", "react-leaflet", "tailwindcss"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {setupItems.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur"
            >
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Project Structure
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-200">
              <code>{`app/
components/
hooks/
lib/
public/
.env.example`}</code>
            </pre>
          </article>

          <article className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              What Comes Next
            </p>
            <div className="mt-4 space-y-4">
              {nextSteps.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-emerald-200 bg-white/70 px-4 py-3 text-sm leading-7 text-emerald-950"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Firebase Layer
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <p>`lib/firebase/config.ts` creates a single shared Firebase app, auth, and database instance.</p>
              <p>`lib/firebase/database.ts` exposes `fetchAllBins()`, `fetchBinById(id)`, and `subscribeToBinsRealtime()`.</p>
              <p>`lib/firebase/types.ts` keeps bin data typed and normalized before the UI consumes it.</p>
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Expected Realtime Path
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-200">
              <code>{`bins: {
  BIN_001: {
    binId: "BIN_001",
    locationName: "Main Gate",
    fillLevel: 72,
    gasLevel: 18,
    weight: 12450,
    location: {
      latitude: 22.5726,
      longitude: 88.3639
    }
  }
}`}</code>
            </pre>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Auth Routes
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <p>`/login` handles email/password sign-in.</p>
              <p>`/signup` creates operator accounts with Firebase Auth.</p>
              <p>`/dashboard` is now protected and redirects guests to `/login`.</p>
            </div>
          </article>

          <article className="rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Auth State
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-emerald-950">
              <p>The root layout now wraps the app in a shared auth provider.</p>
              <p>`onAuthStateChanged()` keeps the current session synced on the client.</p>
              <p>`login()`, `signup()`, and `logout()` are reusable through `useAuth()`.</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
