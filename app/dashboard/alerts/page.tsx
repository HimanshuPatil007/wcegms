import { RoleGuard } from "@/components/auth/role-guard";
import { AlertsPage } from "@/components/dashboard/alerts-page";

export default function DashboardAlertsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "employee", "user"]}>
      <AlertsPage />
    </RoleGuard>
  );
}
