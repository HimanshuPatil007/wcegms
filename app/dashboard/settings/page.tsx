import { RoleGuard } from "@/components/auth/role-guard";
import { SettingsPage } from "@/components/dashboard/settings-page";

export default function DashboardSettingsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <SettingsPage />
    </RoleGuard>
  );
}
