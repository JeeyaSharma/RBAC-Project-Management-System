"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { dashboardApi, analyticsApi } from "@/lib/api";
import { toPublicUserId } from "@/lib/userId";

type DashboardData = {
  project: { id: string; name: string; description: string | null; created_at: string };
  userRole: string;
  activeSprint: { id: string; name: string; goal: string | null; start_date: string; end_date: string; status: string } | null;
  sprintAnalytics: { completionPercentage: number; totalTasks: number; completedTasks: number } | null;
  taskSummary: { total: number; todo: number; inProgress: number; done: number; blocked: number };
  members: { user_id: string; user_public_id?: string; role: string; name?: string }[];
  recentActivity: { user_id: string; user_public_id?: string; user_name?: string; entity_type: string; entity_id: string; action: string; metadata: Record<string, unknown>; created_at: string }[];
};

type UserPerformance = {
  userId: string;
  publicUserId?: string;
  userName?: string;
  role: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  storyPointsAssigned: number;
  storyPointsCompleted: number;
  totalActions: number;
  lastActivityAt: string | null;
};

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { setSelectedProjectId, projects } = useAppContext();
  const projectId = params.projectId as string;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, perfRes] = await Promise.allSettled([
        dashboardApi.getProjectDashboard(projectId),
        analyticsApi.getUserPerformanceAnalytics(projectId),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboard(dashRes.value.data as DashboardData);
      } else {
        setError("Failed to load project dashboard");
      }

      if (perfRes.status === "fulfilled") {
        setUserPerformance((perfRes.value.data as UserPerformance[]) || []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    setSelectedProjectId(projectId);
    fetchData();
  }, [projectId, fetchData, setSelectedProjectId]);

  const project = projects.find((p) => p.id === projectId);

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="button button-sm secondary" onClick={() => router.push("/dashboard")} style={{ marginBottom: 8 }}>
            ← Back to Dashboard
          </button>
          <h1 className="page-title">{dashboard?.project.name || project?.name || "Project Dashboard"}</h1>
          {dashboard?.project.description && (
            <p className="page-subtitle">{dashboard.project.description}</p>
          )}
        </div>
        {dashboard?.userRole && (
          <span className={`role-badge role-${dashboard.userRole.toLowerCase()}`}>{dashboard.userRole}</span>
        )}
      </div>

      {loading && <div className="loading-inline"><div className="spinner" /></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {dashboard && !loading && (
        <>
          {/* Stat Cards */}
          <div className="stats-grid">
            <StatCard label="Total Tasks" value={dashboard.taskSummary.total} color="#2563eb" />
            <StatCard label="To Do" value={dashboard.taskSummary.todo} color="#f59e0b" />
            <StatCard label="In Progress" value={dashboard.taskSummary.inProgress} color="#3b82f6" />
            <StatCard label="Done" value={dashboard.taskSummary.done} color="#10b981" />
            <StatCard label="Blocked" value={dashboard.taskSummary.blocked} color="#ef4444" />
            <StatCard label="Members" value={dashboard.members.length} color="#8b5cf6" />
          </div>

          {/* Active Sprint & Members */}
          <div className="grid-2">
            <div className="card">
              <h3 className="card-heading">Active Sprint</h3>
              {dashboard.activeSprint ? (
                <div className="sprint-info">
                  <p className="sprint-name">{dashboard.activeSprint.name}</p>
                  {dashboard.activeSprint.goal && (
                    <p className="sprint-goal">{dashboard.activeSprint.goal}</p>
                  )}
                  <div className="sprint-dates">
                    <span>{new Date(dashboard.activeSprint.start_date).toLocaleDateString()}</span>
                    <span className="date-separator">→</span>
                    <span>{new Date(dashboard.activeSprint.end_date).toLocaleDateString()}</span>
                  </div>
                  {dashboard.sprintAnalytics && (
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{dashboard.sprintAnalytics.completionPercentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${dashboard.sprintAnalytics.completionPercentage}%` }}
                        />
                      </div>
                      <div className="progress-details">
                        <span>{dashboard.sprintAnalytics.completedTasks}/{dashboard.sprintAnalytics.totalTasks} tasks</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted">No active sprint</p>
              )}
            </div>

            <div className="card">
              <h3 className="card-heading">Team Members</h3>
              <div className="members-list">
                {dashboard.members.map((m, i) => (
                  <div key={m.user_id || i} className="member-row">
                    <div className="member-avatar">{(m.name || m.role || "?").charAt(0).toUpperCase()}</div>
                    <div className="member-info">
                      <span className="member-name">{m.name || m.user_public_id || toPublicUserId(m.user_id)}</span>
                      <span className="member-role">{m.role} {m.user_public_id || toPublicUserId(m.user_id)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Performance Table */}
          {userPerformance.length > 0 && (
            <div className="card" style={{ marginTop: "20px" }}>
              <h3 className="card-heading">Team Performance</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Assigned</th>
                      <th>Completed</th>
                      <th>In Progress</th>
                      <th>Story Pts</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPerformance.map((u) => (
                      <tr key={u.userId}>
                        <td>
                          <div className="table-user">
                            <div className="member-avatar">{u.role.charAt(0).toUpperCase()}</div>
                            <span className="table-user-id">{u.userName || u.publicUserId || toPublicUserId(u.userId)}</span>
                          </div>
                        </td>
                        <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                        <td>{u.tasksAssigned}</td>
                        <td><span className="text-success">{u.tasksCompleted}</span></td>
                        <td>{u.tasksInProgress}</td>
                        <td>{u.storyPointsCompleted}/{u.storyPointsAssigned}</td>
                        <td>{u.totalActions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card" style={{ marginTop: "20px" }}>
            <h3 className="card-heading">Recent Activity</h3>
            {dashboard.recentActivity.length === 0 ? (
              <p className="text-muted">No recent activity</p>
            ) : (
              <div className="activity-list">
                {dashboard.recentActivity.map((a, i) => (
                  <div key={i} className="activity-row">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <span>
                        {(a.user_name || a.user_public_id || toPublicUserId(a.user_id))} {a.action.toLowerCase().replace("_", " ")} a {a.entity_type.toLowerCase()}
                      </span>
                      <span className="activity-time">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="stat-card">
      <div className="stat-indicator" style={{ backgroundColor: color }} />
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
