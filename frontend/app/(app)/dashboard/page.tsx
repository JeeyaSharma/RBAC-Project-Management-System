"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { dashboardApi } from "@/lib/api";

type ProjectDashboard = {
  projectId: string;
  projectName: string;
  role: string;
  taskSummary: { total: number; todo: number; inProgress: number; done: number; blocked: number };
  activeSprint: { id: string; name: string; status: string } | null;
  sprintProgress: number | null;
  memberCount: number;
};

export default function DashboardPage() {
  const { projects } = useAppContext();
  const router = useRouter();
  const [projectDashboards, setProjectDashboards] = useState<ProjectDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllDashboards = useCallback(async () => {
    if (projects.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled(
        projects.map(async (p) => {
          const res = await dashboardApi.getProjectDashboard(p.id);
          const d = res.data as {
            project: { id: string; name: string };
            userRole: string;
            taskSummary: { total: number; todo: number; inProgress: number; done: number; blocked: number };
            activeSprint: { id: string; name: string; status: string } | null;
            sprintAnalytics: { completionPercentage: number } | null;
            members: unknown[];
          };
          return {
            projectId: p.id,
            projectName: d.project.name,
            role: d.userRole,
            taskSummary: d.taskSummary,
            activeSprint: d.activeSprint,
            sprintProgress: d.sprintAnalytics?.completionPercentage ?? null,
            memberCount: d.members.length,
          } satisfies ProjectDashboard;
        })
      );
      const successful = results
        .filter((r): r is PromiseFulfilledResult<ProjectDashboard> => r.status === "fulfilled")
        .map((r) => r.value);
      setProjectDashboards(successful);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [projects]);

  useEffect(() => {
    fetchAllDashboards();
  }, [fetchAllDashboards]);

  // Aggregate stats
  const totals = projectDashboards.reduce(
    (acc, pd) => ({
      projects: acc.projects + 1,
      tasks: acc.tasks + pd.taskSummary.total,
      todo: acc.todo + pd.taskSummary.todo,
      inProgress: acc.inProgress + pd.taskSummary.inProgress,
      done: acc.done + pd.taskSummary.done,
      blocked: acc.blocked + pd.taskSummary.blocked,
      members: acc.members + pd.memberCount,
      activeSprints: acc.activeSprints + (pd.activeSprint ? 1 : 0),
    }),
    { projects: 0, tasks: 0, todo: 0, inProgress: 0, done: 0, blocked: 0, members: 0, activeSprints: 0 }
  );

  const overallCompletion = totals.tasks > 0 ? Math.round((totals.done / totals.tasks) * 100) : 0;

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="page-title">Dashboard</h1>
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No projects yet</h3>
          <p>Create your first project to see the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview across all your projects</p>

      {loading && <div className="loading-inline"><div className="spinner" /></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && projectDashboards.length > 0 && (
        <>
          {/* Aggregate Stats */}
          <div className="stats-grid">
            <StatCard label="Projects" value={totals.projects} color="#8b5cf6" />
            <StatCard label="Total Tasks" value={totals.tasks} color="#2563eb" />
            <StatCard label="To Do" value={totals.todo} color="#f59e0b" />
            <StatCard label="In Progress" value={totals.inProgress} color="#3b82f6" />
            <StatCard label="Done" value={totals.done} color="#10b981" />
            <StatCard label="Blocked" value={totals.blocked} color="#ef4444" />
          </div>

          {/* Overall Progress */}
          <div className="grid-2" style={{ marginBottom: "24px" }}>
            <div className="card">
              <h3 className="card-heading">Overall Completion</h3>
              <div className="progress-section">
                <div className="progress-header">
                  <span>{totals.done} of {totals.tasks} tasks done</span>
                  <span>{overallCompletion}%</span>
                </div>
                <div className="progress-bar progress-bar-lg">
                  <div className="progress-fill" style={{ width: `${overallCompletion}%` }} />
                </div>
              </div>
              <div className="overview-metrics">
                <div className="overview-metric">
                  <span className="overview-metric-value">{totals.activeSprints}</span>
                  <span className="overview-metric-label">Active Sprints</span>
                </div>
                <div className="overview-metric">
                  <span className="overview-metric-value">{totals.members}</span>
                  <span className="overview-metric-label">Total Members</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-heading">Task Distribution</h3>
              <div className="task-distribution">
                {totals.tasks > 0 ? (
                  <>
                    <div className="distribution-bar">
                      {totals.done > 0 && (
                        <div
                          className="distribution-segment distribution-done"
                          style={{ width: `${(totals.done / totals.tasks) * 100}%` }}
                          title={`Done: ${totals.done}`}
                        />
                      )}
                      {totals.inProgress > 0 && (
                        <div
                          className="distribution-segment distribution-progress"
                          style={{ width: `${(totals.inProgress / totals.tasks) * 100}%` }}
                          title={`In Progress: ${totals.inProgress}`}
                        />
                      )}
                      {totals.todo > 0 && (
                        <div
                          className="distribution-segment distribution-todo"
                          style={{ width: `${(totals.todo / totals.tasks) * 100}%` }}
                          title={`To Do: ${totals.todo}`}
                        />
                      )}
                      {totals.blocked > 0 && (
                        <div
                          className="distribution-segment distribution-blocked"
                          style={{ width: `${(totals.blocked / totals.tasks) * 100}%` }}
                          title={`Blocked: ${totals.blocked}`}
                        />
                      )}
                    </div>
                    <div className="distribution-legend">
                      <div className="legend-item"><span className="legend-dot" style={{ background: "#10b981" }} /> Done ({totals.done})</div>
                      <div className="legend-item"><span className="legend-dot" style={{ background: "#3b82f6" }} /> In Progress ({totals.inProgress})</div>
                      <div className="legend-item"><span className="legend-dot" style={{ background: "#f59e0b" }} /> To Do ({totals.todo})</div>
                      <div className="legend-item"><span className="legend-dot" style={{ background: "#ef4444" }} /> Blocked ({totals.blocked})</div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted">No tasks yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Per-Project Cards */}
          <h2 className="section-heading">Projects Overview</h2>
          <div className="project-overview-grid">
            {projectDashboards.map((pd) => (
              <div
                key={pd.projectId}
                className="project-overview-card card"
                onClick={() => router.push(`/projects/${pd.projectId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") router.push(`/projects/${pd.projectId}`); }}
              >
                <div className="project-overview-header">
                  <h3 className="project-overview-name">{pd.projectName}</h3>
                  <span className={`role-badge role-${pd.role?.toLowerCase()}`}>{pd.role}</span>
                </div>

                <div className="project-overview-stats">
                  <div className="mini-stat">
                    <span className="mini-stat-value">{pd.taskSummary.total}</span>
                    <span className="mini-stat-label">Tasks</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-value">{pd.taskSummary.done}</span>
                    <span className="mini-stat-label">Done</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-value">{pd.taskSummary.inProgress}</span>
                    <span className="mini-stat-label">Active</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-value">{pd.memberCount}</span>
                    <span className="mini-stat-label">Members</span>
                  </div>
                </div>

                {pd.taskSummary.total > 0 && (
                  <div className="project-overview-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.round((pd.taskSummary.done / pd.taskSummary.total) * 100)}%` }}
                      />
                    </div>
                    <span className="progress-pct">
                      {Math.round((pd.taskSummary.done / pd.taskSummary.total) * 100)}% complete
                    </span>
                  </div>
                )}

                {pd.activeSprint && (
                  <div className="project-overview-sprint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="13 17 18 12 13 7" />
                      <polyline points="6 17 11 12 6 7" />
                    </svg>
                    <span>{pd.activeSprint.name}</span>
                    {pd.sprintProgress !== null && <span className="sprint-pct">{pd.sprintProgress}%</span>}
                  </div>
                )}
              </div>
            ))}
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
