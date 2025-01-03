export interface Role {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ProjectRole {
  roleId: string;
  projectId: string;
  costRate: number;
  sellRate: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  approverEmail: string;
}

export interface ProjectWithStatus {
  id: string;
  name: string;
  clientName: string;
  totalHours: number;
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  budget: number;
  startDate: string;
  endDate: string;
  approverEmail: string;
  requiresApproval: boolean;
  roles: ProjectRole[];
}

export interface TimeEntry {
  id: string;
  userId: string;
  clientId: string;
  projectId: string;
  roleId: string;
  date: string;
  hours: number;
  description?: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  clientIds: string[];
  projectIds: string[];
  roleIds: string[];
}

export interface ReportEntry {
  id: string;
  date: string;
  clientName: string;
  projectName: string;
  roleName: string;
  hours: number;
  cost: number;
  revenue: number;
  profit: number;
}

export interface ReportSummary {
  totalHours: number;
  totalCost: number;
  totalRevenue: number;
  profitMargin: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  projectAssignments: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  clientId: string;
}

export interface ReportData {
  entries: ReportEntry[];
  summary: ReportSummary;
}

export interface ApprovalStatus {
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvalId: string;
}

export interface Approval {
  id: string;
  compositeKey: string;  // Composite key for querying: {projectId}_{startDate}_{endDate}_{userId}
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  withdrawnAt?: Date;
  rejectionReason?: string;
  project: Project;
  client: Client;
  period: {
    startDate: string;
    endDate: string;
  };
  totalHours: number;
  userId: string;
  approverEmail: string;
}