import Link from "next/link";

const navigationItems = [
  {
    label: "Overview",
    href: "/dashboard",
    description: "Live operations summary",
    active: true,
  },
  {
    label: "Bins",
    href: "/dashboard",
    description: "All connected smart bins",
    active: false,
  },
  {
    label: "Map",
    href: "/dashboard",
    description: "Geo view of deployed units",
    active: false,
  },
  {
    label: "Alerts",
    href: "/dashboard",
    description: "Critical conditions and actions",
    active: false,
  },
];

export function DashboardSidebar() {
  return (
    <aside className="animate-rise-in flex h-full flex-col rounded-[32px] border border-white/10 bg-slate-950 px-4 py-5 text-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:px-5 sm:py-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
          WCEGMS
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Smart Waste Ops
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          A single control surface for real-time bin monitoring, route planning,
          and operational alerts.
        </p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-3">
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            className={`surface-hover rounded-[24px] border px-4 py-4 transition ${
              item.active
                ? "border-emerald-400/40 bg-emerald-400/12 text-white"
                : "border-white/8 bg-white/3 text-slate-300 hover:border-white/16 hover:bg-white/6 hover:text-white"
            }`}
            href={item.href}
          >
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-xs leading-5 text-slate-400">
              {item.description}
            </div>
          </Link>
        ))}
      </nav>

      <div className="rounded-[24px] border border-amber-300/25 bg-amber-300/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          Experience
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-50">
          This workspace now includes realtime data, map navigation, detail
          routes, and threshold-driven alerts in a responsive layout.
        </p>
      </div>
    </aside>
  );
}
