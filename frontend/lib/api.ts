const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Something went wrong");
  }

  return json;
}

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    request<{ data: { token: string; user: { id: string; name: string; email: string } } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  signup: (name: string, email: string, password: string) =>
    request<{ data: { user: { id: string; name: string; email: string } } }>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify({ name, email, password }) }
    ),
};

// ---- Projects ----
export const projectsApi = {
  getMyProjects: () =>
    request<{ data: Array<{ id: string; name: string; description: string | null; created_by: string; created_at: string; role: string }> }>("/projects"),

  createProject: (name: string, description?: string) =>
    request<{ data: { id: string; name: string; description: string | null } }>(
      "/projects",
      { method: "POST", body: JSON.stringify({ name, description }) }
    ),

  addMember: (projectId: string, userId: string, role: string) =>
    request<{ data: unknown }>(
      `/projects/${encodeURIComponent(projectId)}/members`,
      { method: "POST", body: JSON.stringify({ userId, role }) }
    ),
};

// ---- Sprints ----
export const sprintsApi = {
  createSprint: (
    projectId: string,
    data: { name: string; startDate: string; endDate: string; goal?: string }
  ) =>
    request<{ data: { sprint: unknown } }>(
      `/projects/${encodeURIComponent(projectId)}/sprints`,
      { method: "POST", body: JSON.stringify(data) }
    ),

  startSprint: (projectId: string, sprintId: string) =>
    request<{ data: unknown }>(
      `/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}/start`,
      { method: "PATCH" }
    ),

  completeSprint: (projectId: string, sprintId: string) =>
    request<{ data: unknown }>(
      `/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}/complete`,
      { method: "PATCH" }
    ),
};

// ---- Tasks ----
export const tasksApi = {
  getProjectTasks: (
    projectId: string,
    params?: { page?: number; limit?: number; status?: string; assigneeId?: string }
  ) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.assigneeId) query.set("assigneeId", params.assigneeId);
    const qs = query.toString();
    return request<{ data: { tasks: unknown[]; pagination: unknown } }>(
      `/projects/${encodeURIComponent(projectId)}/tasks${qs ? `?${qs}` : ""}`
    );
  },

  getSprintTasks: (
    projectId: string,
    sprintId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<{ data: { tasks: unknown[]; pagination: unknown } }>(
      `/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}/tasks${qs ? `?${qs}` : ""}`
    );
  },

  getTaskById: (taskId: string) =>
    request<{ data: { task: unknown } }>(`/tasks/${encodeURIComponent(taskId)}`),

  createTask: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      storyPoints?: number;
      sprintId?: string;
      assigneeId?: string;
    }
  ) =>
    request<{ data: { task: unknown } }>(
      `/projects/${encodeURIComponent(projectId)}/tasks`,
      { method: "POST", body: JSON.stringify(data) }
    ),

  updateTask: (
    projectId: string,
    taskId: string,
    data: {
      title?: string;
      description?: string;
      storyPoints?: number;
      assigneeId?: string;
      sprintId?: string | null;
    }
  ) =>
    request<{ data: { task: unknown } }>(
      `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}`,
      { method: "PATCH", body: JSON.stringify(data) }
    ),

  updateTaskStatus: (projectId: string, taskId: string, newStatus: string) =>
    request<{ data: { task: unknown } }>(
      `/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskId)}/status`,
      { method: "PATCH", body: JSON.stringify({ newStatus }) }
    ),
};

// ---- Dashboard ----
export const dashboardApi = {
  getProjectDashboard: (projectId: string) =>
    request<{ data: unknown }>(`/projects/${encodeURIComponent(projectId)}/dashboard`),
};

// ---- Analytics ----
export const analyticsApi = {
  getSprintAnalytics: (projectId: string, sprintId: string) =>
    request<{ data: unknown }>(
      `/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}/analytics`
    ),

  getUserPerformanceAnalytics: (projectId: string) =>
    request<{ data: unknown }>(`/projects/${encodeURIComponent(projectId)}/analytics/users`),
};
