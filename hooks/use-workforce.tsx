"use client";

import { onValue, ref, remove, set } from "firebase/database";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/hooks/use-auth";
import {
  type AccessRole,
  type AppUserAccount,
  isBuiltInAdminEmail,
  normalizeEmail,
} from "@/lib/app-user-access";
import { EMPLOYEE_PROFILES, type EmployeeProfile } from "@/lib/employee-profiles";
import { getRealtimeDatabase, isFirebaseConfigured } from "@/lib/firebase/config";
import {
  INITIAL_ISSUE_REPORTS,
  INITIAL_WORKFORCE_TASKS,
  type IssueReport,
  type IssueReportStatus,
  type WorkforceTask,
  type WorkforceTaskInput,
} from "@/lib/workforce-data";

export type DashboardAccessRole = AccessRole;

function createDerivedEmployeeProfile(appUser: AppUserAccount): EmployeeProfile {
  const fallbackName =
    appUser.displayName?.trim() ||
    appUser.email.split("@")[0] ||
    "Operations Employee";
  const employeeSuffix = (appUser.uid || appUser.email)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toUpperCase()
    .padStart(4, "0");

  return {
    authEmail: appUser.email,
    employeeId: `EMP-${employeeSuffix}`,
    name: fallbackName,
    role: "Collector",
    phoneNumber: "Not added yet",
    assignedZone: "Unassigned Zone",
    status: "Active",
  };
}

function getTaskNumber(taskId: string) {
  const matchedNumber = Number(taskId.replace("TASK-", ""));
  return Number.isNaN(matchedNumber) ? 0 : matchedNumber;
}

function getIssueReportNumber(reportId: string) {
  const matchedNumber = Number(reportId.replace("ISSUE-", ""));
  return Number.isNaN(matchedNumber) ? 0 : matchedNumber;
}

function sortTasksById(tasks: WorkforceTask[]) {
  return [...tasks].sort(
    (firstTask, secondTask) => getTaskNumber(firstTask.taskId) - getTaskNumber(secondTask.taskId),
  );
}

function sortIssueReportsById(issueReports: IssueReport[]) {
  return [...issueReports].sort(
    (firstReport, secondReport) =>
      getIssueReportNumber(secondReport.reportId) - getIssueReportNumber(firstReport.reportId),
  );
}

function sortEmployeeProfiles(employeeProfiles: EmployeeProfile[]) {
  return [...employeeProfiles].sort((firstProfile, secondProfile) =>
    firstProfile.employeeId.localeCompare(secondProfile.employeeId),
  );
}

function createTaskRecord(tasks: WorkforceTask[]) {
  return Object.fromEntries(tasks.map((task) => [task.taskId, task]));
}

function createIssueReportRecord(issueReports: IssueReport[]) {
  return Object.fromEntries(issueReports.map((report) => [report.reportId, report]));
}

function createEmployeeProfileRecord(employeeProfiles: EmployeeProfile[]) {
  return Object.fromEntries(
    employeeProfiles.map((employee) => [getEmployeeProfileKey(employee.authEmail), employee]),
  );
}

