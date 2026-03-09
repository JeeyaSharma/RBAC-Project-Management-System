// ---- Auth ----
export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

// ---- Projects ----
export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  role?: string;
};

// ---- Sprints ----
export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export type Sprint = {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  created_at: string;
  updated_at: string;
};

// ---- Tasks ----
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export type Task = {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  story_points: number | null;
  assignee_id: string | null;
  assignee_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ---- Dashboard ----
export type DashboardData = {
  project: {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
  };
  userRole: string;
  activeSprint: Sprint | null;
  sprintAnalytics: {
    completion_percentage: number;
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    completed_story_points: number;
  } | null;
  taskSummary: {
    todo: number;
    in_progress: number;
    done: number;
    blocked: number;
  };
  members: { id: string; name: string; email: string; role: string }[];
  recentActivity: {
    id: string;
    user_name: string;
    entity_type: string;
    action: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }[];
};

// ---- Pagination ----
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ---- Members ----
export type ProjectMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ProjectRole = "OWNER" | "PROJECT_MANAGER" | "DEVELOPER" | "VIEWER";
