import { RoleGuard } from "@/components/auth/role-guard";
import { IssueReportsPage } from "@/components/dashboard/issue-reports-page";

export default function DashboardIssueReportsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "employee", "user"]}>
      <IssueReportsPage />
    </RoleGuard>
  );
}
