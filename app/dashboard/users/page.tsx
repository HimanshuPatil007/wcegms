import { RoleGuard } from "@/components/auth/role-guard";
import { UserAccessPage } from "@/components/dashboard/user-access-page";

export default function DashboardUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <UserAccessPage />
    </RoleGuard>
  );
}
