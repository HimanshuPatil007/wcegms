import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CampusMonitoringProvider } from "@/hooks/use-campus-monitoring";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth redirectTo="/login">
      <CampusMonitoringProvider>
        <DashboardShell>{children}</DashboardShell>
      </CampusMonitoringProvider>
    </AuthGuard>
  );
}
