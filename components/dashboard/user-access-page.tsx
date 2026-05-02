"use client";

import { useMemo, useState } from "react";

import { useWorkforce } from "@/hooks/use-workforce";
import { type AccessRole } from "@/lib/app-user-access";

const ACCESS_ROLE_OPTIONS: AccessRole[] = ["admin", "user", "employee"];

function getAccessRoleClasses(accessRole: AccessRole) {
  if (accessRole === "admin") {
    return "border-amber-300/18 bg-amber-400/10 text-amber-50";
  }

  if (accessRole === "employee") {
    return "border-teal-300/18 bg-teal-400/10 text-teal-50";
  }

  return "border-sky-300/18 bg-sky-400/10 text-sky-50";
}

export function UserAccessPage() {
  const { appUsers, employees, updateUserAccessRole } = useWorkforce();
  const [draftRoles, setDraftRoles] = useState<Record<string, AccessRole>>({});

  const sortedUsers = useMemo(
    () => [...appUsers].sort((firstUser, secondUser) => secondUser.createdAt - firstUser.createdAt),
    [appUsers],
  );

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div>
        <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
          User Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Signed-Up Users
        </h1>
      </div>

      <div className="mt-7 overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#162235_0%,#101827_100%)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03]">
                {[
                  "Name",
                  "Email",
                  "Current Access",
                  "Linked Employee",
                  "Change Access",
                  "Actions",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((appUser) => {
                const linkedEmployee =
                  employees.find(
                    (employee) =>
                      employee.authEmail.trim().toLowerCase() ===
                      appUser.email.trim().toLowerCase(),
                  ) ?? null;
                const selectedRole = draftRoles[appUser.uid] ?? appUser.accessRole;

                return (
                  <tr
                    key={appUser.uid}
                    className="border-b border-white/6 text-sm text-slate-200 last:border-b-0"
                  >
                    <td className="px-5 py-4 font-semibold text-white">{appUser.displayName}</td>
                    <td className="px-5 py-4">{appUser.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getAccessRoleClasses(
                          appUser.accessRole,
                        )}`}
                      >
                        {appUser.accessRole}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {linkedEmployee ? (
                        <div>
                          <p className="font-medium text-white">{linkedEmployee.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {linkedEmployee.role} | {linkedEmployee.assignedZone}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">No employee profile linked</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        className="w-full min-w-32 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                        onChange={(event) =>
                          setDraftRoles((currentDrafts) => ({
                            ...currentDrafts,
                            [appUser.uid]: event.target.value as AccessRole,
                          }))
                        }
                        value={selectedRole}
                      >
                        {ACCESS_ROLE_OPTIONS.map((accessRole) => (
                          <option key={accessRole} value={accessRole}>
                            {accessRole}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="rounded-full bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                        onClick={() => updateUserAccessRole(appUser.uid, selectedRole)}
                        type="button"
                      >
                        Save Access
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
