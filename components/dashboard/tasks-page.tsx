"use client";

import { useMemo, useState, type FormEvent } from "react";

import { useWorkforce } from "@/hooks/use-workforce";
import type {
  WorkforceTask,
  WorkforceTaskInput,
  WorkforceTaskStatus,
} from "@/lib/workforce-data";

const TASK_STATUS_OPTIONS: WorkforceTaskStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
];

function getStatusClasses(status: WorkforceTaskStatus) {
  if (status === "Completed") {
    return "border-emerald-300/18 bg-emerald-400/10 text-emerald-50";
  }

  if (status === "In Progress") {
    return "border-amber-300/18 bg-amber-400/10 text-amber-50";
  }

  return "border-sky-300/18 bg-sky-400/10 text-sky-50";
}

function buildTaskDraft(defaultEmployee?: {
  authEmail: string;
  assignedZone: string;
}): WorkforceTaskInput {
  return {
    title: "",
    description: "",
    assignedEmployeeEmail: defaultEmployee?.authEmail ?? "",
    assignedZone: defaultEmployee?.assignedZone ?? "",
    routeLabel: "",
    dueWindow: "",
    status: "Pending",
  };
}

function normalizeTaskDraft(task: WorkforceTaskInput): WorkforceTaskInput {
  return {
    ...task,
    title: task.title.trim(),
    description: task.description.trim(),
    assignedZone: task.assignedZone.trim(),
    routeLabel: task.routeLabel.trim(),
    dueWindow: task.dueWindow.trim(),
  };
}

function isTaskDraftValid(task: WorkforceTaskInput) {
  const normalizedTask = normalizeTaskDraft(task);

  return Boolean(
    normalizedTask.title &&
      normalizedTask.description &&
      normalizedTask.assignedEmployeeEmail &&
      normalizedTask.assignedZone &&
      normalizedTask.routeLabel &&
      normalizedTask.dueWindow,
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[22px] border border-white/8 bg-white/[0.04] px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
    </article>
  );
}

