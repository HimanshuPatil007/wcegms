"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useWorkforce, type DashboardAccessRole } from "@/hooks/use-workforce";

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: {
  children: React.ReactNode;
  allowedRoles: DashboardAccessRole[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const { accessRole } = useWorkforce();
  const isAllowed = allowedRoles.includes(accessRole);

  useEffect(() => {
    if (!isAllowed) {
      router.replace(redirectTo);
    }
  }, [isAllowed, redirectTo, router]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
