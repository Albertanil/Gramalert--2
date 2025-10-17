// In lib/types.ts

export interface Grievance {
  id: number;
  title: string;
  description: string;
  status: "Received" | "In Progress" | "Resolved";
  priority: "High" | "Medium" | "Low";
  category: string;
  createdAt: string;
  submittedBy: string;
  isOverdue: boolean;
  reportCount: number;
  escalationLevel: string;
  daysUntilEscalation: number;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: string;
  startTime: string | null; // ISO Date String
  endTime: string | null;   // ISO Date String
  createdAt: string;
}