function getEmployeeProfileKey(authEmail: string) {
  return normalizeEmail(authEmail).replace(/[.#$/\[\]]/g, "_");
}

type WorkforceContextValue = {
  accessRole: DashboardAccessRole;
  currentAppUser: AppUserAccount | null;
  currentEmployee: EmployeeProfile | null;
  appUsers: AppUserAccount[];
  employees: EmployeeProfile[];
  tasks: WorkforceTask[];
  issueReports: IssueReport[];
  visibleTasks: WorkforceTask[];
  visibleIssueReports: IssueReport[];
  isAdmin: boolean;
  createEmployee: (employee: EmployeeProfile) => void;
  updateEmployee: (authEmail: string, nextEmployee: EmployeeProfile) => void;
  deleteEmployee: (authEmail: string) => void;
  updateUserAccessRole: (uid: string, accessRole: AccessRole) => Promise<void>;
  createTask: (input: WorkforceTaskInput) => void;
  updateTask: (taskId: string, updates: Partial<WorkforceTask>) => void;
  deleteTask: (taskId: string) => void;
  deleteAllTasks: () => void;
  submitIssueReport: (input: {
    taskId: string | null;
    zone: string;
    message: string;
  }) => void;
  updateIssueReportStatus: (reportId: string, status: IssueReportStatus) => void;
  deleteIssueReport: (reportId: string) => void;
};

const WorkforceContext = createContext<WorkforceContextValue | null>(null);

export function WorkforceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [appUsers, setAppUsers] = useState<AppUserAccount[]>([]);
  const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfile[]>(EMPLOYEE_PROFILES);
  const [tasks, setTasks] = useState<WorkforceTask[]>(INITIAL_WORKFORCE_TASKS);
  const [issueReports, setIssueReports] = useState<IssueReport[]>(INITIAL_ISSUE_REPORTS);
  const employees = useMemo(() => {
    const registeredEmployeeEmails = new Set(
      employeeProfiles.map((employee) => normalizeEmail(employee.authEmail)),
    );
    const derivedEmployees = appUsers
      .filter((appUser) => appUser.accessRole === "employee")
      .filter((appUser) => !registeredEmployeeEmails.has(normalizeEmail(appUser.email)))
      .map(createDerivedEmployeeProfile);

    return [...employeeProfiles, ...derivedEmployees];
  }, [appUsers, employeeProfiles]);

  const normalizedUserEmail = normalizeEmail(user?.email);
  const currentAppUser =
    appUsers.find((appUser) => appUser.uid === user?.uid) ??
    appUsers.find((appUser) => normalizeEmail(appUser.email) === normalizedUserEmail) ??
    null;
  const currentEmployee =
    employees.find((employee) => normalizeEmail(employee.authEmail) === normalizedUserEmail) ??
    null;
  const accessRole: DashboardAccessRole =
    currentAppUser?.accessRole ??
    (currentEmployee?.role === "Admin" || isBuiltInAdminEmail(normalizedUserEmail)
      ? "admin"
      : currentEmployee
        ? "employee"
        : "user");
  const isAdmin = accessRole === "admin";

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const unsubscribe = onValue(ref(getRealtimeDatabase(), "/appUsers"), (snapshot) => {
      if (!snapshot.exists()) {
        setAppUsers([]);
        return;
      }

      const nextUsers = Object.values(snapshot.val() as Record<string, AppUserAccount>);
      setAppUsers(nextUsers);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const employeeProfilesRef = ref(getRealtimeDatabase(), "/employeeProfiles");
    const unsubscribe = onValue(employeeProfilesRef, (snapshot) => {
      if (!snapshot.exists()) {
        const initialEmployeeRecord = createEmployeeProfileRecord(EMPLOYEE_PROFILES);
        setEmployeeProfiles(sortEmployeeProfiles(EMPLOYEE_PROFILES));
        void set(employeeProfilesRef, initialEmployeeRecord);
        return;
      }

      const nextProfiles = Object.values(
        snapshot.val() as Record<string, EmployeeProfile>,
      );
      setEmployeeProfiles(sortEmployeeProfiles(nextProfiles));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const tasksRef = ref(getRealtimeDatabase(), "/workforceTasks");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      if (!snapshot.exists()) {
        const initialTaskRecord = createTaskRecord(INITIAL_WORKFORCE_TASKS);
        setTasks(sortTasksById(INITIAL_WORKFORCE_TASKS));
        void set(tasksRef, initialTaskRecord);
        return;
      }

      const nextTasks = Object.values(snapshot.val() as Record<string, WorkforceTask>);
      setTasks(sortTasksById(nextTasks));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const issueReportsRef = ref(getRealtimeDatabase(), "/issueReports");
    const unsubscribe = onValue(issueReportsRef, (snapshot) => {
      if (!snapshot.exists()) {
        const initialIssueReportRecord = createIssueReportRecord(INITIAL_ISSUE_REPORTS);
        setIssueReports(sortIssueReportsById(INITIAL_ISSUE_REPORTS));
        void set(issueReportsRef, initialIssueReportRecord);
        return;
      }

      const nextReports = Object.values(snapshot.val() as Record<string, IssueReport>);
      setIssueReports(sortIssueReportsById(nextReports));
    });

    return () => unsubscribe();
  }, []);

  const visibleTasks = useMemo(() => {
    if (isAdmin) {
      return tasks;
    }

    return tasks.filter(
      (task) => normalizeEmail(task.assignedEmployeeEmail) === normalizedUserEmail,
    );
  }, [isAdmin, normalizedUserEmail, tasks]);

  const visibleIssueReports = useMemo(() => {
    if (isAdmin) {
      return issueReports;
    }

    return issueReports.filter(
      (report) => normalizeEmail(report.employeeEmail) === normalizedUserEmail,
    );
  }, [isAdmin, issueReports, normalizedUserEmail]);

  function createEmployee(employee: EmployeeProfile) {
    const nextEmployee = {
      ...employee,
      authEmail: normalizeEmail(employee.authEmail),
    };

    setEmployeeProfiles((currentEmployees) => {
      const normalizedTargetEmail = normalizeEmail(nextEmployee.authEmail);
      const matchingEmployeeIndex = currentEmployees.findIndex(
        (currentEmployee) =>
          normalizeEmail(currentEmployee.authEmail) === normalizedTargetEmail,
      );

      if (matchingEmployeeIndex === -1) {
        return sortEmployeeProfiles([...currentEmployees, nextEmployee]);
      }

      return sortEmployeeProfiles(
        currentEmployees.map((currentEmployee) =>
          normalizeEmail(currentEmployee.authEmail) === normalizedTargetEmail
            ? nextEmployee
            : currentEmployee,
        ),
      );
    });

    if (!isFirebaseConfigured()) {
      return;
    }

    void set(
      ref(
        getRealtimeDatabase(),
        `/employeeProfiles/${getEmployeeProfileKey(nextEmployee.authEmail)}`,
      ),
      nextEmployee,
    );
  }

  function updateEmployee(authEmail: string, nextEmployee: EmployeeProfile) {
    const nextProfile = { ...nextEmployee, authEmail };

    setEmployeeProfiles((currentEmployees) => {
      const normalizedTargetEmail = normalizeEmail(authEmail);
      const matchingEmployeeIndex = currentEmployees.findIndex(
        (employee) => normalizeEmail(employee.authEmail) === normalizedTargetEmail,
      );

      if (matchingEmployeeIndex === -1) {
        return sortEmployeeProfiles([...currentEmployees, nextProfile]);
      }

      return sortEmployeeProfiles(
        currentEmployees.map((employee) =>
          normalizeEmail(employee.authEmail) === normalizedTargetEmail
            ? nextProfile
            : employee,
        ),
      );
    });

    if (!isFirebaseConfigured()) {
      return;
    }

    void set(
      ref(getRealtimeDatabase(), `/employeeProfiles/${getEmployeeProfileKey(authEmail)}`),
      nextProfile,
    );
  }

  function deleteEmployee(authEmail: string) {
    const normalizedTargetEmail = normalizeEmail(authEmail);
    const linkedAppUser =
      appUsers.find((appUser) => normalizeEmail(appUser.email) === normalizedTargetEmail) ?? null;

    setEmployeeProfiles((currentEmployees) =>
      currentEmployees.filter(
        (employee) => normalizeEmail(employee.authEmail) !== normalizedTargetEmail,
      ),
    );

    if (linkedAppUser?.accessRole === "employee") {
      setAppUsers((currentUsers) =>
        currentUsers.map((appUser) =>
          appUser.uid === linkedAppUser.uid
            ? {
                ...appUser,
                accessRole: "user",
              }
            : appUser,
        ),
      );
    }

    if (!isFirebaseConfigured()) {
      return;
    }

    void remove(
      ref(getRealtimeDatabase(), `/employeeProfiles/${getEmployeeProfileKey(authEmail)}`),
    );

    if (linkedAppUser?.accessRole === "employee") {
      void set(ref(getRealtimeDatabase(), `/appUsers/${linkedAppUser.uid}`), {
        ...linkedAppUser,
        accessRole: "user",
      });
    }
  }

  async function updateUserAccessRole(uid: string, nextAccessRole: AccessRole) {
    if (!isFirebaseConfigured()) {
      setAppUsers((currentUsers) =>
        currentUsers.map((appUser) =>
          appUser.uid === uid
            ? {
                ...appUser,
                accessRole: nextAccessRole,
              }
            : appUser,
        ),
      );
      return;
    }

    const targetUser = appUsers.find((appUser) => appUser.uid === uid);

    if (!targetUser) {
      return;
    }

    await set(ref(getRealtimeDatabase(), `/appUsers/${uid}`), {
      ...targetUser,
      accessRole: nextAccessRole,
    });
  }

  function createTask(input: WorkforceTaskInput) {
    const nextTaskNumber =
      tasks.reduce(
        (highestTaskNumber, task) => Math.max(highestTaskNumber, getTaskNumber(task.taskId)),
        0,
      ) + 1;
    const nextTask = {
      taskId: `TASK-${String(nextTaskNumber).padStart(3, "0")}`,
      ...input,
    };

    setTasks((currentTasks) => sortTasksById([...currentTasks, nextTask]));

    if (!isFirebaseConfigured()) {
      return;
    }

    void set(ref(getRealtimeDatabase(), `/workforceTasks/${nextTask.taskId}`), nextTask);
  }

  function updateTask(taskId: string, updates: Partial<WorkforceTask>) {
    const targetTask = tasks.find((task) => task.taskId === taskId);

    if (!targetTask) {
      return;
    }

    const nextTask = {
      ...targetTask,
      ...updates,
    };

    setTasks((currentTasks) =>
      sortTasksById(
        currentTasks.map((task) => (task.taskId === taskId ? nextTask : task)),
      ),
    );

    if (!isFirebaseConfigured()) {
      return;
    }

    void set(ref(getRealtimeDatabase(), `/workforceTasks/${taskId}`), nextTask);
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.taskId !== taskId));

    if (!isFirebaseConfigured()) {
      return;
    }

    void remove(ref(getRealtimeDatabase(), `/workforceTasks/${taskId}`));
  }

  function deleteAllTasks() {
    setTasks([]);

    if (!isFirebaseConfigured()) {
      return;
    }

    void remove(ref(getRealtimeDatabase(), "/workforceTasks"));
  }

  function submitIssueReport(input: {
    taskId: string | null;
    zone: string;
    message: string;
  }) {
    const reporterName =
      currentEmployee?.name ||
      user?.displayName ||
      user?.email ||
      "Operations Employee";

    const nextReportId = `ISSUE-${String(issueReports.length + 1).padStart(3, "0")}`;

    const nextReport = {
      reportId: nextReportId,
      employeeEmail: user?.email ?? "unassigned@wcegms.local",
      employeeName: reporterName,
      taskId: input.taskId,
      zone: input.zone,
      message: input.message,
      status: "Open" as const,
      createdLabel: "Just now",
    };

    setIssueReports((currentReports) => sortIssueReportsById([nextReport, ...currentReports]));

    if (!isFirebaseConfigured()) {
      return;
    }

    void set(ref(getRealtimeDatabase(), `/issueReports/${nextReport.reportId}`), nextReport);
  }

  function updateIssueReportStatus(reportId: string, status: IssueReportStatus) {
    const targetReport = issueReports.find((report) => report.reportId === reportId);

    if (!targetReport) {
      return;
    }

    const nextReport = {
      ...targetReport,
      status,
    };

    setIssueReports((currentReports) =>
      sortIssueReportsById(
        currentReports.map((report) =>
          report.reportId === reportId ? nextReport : report,
        ),
      ),
    );

    if (!isFirebaseConfigured()) {
      return;
    }

    void set(ref(getRealtimeDatabase(), `/issueReports/${reportId}`), nextReport);
  }

  function deleteIssueReport(reportId: string) {
    setIssueReports((currentReports) =>
      currentReports.filter((report) => report.reportId !== reportId),
    );

    if (!isFirebaseConfigured()) {
      return;
    }

    void remove(ref(getRealtimeDatabase(), `/issueReports/${reportId}`));
  }

  return (
    <WorkforceContext.Provider
      value={{
        accessRole,
        currentAppUser,
        currentEmployee,
        appUsers,
        employees,
        tasks,
        issueReports,
        visibleTasks,
        visibleIssueReports,
        isAdmin,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        updateUserAccessRole,
        createTask,
        updateTask,
        deleteTask,
        deleteAllTasks,
        submitIssueReport,
        updateIssueReportStatus,
        deleteIssueReport,
      }}
    >
      {children}
    </WorkforceContext.Provider>
  );
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);

  if (!context) {
    throw new Error("useWorkforce must be used within a WorkforceProvider.");
  }

  return context;
}
