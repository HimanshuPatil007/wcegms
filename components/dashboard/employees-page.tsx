"use client";

import { useMemo, useState } from "react";

import { useWorkforce } from "@/hooks/use-workforce";
import {
  type EmployeeProfile,
  type EmployeeRole,
  type EmployeeStatus,
} from "@/lib/employee-profiles";

type ViewMode = "cards" | "table";

const ROLE_OPTIONS: EmployeeRole[] = ["Driver", "Collector", "Admin"];
const STATUS_OPTIONS: EmployeeStatus[] = ["Active", "On Leave"];

function buildEmployeeDraft(): EmployeeProfile {
  return {
    authEmail: "",
    employeeId: "",
    name: "",
    role: "Collector",
    phoneNumber: "",
    assignedZone: "",
    status: "Active",
  };
}

function normalizeEmployeeDraft(employee: EmployeeProfile): EmployeeProfile {
  return {
    ...employee,
    authEmail: employee.authEmail.trim().toLowerCase(),
    employeeId: employee.employeeId.trim(),
    name: employee.name.trim(),
    phoneNumber: employee.phoneNumber.trim(),
    assignedZone: employee.assignedZone.trim(),
  };
}

function isEmployeeDraftValid(employee: EmployeeProfile) {
  const normalizedEmployee = normalizeEmployeeDraft(employee);

  return Boolean(
    normalizedEmployee.authEmail &&
      normalizedEmployee.employeeId &&
      normalizedEmployee.name &&
      normalizedEmployee.phoneNumber &&
      normalizedEmployee.assignedZone,
  );
}

function getRoleClasses(role: EmployeeRole) {
  if (role === "Driver") {
    return "border-teal-300/18 bg-teal-400/10 text-teal-50";
  }

  if (role === "Collector") {
    return "border-amber-300/18 bg-amber-400/10 text-amber-50";
  }

  return "border-sky-300/18 bg-sky-400/10 text-sky-50";
}

function getStatusClasses(status: EmployeeStatus) {
  if (status === "Active") {
    return "border-emerald-300/18 bg-emerald-400/10 text-emerald-50";
  }

  return "border-rose-300/18 bg-rose-400/10 text-rose-50";
}

function EmployeeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </span>
      <input
        className="w-full rounded-[14px] border border-white/10 bg-[#1a273a] px-3 py-2.5 text-sm text-white outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function EmployeeSelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </span>
      <select
        className="w-full rounded-[14px] border border-white/10 bg-[#1a273a] px-3 py-2.5 text-sm text-white outline-none"
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmployeeSummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-[22px] border border-white/8 bg-white/[0.04] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </article>
  );
}

function EmployeeCard({
  employee,
  isEditing,
  draftEmployee,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDraftChange,
}: {
  employee: EmployeeProfile;
  isEditing: boolean;
  draftEmployee: EmployeeProfile | null;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDraftChange: <K extends keyof EmployeeProfile>(
    field: K,
    value: EmployeeProfile[K],
  ) => void;
}) {
  const currentEmployee = draftEmployee ?? employee;

  return (
    <article className="surface-hover rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#172337_0%,#101827_100%)] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {currentEmployee.employeeId}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {currentEmployee.name}
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
              currentEmployee.status,
            )}`}
          >
            {currentEmployee.status}
          </span>
          {isEditing ? (
            <>
              <button
                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                onClick={onCancelEdit}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                onClick={onSaveEdit}
                type="button"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-500/18"
                onClick={onDelete}
                type="button"
              >
                Delete
              </button>
              <button
                className="rounded-full bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                onClick={onStartEdit}
                type="button"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getRoleClasses(
            currentEmployee.role,
          )}`}
        >
          {currentEmployee.role}
        </span>
        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
          {currentEmployee.assignedZone}
        </span>
      </div>

      {isEditing ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <EmployeeField
            label="Employee ID"
            onChange={(value) => onDraftChange("employeeId", value)}
            value={currentEmployee.employeeId}
          />
          <EmployeeField
            label="Name"
            onChange={(value) => onDraftChange("name", value)}
            value={currentEmployee.name}
          />
          <EmployeeSelectField
            label="Role"
            onChange={(value) => onDraftChange("role", value)}
            options={ROLE_OPTIONS}
            value={currentEmployee.role}
          />
          <EmployeeField
            label="Phone Number"
            onChange={(value) => onDraftChange("phoneNumber", value)}
            value={currentEmployee.phoneNumber}
          />
          <EmployeeField
            label="Assigned Zone"
            onChange={(value) => onDraftChange("assignedZone", value)}
            value={currentEmployee.assignedZone}
          />
          <EmployeeSelectField
            label="Status"
            onChange={(value) => onDraftChange("status", value)}
            options={STATUS_OPTIONS}
            value={currentEmployee.status}
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Phone Number
            </p>
            <p className="mt-2 text-sm font-medium text-white">{currentEmployee.phoneNumber}</p>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Assigned Zone
            </p>
            <p className="mt-2 text-sm font-medium text-white">{currentEmployee.assignedZone}</p>
          </div>
        </div>
      )}
    </article>
  );
}

