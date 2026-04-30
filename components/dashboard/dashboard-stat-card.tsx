type DashboardStatCardProps = {
  label: string;
  value: string;
  description: string;
  tone: "emerald" | "amber" | "sky" | "rose";
};

const toneStyles: Record<DashboardStatCardProps["tone"], string> = {
  emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
  amber: "border-amber-200 bg-amber-50/80 text-amber-950",
  sky: "border-sky-200 bg-sky-50/80 text-sky-950",
  rose: "border-rose-200 bg-rose-50/80 text-rose-950",
};

export function DashboardStatCard({
  label,
  value,
  description,
  tone,
}: DashboardStatCardProps) {
  return (
    <article
      className={`surface-hover rounded-[28px] border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-6 ${toneStyles[tone]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-75">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{value}</p>
      <p className="mt-3 text-sm leading-7 opacity-80">{description}</p>
    </article>
  );
}
