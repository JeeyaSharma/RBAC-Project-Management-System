"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";

type ProfileData = {
  user: {
    id: string;
    name: string;
    email: string;
    publicId: string;
    createdAt: string;
  };
  summary: {
    projectsCount: number;
    assignedTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    storyPointsAssigned: number;
    storyPointsCompleted: number;
    totalActions: number;
    lastActivityAt: string | null;
  };
  projectBreakdown: Array<{
    projectId: string;
    projectName: string;
    role: string;
    tasksAssigned: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksBlocked: number;
    storyPointsAssigned: number;
    storyPointsCompleted: number;
    totalActions: number;
    lastActivityAt: string | null;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    storyPoints: number | null;
    updatedAt: string;
    projectId: string;
    projectName: string;
  }>;
  recentActivity: Array<{
    projectId: string;
    projectName: string | null;
    entityType: string;
    entityId: string;
    action: string;
    createdAt: string;
  }>;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await usersApi.getMyProfile();
        setProfile(res.data as ProfileData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const completionRate = profile && profile.summary.assignedTasks > 0
    ? Math.round((profile.summary.completedTasks / profile.summary.assignedTasks) * 100)
    : 0;

  return (
    <div>
      <div className="page-header profile-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your work, contribution, and activity across projects.</p>
        </div>
      </div>

      {loading && <div className="loading-inline"><div className="spinner" /></div>}
      {error && <div className="alert alert-error">{error}</div>}

      {profile && !loading && (
        <>
          <div className="profile-hero card">
            <div className="profile-identity">
              <div className="profile-avatar">{profile.user.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="profile-name">{profile.user.name}</h2>
                <p className="profile-email">{profile.user.email}</p>
                <div className="profile-meta-row">
                  <span className="profile-public-id">{profile.user.publicId}</span>
                  <span className="profile-meta-sep">•</span>
                  <span className="profile-meta-text">Joined {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="profile-highlight">
              <span className="profile-highlight-value">{completionRate}%</span>
              <span className="profile-highlight-label">Task completion rate</span>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard label="Projects" value={profile.summary.projectsCount} color="#8b5cf6" />
            <StatCard label="Assigned" value={profile.summary.assignedTasks} color="#2563eb" />
            <StatCard label="Completed" value={profile.summary.completedTasks} color="#10b981" />
            <StatCard label="In Progress" value={profile.summary.inProgressTasks} color="#3b82f6" />
            <StatCard label="Blocked" value={profile.summary.blockedTasks} color="#ef4444" />
            <StatCard label="Actions" value={profile.summary.totalActions} color="#f59e0b" />
          </div>

          <div className="grid-2" style={{ marginBottom: "20px" }}>
            <div className="card">
              <h3 className="card-heading">Work Summary</h3>
              <div className="progress-section">
                <div className="progress-header">
                  <span>{profile.summary.completedTasks} of {profile.summary.assignedTasks} assigned tasks completed</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="progress-bar progress-bar-lg">
                  <div className="progress-fill" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
              <div className="overview-metrics">
                <div className="overview-metric">
                  <span className="overview-metric-value">{profile.summary.storyPointsCompleted}</span>
                  <span className="overview-metric-label">Story Points Done</span>
                </div>
                <div className="overview-metric">
                  <span className="overview-metric-value">{profile.summary.storyPointsAssigned}</span>
                  <span className="overview-metric-label">Story Points Assigned</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-heading">Activity</h3>
              <div className="profile-activity-summary">
                <div className="profile-activity-item">
                  <span className="profile-activity-label">Total Actions</span>
                  <span className="profile-activity-value">{profile.summary.totalActions}</span>
                </div>
                <div className="profile-activity-item">
                  <span className="profile-activity-label">Last Activity</span>
                  <span className="profile-activity-value profile-activity-date">
                    {profile.summary.lastActivityAt ? new Date(profile.summary.lastActivityAt).toLocaleString() : "No activity yet"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 className="card-heading">Project Breakdown</h3>
            {profile.projectBreakdown.length === 0 ? (
              <p className="text-muted">No project work yet.</p>
            ) : (
              <div className="project-overview-grid">
                {profile.projectBreakdown.map((project) => {
                  const projectCompletion = project.tasksAssigned > 0
                    ? Math.round((project.tasksCompleted / project.tasksAssigned) * 100)
                    : 0;

                  return (
                    <div key={project.projectId} className="project-overview-card card">
                      <div className="project-overview-header">
                        <h3 className="project-overview-name">{project.projectName}</h3>
                        <span className={`role-badge role-${project.role.toLowerCase()}`}>{project.role}</span>
                      </div>
                      <div className="project-overview-stats">
                        <div className="mini-stat"><span className="mini-stat-value">{project.tasksAssigned}</span><span className="mini-stat-label">Assigned</span></div>
                        <div className="mini-stat"><span className="mini-stat-value">{project.tasksCompleted}</span><span className="mini-stat-label">Done</span></div>
                        <div className="mini-stat"><span className="mini-stat-value">{project.tasksInProgress}</span><span className="mini-stat-label">Active</span></div>
                        <div className="mini-stat"><span className="mini-stat-value">{project.totalActions}</span><span className="mini-stat-label">Actions</span></div>
                      </div>
                      <div className="project-overview-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${projectCompletion}%` }} />
                        </div>
                        <span className="progress-pct">{projectCompletion}% complete</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid-2">
            <div className="card">
              <h3 className="card-heading">Recent Tasks</h3>
              {profile.recentTasks.length === 0 ? (
                <p className="text-muted">No assigned tasks yet.</p>
              ) : (
                <div className="profile-task-list">
                  {profile.recentTasks.map((task) => (
                    <div key={task.id} className="profile-task-row">
                      <div>
                        <p className="profile-task-title">{task.title}</p>
                        <p className="profile-task-project">{task.projectName}</p>
                      </div>
                      <div className="profile-task-right">
                        <span className={`status-badge ${statusClass(task.status)}`}>{labelForStatus(task.status)}</span>
                        <span className="profile-task-time">{new Date(task.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="card-heading">Recent Activity</h3>
              {profile.recentActivity.length === 0 ? (
                <p className="text-muted">No activity logged yet.</p>
              ) : (
                <div className="activity-list">
                  {profile.recentActivity.map((item, index) => (
                    <div key={`${item.entityId}-${index}`} className="activity-row">
                      <div className="activity-dot" />
                      <div className="activity-content">
                        <span>{item.action.toLowerCase().replaceAll("_", " ")} {item.entityType.toLowerCase()} in {item.projectName || "project"}</span>
                        <span className="activity-time">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

function statusClass(status: string) {
  switch (status) {
    case "DONE":
      return "status-completed";
    case "IN_PROGRESS":
      return "status-progress";
    case "BLOCKED":
      return "status-blocked";
    default:
      return "status-todo";
  }
}

function labelForStatus(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}