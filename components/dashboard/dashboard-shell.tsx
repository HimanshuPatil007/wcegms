import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0b1524_0%,#08111c_56%,#050a12_100%)] px-3 py-3 text-slate-100 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(245,158,11,0.10),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.10),transparent_28%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-[-4%] h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1520px] gap-5 lg:grid-cols-[290px_minmax(0,1fr)] xl:gap-6">
        <DashboardSidebar />

        <div className="flex min-h-0 flex-col gap-5 xl:gap-6">
          <DashboardHeader />
          <main className="animate-rise-in flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
