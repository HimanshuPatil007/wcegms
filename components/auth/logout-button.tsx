"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useAuth } from "@/hooks/use-auth";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="rounded-full border border-white/12 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logout();
          router.replace("/login");
        });
      }}
      type="button"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