function TaskField({
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

function TaskTextareaField({
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
      <textarea
        className="min-h-28 w-full rounded-[14px] border border-white/10 bg-[#1a273a] px-3 py-2.5 text-sm text-white outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function TaskSelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TasksPage() {
  const {
    accessRole,
    currentEmployee,
    employees,
    tasks,
    visibleTasks,
    createTask,
    deleteAllTasks,
    deleteTask,
    updateTask,
  } = useWorkforce();

  const assignableEmployees = useMemo(
    () => employees.filter((employee) => employee.role !== "Admin"),
    [employees],
  );
  const defaultAssignee = assignableEmployees[0];
  const employeeOptions = useMemo(
    () =>
      assignableEmployees.map((employee) => ({
        label: `${employee.name} | ${employee.assignedZone}`,
        value: employee.authEmail,
      })),
    [assignableEmployees],
  );

  const [newTaskDraft, setNewTaskDraft] = useState<WorkforceTaskInput>(() =>
    buildTaskDraft(defaultAssignee),
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draftTask, setDraftTask] = useState<WorkforceTask | null>(null);

  const taskSource = accessRole === "admin" ? tasks : visibleTasks;
  const completedCount = useMemo(
    () => taskSource.filter((task) => task.status === "Completed").length,
    [taskSource],
  );
  const inProgressCount = useMemo(
    () => taskSource.filter((task) => task.status === "In Progress").length,
    [taskSource],
  );
  const pendingCount = useMemo(
    () => taskSource.filter((task) => task.status === "Pending").length,
    [taskSource],
  );

  function updateNewTaskDraft<K extends keyof WorkforceTaskInput>(
    field: K,
    value: WorkforceTaskInput[K],
  ) {
    setNewTaskDraft((currentTask) => ({
      ...currentTask,
      [field]: value,
    }));
  }

  function updateNewTaskAssignee(authEmail: string) {
    const selectedEmployee = assignableEmployees.find(
      (employee) => employee.authEmail === authEmail,
    );

    setNewTaskDraft((currentTask) => ({
      ...currentTask,
      assignedEmployeeEmail: authEmail,
      assignedZone: selectedEmployee?.assignedZone ?? currentTask.assignedZone,
    }));
  }

  function resetNewTaskDraft() {
    setNewTaskDraft(buildTaskDraft(defaultAssignee));
  }

  function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isTaskDraftValid(newTaskDraft)) {
      return;
    }

    createTask(normalizeTaskDraft(newTaskDraft));
    resetNewTaskDraft();
  }

  function startEditing(task: WorkforceTask) {
    setEditingTaskId(task.taskId);
    setDraftTask(task);
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setDraftTask(null);
  }

  function updateDraftTask<K extends keyof WorkforceTask>(
    field: K,
    value: WorkforceTask[K],
  ) {
    setDraftTask((currentTask) =>
      currentTask
        ? {
            ...currentTask,
            [field]: value,
          }
        : currentTask,
    );
  }

  function updateDraftTaskAssignee(authEmail: string) {
    const selectedEmployee = assignableEmployees.find(
      (employee) => employee.authEmail === authEmail,
    );

    setDraftTask((currentTask) =>
      currentTask
        ? {
            ...currentTask,
            assignedEmployeeEmail: authEmail,
            assignedZone: selectedEmployee?.assignedZone ?? currentTask.assignedZone,
          }
        : currentTask,
    );
  }

  function saveEditing() {
    if (!editingTaskId || !draftTask) {
      return;
    }

    const normalizedTask = normalizeTaskDraft({
      title: draftTask.title,
      description: draftTask.description,
      assignedEmployeeEmail: draftTask.assignedEmployeeEmail,
      assignedZone: draftTask.assignedZone,
      routeLabel: draftTask.routeLabel,
      dueWindow: draftTask.dueWindow,
      status: draftTask.status,
    });

    if (!isTaskDraftValid(normalizedTask)) {
      return;
    }

    updateTask(editingTaskId, normalizedTask);
    cancelEditing();
  }

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div>
        <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
          Tasks
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {accessRole === "admin" ? "Task Assignment Center" : "Assigned Tasks"}
        </h1>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Tasks" value={taskSource.length} />
        <SummaryCard label="Pending" value={pendingCount} />
        <SummaryCard label="In Progress" value={inProgressCount} />
        <SummaryCard label="Completed" value={completedCount} />
      </div>

      {accessRole === "admin" ? (
        <form
          className="mt-7 rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#172337_0%,#101827_100%)] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.24)]"
          onSubmit={handleCreateTask}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Admin Controls
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Create New Task
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Add a new collection assignment and send it straight into the live task board.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={tasks.length === 0}
                onClick={deleteAllTasks}
                type="button"
              >
                Delete All Tasks
              </button>
              <button
                className="rounded-full bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isTaskDraftValid(newTaskDraft) || assignableEmployees.length === 0}
                type="submit"
              >
                Create Task
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            <TaskField
              label="Task Title"
              onChange={(value) => updateNewTaskDraft("title", value)}
              value={newTaskDraft.title}
            />
            <TaskSelectField
              label="Assign Employee"
              onChange={updateNewTaskAssignee}
              options={employeeOptions}
              value={newTaskDraft.assignedEmployeeEmail}
            />
            <TaskField
              label="Assigned Zone"
              onChange={(value) => updateNewTaskDraft("assignedZone", value)}
              value={newTaskDraft.assignedZone}
            />
            <TaskField
              label="Route Label"
              onChange={(value) => updateNewTaskDraft("routeLabel", value)}
              value={newTaskDraft.routeLabel}
            />
            <TaskField
              label="Due Window"
              onChange={(value) => updateNewTaskDraft("dueWindow", value)}
              value={newTaskDraft.dueWindow}
            />
            <TaskSelectField
              label="Status"
              onChange={(value) => updateNewTaskDraft("status", value)}
              options={TASK_STATUS_OPTIONS.map((status) => ({
                label: status,
                value: status,
              }))}
              value={newTaskDraft.status}
            />
          </div>

          <div className="mt-3">
            <TaskTextareaField
              label="Description"
              onChange={(value) => updateNewTaskDraft("description", value)}
              value={newTaskDraft.description}
            />
          </div>

          {assignableEmployees.length === 0 ? (
            <p className="mt-3 text-sm text-amber-200">
              Add a non-admin employee profile first to create assignable tasks.
            </p>
          ) : null}
        </form>
      ) : null}

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {taskSource.length === 0 ? (
          <article className="rounded-[26px] border border-dashed border-white/12 bg-white/[0.03] p-6 text-sm text-slate-300 xl:col-span-2">
            No tasks available yet.
          </article>
        ) : (
          taskSource.map((task) => {
            const isEditing = accessRole === "admin" && editingTaskId === task.taskId && !!draftTask;
            const taskDetails = isEditing && draftTask ? draftTask : task;
            const assignedEmployee = employees.find(
              (employee) => employee.authEmail === taskDetails.assignedEmployeeEmail,
            );

            return (
              <article
                key={task.taskId}
                className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#172337_0%,#101827_100%)] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.24)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {taskDetails.taskId}
                    </p>
                    {isEditing ? (
                      <div className="mt-3">
                        <TaskField
                          label="Task Title"
                          onChange={(value) => updateDraftTask("title", value)}
                          value={taskDetails.title}
                        />
                      </div>
                    ) : (
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        {taskDetails.title}
                      </h2>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                        taskDetails.status,
                      )}`}
                    >
                      {taskDetails.status}
                    </span>
                    {accessRole === "admin" ? (
                      isEditing ? (
                        <>
                          <button
                            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                            onClick={cancelEditing}
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            className="rounded-full bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!isTaskDraftValid(draftTask ?? buildTaskDraft())}
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
                          onClick={() => deleteTask(task.taskId)}
                          type="button"
                        >
                          Delete
                        </button>
                          <button
                            className="rounded-full bg-[linear-gradient(135deg,#1d4ed8,#2563eb)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                            onClick={() => startEditing(task)}
                            type="button"
                          >
                            Edit
                          </button>
                        </>
                      )
                    ) : null}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4">
                    <TaskTextareaField
                      label="Description"
                      onChange={(value) => updateDraftTask("description", value)}
                      value={taskDetails.description}
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-slate-300">{taskDetails.description}</p>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {isEditing ? (
                    <>
                      <TaskSelectField
                        label="Assign Employee"
                        onChange={updateDraftTaskAssignee}
                        options={employeeOptions}
                        value={taskDetails.assignedEmployeeEmail}
                      />
                      <TaskSelectField
                        label="Status"
                        onChange={(value) => updateDraftTask("status", value)}
                        options={TASK_STATUS_OPTIONS.map((status) => ({
                          label: status,
                          value: status,
                        }))}
                        value={taskDetails.status}
                      />
                      <TaskField
                        label="Assigned Zone"
                        onChange={(value) => updateDraftTask("assignedZone", value)}
                        value={taskDetails.assignedZone}
                      />
                      <TaskField
                        label="Route Label"
                        onChange={(value) => updateDraftTask("routeLabel", value)}
                        value={taskDetails.routeLabel}
                      />
                      <TaskField
                        label="Due Window"
                        onChange={(value) => updateDraftTask("dueWindow", value)}
                        value={taskDetails.dueWindow}
                      />
                    </>
                  ) : (
                    <>
                      <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Assigned Zone
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {taskDetails.assignedZone}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Route / Due Window
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {taskDetails.routeLabel} | {taskDetails.dueWindow}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {accessRole === "admin" ? (
                    isEditing ? null : (
                      <>
                        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Assigned Employee
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {assignedEmployee?.name ?? taskDetails.assignedEmployeeEmail}
                          </p>
                        </div>
                        <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            Status
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">{taskDetails.status}</p>
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Assigned To
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {currentEmployee?.name ?? "Assigned Employee"}
                        </p>
                      </div>

                      <TaskSelectField
                        label="Update Status"
                        onChange={(value) => updateTask(task.taskId, { status: value })}
                        options={TASK_STATUS_OPTIONS.map((status) => ({
                          label: status,
                          value: status,
                        }))}
                        value={task.status}
                      />
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
