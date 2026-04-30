"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo: string;
};

export function AuthGuard({
  children,
  requireAuth = false,
  redirectTo,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading, isConfigured } = useAuth();

  useEffect(() => {
    if (isLoading || !isConfigured) {
      return;
    }

    if (requireAuth && !user) {
      router.replace(redirectTo);
    }

    if (!requireAuth && user) {
      router.replace(redirectTo);
    }
  }, [isConfigured, isLoading, redirectTo, requireAuth, router, user]);

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8f1ec_0%,#f7fbfa_42%,#f2f5f4_100%)] px-6">
        <div className="w-full max-w-xl rounded-[28px] border border-amber-200 bg-white/90 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
            Firebase Setup Required
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Add your Firebase environment variables to enable authentication.
          </h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8f1ec_0%,#f7fbfa_42%,#f2f5f4_100%)]">
        <div className="rounded-full border border-emerald-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
          Checking your session...
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
