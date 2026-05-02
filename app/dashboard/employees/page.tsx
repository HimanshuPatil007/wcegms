import { RoleGuard } from "@/components/auth/role-guard";
import { EmployeesPage } from "@/components/dashboard/employees-page";

export default function DashboardEmployeesPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <EmployeesPage />
    </RoleGuard>
  );
}
