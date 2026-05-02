export type WorkforceTaskStatus = "Pending" | "In Progress" | "Completed";
export type IssueReportStatus = "Open" | "Resolved";

export type WorkforceTask = {
  taskId: string;
  title: string;
  description: string;
  assignedEmployeeEmail: string;
  assignedZone: string;
  routeLabel: string;
  dueWindow: string;
  status: WorkforceTaskStatus;
};

export type WorkforceTaskInput = Omit<WorkforceTask, "taskId">;

export type IssueReport = {
  reportId: string;
  employeeEmail: string;
  employeeName: string;
  taskId: string | null;
  zone: string;
  message: string;
  status: IssueReportStatus;
  createdLabel: string;
};

export const INITIAL_WORKFORCE_TASKS: WorkforceTask[] = [
  {
    taskId: "TASK-001",
    title: "North Gate pickup run",
    description: "Clear the high-fill bins near Main Gate and the adjacent parking strip.",
    assignedEmployeeEmail: "rohit.patil@wcegms.com",
    assignedZone: "North Gate Zone",
    routeLabel: "Route A1",
    dueWindow: "07:30 AM - 09:00 AM",
    status: "In Progress",
  },
  {
    taskId: "TASK-002",
    title: "Academic block collection",
    description: "Collect overflow bins near Tilak Hall and lecture building corridors.",
    assignedEmployeeEmail: "sneha.jadhav@wcegms.com",
    assignedZone: "Academic Block Zone",
    routeLabel: "Route B2",
    dueWindow: "09:00 AM - 10:30 AM",
    status: "Pending",
  },
  {
    taskId: "TASK-003",
    title: "Hostel ring sweep",
    description: "Complete the south hostel loop once vehicle handoff is available.",
    assignedEmployeeEmail: "aditya.kulkarni@wcegms.com",
    assignedZone: "Hostel Ring Route",
    routeLabel: "Route H1",
    dueWindow: "11:00 AM - 12:00 PM",
    status: "Pending",
  },
  {
    taskId: "TASK-004",
    title: "Labs and library collection",
    description: "Inspect and empty wet and dry bins near labs, library, and entrance walkways.",
    assignedEmployeeEmail: "priya.shinde@wcegms.com",
    assignedZone: "Library and Labs Zone",
    routeLabel: "Route L3",
    dueWindow: "01:00 PM - 02:15 PM",
    status: "In Progress",
  },
  {
    taskId: "TASK-005",
    title: "Canteen waste transfer",
    description: "Collect post-lunch waste and update the depot handoff status.",
    assignedEmployeeEmail: "kiran.more@wcegms.com",
    assignedZone: "Sports and Canteen Zone",
    routeLabel: "Route C4",
    dueWindow: "02:00 PM - 03:00 PM",
    status: "Pending",
  },
  {
    taskId: "TASK-006",
    title: "South campus haul",
    description: "Drive the secondary truck across the south campus route and confirm completion.",
    assignedEmployeeEmail: "sagar.pawar@wcegms.com",
    assignedZone: "South Campus Route",
    routeLabel: "Route S2",
    dueWindow: "03:30 PM - 05:00 PM",
    status: "Completed",
  },
];

export const INITIAL_ISSUE_REPORTS: IssueReport[] = [
  {
    reportId: "ISSUE-001",
    employeeEmail: "rohit.patil@wcegms.com",
    employeeName: "Rohit Patil",
    taskId: "TASK-001",
    zone: "North Gate Zone",
    message: "Traffic congestion near the entrance is delaying the first pickup loop.",
    status: "Open",
    createdLabel: "Today, 08:12 AM",
  },
  {
    reportId: "ISSUE-002",
    employeeEmail: "priya.shinde@wcegms.com",
    employeeName: "Priya Shinde",
    taskId: "TASK-004",
    zone: "Library and Labs Zone",
    message: "Gas sensor alert remains elevated near the chemistry wing bin cluster.",
    status: "Resolved",
    createdLabel: "Today, 01:48 PM",
  },
];
