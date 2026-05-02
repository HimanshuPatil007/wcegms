import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CampusMonitoringProvider } from "@/hooks/use-campus-monitoring";
import { WorkforceProvider } from "@/hooks/use-workforce";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth redirectTo="/login">
      <WorkforceProvider>
        <CampusMonitoringProvider>
          <DashboardShell>{children}</DashboardShell>
        </CampusMonitoringProvider>
      </WorkforceProvider>
    </AuthGuard>
  );
}
