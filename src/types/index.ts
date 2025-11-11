// Type definitions for QPerform Application

export interface PerformanceData {
  agent_email: string;
  agent_id: string;
  agent_name?: string;
  position: string;
  office: string;
  client: string;
  task: string;
  category: string;
  kpi_qa: number;
  flag_qa: string;
  kpi_avg_prod: number;
  flag_prod: string;
  week_range: string;
  start_date: string;
  end_date: string;
  month_num: number;
  month_name: string;
  year_num: number;
}

export interface SummaryData {
  client: string;
  category: string;
  total_aftes: number;
  underperformers: number;
  weeks_with_issues: number;
  avg_score: number;
}

export interface MonthlySummaryResponse {
  overall: {
    total_aftes: number;
    underperformers: number;
    avg_score: number;
  };
  details: Array<{
    client: string;
    category: string;
    total_aftes: number;
    avg_score: number;
  }>;
}

export interface ActionLog {
  id: number;
  agent_email: string;
  agent_name?: string;
  action_type: string;
  description: string;
  taken_by: string;
  action_date: string;
  week_start_date?: string;
  week_end_date?: string;
  client: string;
  category: string;
  warning_type?: string; // 'Verbal', 'Written', 'Final', 'PIP', 'Coaching', 'Termination', 'Other'
  expiration_date?: string;
  is_active?: boolean;
}

export interface FilterOptions {
  categories: string[];
  clients: string[];
  tasks: string[];
  months: string[];
  years: number[];
}

export interface PerformanceFilters {
  month?: string;
  year?: string;
  category?: string;
  client?: string;
  task?: string;
}

export interface ClientSummaryData {
  client: string;
  total_aftes: number;
  underperformers: number;
  weeks_with_issues: number;
  avg_score: number;
}

export interface AgentWarning {
  agent_email: string;
  warning_level: number;
  issue_date: string;
  expiration_date: string;
}

export interface AgentMonthlyResults {
  compliantWeeks: number;
  totalWeeks: number;
  actionCount: number;
}

export interface Recommendation {
  action: string;
  isCritical: boolean;
  notes: string;
}

export interface UserProfile {
  email: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  id: string;
}

export type UserRole = 'AVP' | 'Director' | 'Manager' | 'Assistant Manager' | 'Supervisor' | 'Team Lead' | 'Agent' | 'Unauthorized';

export interface UserPermissions {
  canTakeAction: boolean;
  canViewReports: boolean;
  canViewAllClients: boolean;
  receivesNotifications: boolean;
}

export type AppState = 'welcome' | 'authenticating' | 'authorized' | 'denied';

export interface Employee {
  id: string;
  name: string;
  email: string;
}

export interface WeekRange {
  start_date: string;
  end_date: string;
  week_range: string;
}
