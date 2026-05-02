import { RoleGuard } from "@/components/auth/role-guard";
import { TasksPage } from "@/components/dashboard/tasks-page";

export default function DashboardTasksPage() {
  return (
    <RoleGuard allowedRoles={["admin", "employee"]}>
      <TasksPage />
    </RoleGuard>
  );
}
