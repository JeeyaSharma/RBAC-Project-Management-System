"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { sprintsApi, dashboardApi } from "@/lib/api";

type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: string;
};

type DashboardProject = {
  activeSprint: Sprint | null;
  members: { id: string; name: string; role: string }[];
};

export default function SprintsPage() {
  const { projects, selectedProjectId, setSelectedProjectId } = useAppContext();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create sprint form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSprints = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError("");
    try {
      const res = await dashboardApi.getProjectDashboard(selectedProjectId);
      const data = res.data as DashboardProject & {
        sprints?: Sprint[];
        activeSprint: Sprint | null;
      };
      // Dashboard may not return full sprint list; we parse what's available
      // Use the tasks API to pull sprint data indirectly, or parse from dashboard
      // For now, let's use the project tasks endpoint to extract sprints
      // Actually, dashboard only returns active sprint + basic info
      // We need to collect sprints from the dashboard + any non-active
      // Let me use a different approach - pull all tasks and extract sprint info
      const allSprints: Sprint[] = [];
      if (data.activeSprint) {
        allSprints.push(data.activeSprint);
      }
      // We also need planned/completed sprints - since there's no direct list endpoint
      // Let's look at what dashboard returns more carefully
      if (data.sprints) {
        setSprints(data.sprints);
      } else {
        setSprints(allSprints);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sprints");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError("");
    setSubmitting(true);
    try {
      await sprintsApi.createSprint(selectedProjectId, {
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        goal: goal || undefined,
      });
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setShowCreate(false);
      await fetchSprints();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create sprint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async (sprintId: string) => {
    if (!selectedProjectId) return;
    setActionLoading(sprintId);
    try {
      await sprintsApi.startSprint(selectedProjectId, sprintId);
      await fetchSprints();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start sprint");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (sprintId: string) => {
    if (!selectedProjectId) return;
    setActionLoading(sprintId);
    try {
      await sprintsApi.completeSprint(selectedProjectId, sprintId);
      await fetchSprints();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to complete sprint");
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "status-progress";
      case "COMPLETED": return "status-completed";
      default: return "status-planning";
    }
  };

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="page-title">Sprints</h1>
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create a project first to manage sprints.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sprints</h1>
        <div className="page-header-actions">
          <select
            className="select"
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="button" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "+ New Sprint"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Sprint Form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <form onSubmit={handleCreate} className="create-form">
            <h3 className="card-heading">Create Sprint</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sprint-name">Sprint Name</label>
                <input
                  id="sprint-name"
                  className="input"
                  placeholder="Sprint 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sprint-goal">Goal (optional)</label>
                <input
                  id="sprint-goal"
                  className="input"
                  placeholder="Complete user authentication"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sprint-start">Start Date</label>
                <input
                  id="sprint-start"
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sprint-end">End Date</label>
                <input
                  id="sprint-end"
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Creating..." : "Create Sprint"}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="loading-inline"><div className="spinner" /></div>}

      {/* Sprints List */}
      {!loading && sprints.length === 0 && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
          <h3>No sprints yet</h3>
          <p>Create your first sprint to start planning work.</p>
        </div>
      )}

      <div className="sprint-list">
        {sprints.map((sprint) => (
          <div key={sprint.id} className="card sprint-card">
            <div className="sprint-card-main">
              <div className="sprint-card-left">
                <h3 className="sprint-card-name">{sprint.name}</h3>
                {sprint.goal && <p className="sprint-goal">{sprint.goal}</p>}
                <div className="sprint-dates">
                  <span>{new Date(sprint.start_date).toLocaleDateString()}</span>
                  <span className="date-separator">→</span>
                  <span>{new Date(sprint.end_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="sprint-card-right">
                <span className={`status-badge ${statusColor(sprint.status)}`}>
                  {sprint.status}
                </span>
                <div className="sprint-actions">
                  {sprint.status === "PLANNED" && (
                    <button
                      className="button button-sm"
                      onClick={() => handleStart(sprint.id)}
                      disabled={actionLoading === sprint.id}
                    >
                      {actionLoading === sprint.id ? "..." : "Start"}
                    </button>
                  )}
                  {sprint.status === "ACTIVE" && (
                    <button
                      className="button button-sm secondary"
                      onClick={() => handleComplete(sprint.id)}
                      disabled={actionLoading === sprint.id}
                    >
                      {actionLoading === sprint.id ? "..." : "Complete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