export function EmployeesPage() {
  const { createEmployee, deleteEmployee, employees, updateEmployee } = useWorkforce();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [newEmployeeDraft, setNewEmployeeDraft] = useState<EmployeeProfile>(buildEmployeeDraft);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [draftEmployee, setDraftEmployee] = useState<EmployeeProfile | null>(null);

  const activeCount = useMemo(
    () => employees.filter((employee) => employee.status === "Active").length,
    [employees],
  );
  const onLeaveCount = useMemo(
    () => employees.filter((employee) => employee.status === "On Leave").length,
    [employees],
  );
  const driverCount = useMemo(
    () => employees.filter((employee) => employee.role === "Driver").length,
    [employees],
  );
  const collectorCount = useMemo(
    () => employees.filter((employee) => employee.role === "Collector").length,
    [employees],
  );
  const adminCount = useMemo(
    () => employees.filter((employee) => employee.role === "Admin").length,
    [employees],
  );

  function startEditing(employee: EmployeeProfile) {
    setEditingEmployeeId(employee.authEmail);
    setDraftEmployee(employee);
  }

  function cancelEditing() {
    setEditingEmployeeId(null);
    setDraftEmployee(null);
  }

  function saveEditing() {
    if (!editingEmployeeId || !draftEmployee) {
      return;
    }

    updateEmployee(editingEmployeeId, draftEmployee);
    setEditingEmployeeId(null);
    setDraftEmployee(null);
  }

  function handleDeleteEmployee(authEmail: string) {
    if (editingEmployeeId === authEmail) {
      cancelEditing();
    }

    deleteEmployee(authEmail);
  }

  function updateNewEmployeeDraft<K extends keyof EmployeeProfile>(
    field: K,
    value: EmployeeProfile[K],
  ) {
    setNewEmployeeDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function handleCreateEmployee() {
    if (!isEmployeeDraftValid(newEmployeeDraft)) {
      return;
    }

    createEmployee(normalizeEmployeeDraft(newEmployeeDraft));
    setNewEmployeeDraft(buildEmployeeDraft());
  }

  function updateDraftEmployee<K extends keyof EmployeeProfile>(
    field: K,
    value: EmployeeProfile[K],
  ) {
    setDraftEmployee((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [field]: value,
          }
        : currentDraft,
    );
  }

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
            Employees
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Employee Profile
          </h1>
        </div>

        <div className="inline-flex rounded-[18px] border border-white/8 bg-white/[0.04] p-1.5">
          {[
            { label: "Cards", value: "cards" },
            { label: "Table", value: "table" },
          ].map((option) => {
            const active = viewMode === option.value;

            return (
              <button
                key={option.value}
                className={`rounded-[14px] px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] text-white shadow-[0_12px_30px_rgba(15,118,110,0.24)]"
                    : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                }`}
                onClick={() => setViewMode(option.value as ViewMode)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <EmployeeSummaryCard label="Total Employees" value={employees.length} />
        <EmployeeSummaryCard label="Active" value={activeCount} />
        <EmployeeSummaryCard label="On Leave" value={onLeaveCount} />
        <EmployeeSummaryCard label="Drivers" value={driverCount} />
        <EmployeeSummaryCard label="Collectors / Admins" value={collectorCount + adminCount} />
      </div>

      <section className="mt-7 rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#172337_0%,#101827_100%)] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.24)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Admin Controls
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Add Employee
            </h2>
          </div>
          <button
            className="rounded-full bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isEmployeeDraftValid(newEmployeeDraft)}
            onClick={handleCreateEmployee}
            type="button"
          >
            Add Employee
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <EmployeeField
            label="Email"
            onChange={(value) => updateNewEmployeeDraft("authEmail", value)}
            value={newEmployeeDraft.authEmail}
          />
          <EmployeeField
            label="Employee ID"
            onChange={(value) => updateNewEmployeeDraft("employeeId", value)}
            value={newEmployeeDraft.employeeId}
          />
          <EmployeeField
            label="Name"
            onChange={(value) => updateNewEmployeeDraft("name", value)}
            value={newEmployeeDraft.name}
          />
          <EmployeeSelectField
            label="Role"
            onChange={(value) => updateNewEmployeeDraft("role", value)}
            options={ROLE_OPTIONS}
            value={newEmployeeDraft.role}
          />
          <EmployeeField
            label="Phone Number"
            onChange={(value) => updateNewEmployeeDraft("phoneNumber", value)}
            value={newEmployeeDraft.phoneNumber}
          />
          <EmployeeField
            label="Assigned Zone"
            onChange={(value) => updateNewEmployeeDraft("assignedZone", value)}
            value={newEmployeeDraft.assignedZone}
          />
          <EmployeeSelectField
            label="Status"
            onChange={(value) => updateNewEmployeeDraft("status", value)}
            options={STATUS_OPTIONS}
            value={newEmployeeDraft.status}
          />
        </div>
      </section>

      {viewMode === "cards" ? (
        <div className="mt-7 grid gap-5 xl:grid-cols-2">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.authEmail}
              draftEmployee={
                editingEmployeeId === employee.authEmail ? draftEmployee : null
              }
              employee={employee}
              isEditing={editingEmployeeId === employee.authEmail}
              onCancelEdit={cancelEditing}
              onDelete={() => handleDeleteEmployee(employee.authEmail)}
              onDraftChange={updateDraftEmployee}
              onSaveEdit={saveEditing}
              onStartEdit={() => startEditing(employee)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-7 overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#162235_0%,#101827_100%)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.03]">
                  {[
                    "Employee ID",
                    "Name",
                    "Role",
                    "Phone Number",
                    "Assigned Zone",
                    "Status",
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
                {employees.map((employee) => {
                  const isEditing = editingEmployeeId === employee.authEmail;
                  const currentEmployee = isEditing && draftEmployee ? draftEmployee : employee;

                  return (
                    <tr
                      key={employee.authEmail}
                      className="border-b border-white/6 text-sm text-slate-200 last:border-b-0"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        {isEditing ? (
                          <input
                            className="w-full min-w-28 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                            onChange={(event) =>
                              updateDraftEmployee("employeeId", event.target.value)
                            }
                            value={currentEmployee.employeeId}
                          />
                        ) : (
                          currentEmployee.employeeId
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            className="w-full min-w-36 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                            onChange={(event) => updateDraftEmployee("name", event.target.value)}
                            value={currentEmployee.name}
                          />
                        ) : (
                          currentEmployee.name
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select
                            className="w-full min-w-28 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                            onChange={(event) =>
                              updateDraftEmployee("role", event.target.value as EmployeeRole)
                            }
                            value={currentEmployee.role}
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getRoleClasses(
                              currentEmployee.role,
                            )}`}
                          >
                            {currentEmployee.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            className="w-full min-w-36 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                            onChange={(event) =>
                              updateDraftEmployee("phoneNumber", event.target.value)
                            }
                            value={currentEmployee.phoneNumber}
                          />
                        ) : (
                          currentEmployee.phoneNumber
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            className="w-full min-w-40 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                            onChange={(event) =>
                              updateDraftEmployee("assignedZone", event.target.value)
                            }
                            value={currentEmployee.assignedZone}
                          />
                        ) : (
                          currentEmployee.assignedZone
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select
                            className="w-full min-w-28 rounded-[12px] border border-white/10 bg-[#1a273a] px-3 py-2 text-sm text-white outline-none"
                            onChange={(event) =>
                              updateDraftEmployee(
                                "status",
                                event.target.value as EmployeeStatus,
                              )
                            }
                            value={currentEmployee.status}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                              currentEmployee.status,
                            )}`}
                          >
                            {currentEmployee.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                                onClick={cancelEditing}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="rounded-full bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                                onClick={saveEditing}
                                type="button"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-500/18"
                                onClick={() => handleDeleteEmployee(employee.authEmail)}
                                type="button"
                              >
                                Delete
                              </button>
                              <button
                                className="rounded-full bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                                onClick={() => startEditing(employee)}
                                type="button"
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
