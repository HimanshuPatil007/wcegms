export type AccessRole = "admin" | "user" | "employee";

export type AppUserAccount = {
  uid: string;
  email: string;
  displayName: string;
  accessRole: AccessRole;
  createdAt: number;
  lastLoginAt: number;
};

const BUILT_IN_ADMIN_EMAILS = ["himanshu.patil@walchandsangli.ac.in"];

export function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function getAdminEmails() {
  const envEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...BUILT_IN_ADMIN_EMAILS, ...envEmails]));
}

export function isBuiltInAdminEmail(email: string | null | undefined) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  return getAdminEmails().includes(normalizedEmail);
}
