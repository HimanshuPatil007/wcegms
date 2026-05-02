import { RoleGuard } from "@/components/auth/role-guard";
import { BinsPage } from "@/components/dashboard/bins-page";

export default function DashboardBinsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "employee", "user"]}>
      <BinsPage />
    </RoleGuard>
  );
}
