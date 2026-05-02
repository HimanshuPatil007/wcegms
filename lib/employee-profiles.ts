export type EmployeeRole = "Driver" | "Collector" | "Admin";
export type EmployeeStatus = "Active" | "On Leave";

export type EmployeeProfile = {
  authEmail: string;
  employeeId: string;
  name: string;
  role: EmployeeRole;
  phoneNumber: string;
  assignedZone: string;
  status: EmployeeStatus;
};

export const EMPLOYEE_PROFILES: EmployeeProfile[] = [
  {
    authEmail: "himanshu.patil@walchandsangli.ac.in",
    employeeId: "EMP-000",
    name: "Himanshu Patil",
    role: "Admin",
    phoneNumber: "+91 98765 10000",
    assignedZone: "Central Operations Desk",
    status: "Active",
  },
  {
    authEmail: "rohit.patil@wcegms.com",
    employeeId: "EMP-001",
    name: "Rohit Patil",
    role: "Driver",
    phoneNumber: "+91 98765 10001",
    assignedZone: "North Gate Zone",
    status: "Active",
  },
  {
    authEmail: "sneha.jadhav@wcegms.com",
    employeeId: "EMP-002",
    name: "Sneha Jadhav",
    role: "Collector",
    phoneNumber: "+91 98765 10002",
    assignedZone: "Academic Block Zone",
    status: "Active",
  },
  {
    authEmail: "aditya.kulkarni@wcegms.com",
    employeeId: "EMP-003",
    name: "Aditya Kulkarni",
    role: "Driver",
    phoneNumber: "+91 98765 10003",
    assignedZone: "Hostel Ring Route",
    status: "On Leave",
  },
  {
    authEmail: "priya.shinde@wcegms.com",
    employeeId: "EMP-004",
    name: "Priya Shinde",
    role: "Collector",
    phoneNumber: "+91 98765 10004",
    assignedZone: "Library and Labs Zone",
    status: "Active",
  },
  {
    authEmail: "admin@wcegms.com",
    employeeId: "EMP-005",
    name: "Vikram Desai",
    role: "Admin",
    phoneNumber: "+91 98765 10005",
    assignedZone: "Central Operations Desk",
    status: "Active",
  },
  {
    authEmail: "kiran.more@wcegms.com",
    employeeId: "EMP-006",
    name: "Kiran More",
    role: "Collector",
    phoneNumber: "+91 98765 10006",
    assignedZone: "Sports and Canteen Zone",
    status: "On Leave",
  },
  {
    authEmail: "meera.admin@wcegms.com",
    employeeId: "EMP-007",
    name: "Meera Joshi",
    role: "Admin",
    phoneNumber: "+91 98765 10007",
    assignedZone: "Alerts and Dispatch Desk",
    status: "Active",
  },
  {
    authEmail: "sagar.pawar@wcegms.com",
    employeeId: "EMP-008",
    name: "Sagar Pawar",
    role: "Driver",
    phoneNumber: "+91 98765 10008",
    assignedZone: "South Campus Route",
    status: "Active",
  },
];
