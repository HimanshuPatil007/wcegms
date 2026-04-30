import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10203f_0%,#091121_35%,#050913_100%)] px-3 py-3 text-slate-100 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[1520px] gap-5 lg:grid-cols-[290px_minmax(0,1fr)] xl:gap-6">
        <DashboardSidebar />

        <div className="flex min-h-0 flex-col gap-5 xl:gap-6">
          <DashboardHeader />
          <main className="animate-rise-in flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
