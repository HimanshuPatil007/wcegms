import { RoleGuard } from "@/components/auth/role-guard";
import { AnalyticsPage } from "@/components/dashboard/analytics-page";

export default function DashboardAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AnalyticsPage />
    </RoleGuard>
  );
}
