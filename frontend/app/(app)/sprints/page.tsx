"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { analyticsApi, sprintsApi, tasksApi } from "@/lib/api";

type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: string;
};

type TaskLite = {
  id: string;
  title: string;
  status: string;
  story_points?: number | null;
  sprint_id?: string | null;
  sprintId?: string | null;
  assignee_name?: string | null;
  assignee_public_id?: string | null;
};

type SprintAnalytics = {
  sprintId: string;
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    completionPercentage: number;
    totalStoryPoints: number;
    completedStoryPoints: number;
  };
  userContribution: Array<{
    userId: string;
    publicUserId?: string;
    userName?: string;
    completedTasks: number;
    completedStoryPoints: number;
  }>;
};

const MAX_TASK_GOAL = "Complete maximum tasks in this sprint";
const TASK_PAGE_LIMIT = 100;

function getTaskSprintId(task: TaskLite): string | null {
  return task.sprint_id ?? task.sprintId ?? null;
}

export default function SprintsPage() {
  const { projects, selectedProjectId, setSelectedProjectId } = useAppContext();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create sprint form
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [maximizeGoal, setMaximizeGoal] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create sprint modal task picker
  const [createCandidateTasks, setCreateCandidateTasks] = useState<TaskLite[]>([]);
  const [createSelectedTaskIds, setCreateSelectedTaskIds] = useState<string[]>([]);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);

  // Add tasks to sprint
  const [taskModalSprint, setTaskModalSprint] = useState<Sprint | null>(null);
  const [candidateTasks, setCandidateTasks] = useState<TaskLite[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Sprint details + analytics
  const [detailSprint, setDetailSprint] = useState<Sprint | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTasks, setDetailTasks] = useState<TaskLite[]>([]);
  const [detailAnalytics, setDetailAnalytics] = useState<SprintAnalytics | null>(null);

  const fetchSprints = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError("");
    try {
      const res = await sprintsApi.getProjectSprints(selectedProjectId);
      const data = res.data as Sprint[];
      setSprints(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sprints");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const loadBacklogTasks = useCallback(async (): Promise<TaskLite[]> => {
    if (!selectedProjectId) return [];

    const allTasks: TaskLite[] = [];
    let page = 1;

    while (true) {
      const res = await tasksApi.getProjectTasks(selectedProjectId, {
        page,
        limit: TASK_PAGE_LIMIT,
      });

      const payload = res as {
        data: TaskLite[];
        pagination?: { page?: number; totalPages?: number };
      };
      const tasks = Array.isArray(payload.data) ? payload.data : [];
      allTasks.push(...tasks);

      const currentPage = payload.pagination?.page ?? page;
      const totalPages = payload.pagination?.totalPages ?? currentPage;
      if (currentPage >= totalPages || tasks.length === 0) {
        break;
      }
      page += 1;
    }

    return allTasks.filter((task) => !getTaskSprintId(task));
  }, [selectedProjectId]);

  const openCreateModal = async () => {
    if (!selectedProjectId) return;
    setShowCreate(true);
    setCreateSelectedTaskIds([]);
    setCreateTaskLoading(true);
    setError("");

    try {
      const backlogTasks = await loadBacklogTasks();
      setCreateCandidateTasks(backlogTasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load backlog tasks");
      setShowCreate(false);
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await sprintsApi.createSprint(selectedProjectId, {
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        goal: maximizeGoal ? MAX_TASK_GOAL : goal || undefined,
      });

      const payload = res as { data?: { id?: string } };
      const createdSprintId = payload.data?.id;

      if (createdSprintId && createSelectedTaskIds.length > 0) {
        const updates = await Promise.allSettled(
          createSelectedTaskIds.map((taskId) =>
            tasksApi.updateTask(selectedProjectId, taskId, { sprintId: createdSprintId })
          )
        );

        const failed = updates.filter((u) => u.status === "rejected");
        if (failed.length > 0) {
          setError(`Sprint created, but ${failed.length} of ${createSelectedTaskIds.length} selected tasks failed to attach.`);
        }
      }

      setName("");
      setGoal("");
      setMaximizeGoal(true);
      setStartDate("");
      setEndDate("");
      setCreateCandidateTasks([]);
      setCreateSelectedTaskIds([]);
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

  const openTaskModal = async (sprint: Sprint) => {
    if (!selectedProjectId) return;

    setTaskModalSprint(sprint);
    setSelectedTaskIds([]);
    setTaskLoading(true);
    setError("");

    try {
      const backlogTasks = await loadBacklogTasks();
      setCandidateTasks(backlogTasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load project tasks");
      setTaskModalSprint(null);
    } finally {
      setTaskLoading(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleCreateTaskSelection = (taskId: string) => {
    setCreateSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleAssignTasksToSprint = async () => {
    if (!selectedProjectId || !taskModalSprint || selectedTaskIds.length === 0) return;

    setTaskSubmitting(true);
    setError("");

    try {
      const updates = await Promise.allSettled(
        selectedTaskIds.map((taskId) =>
          tasksApi.updateTask(selectedProjectId, taskId, { sprintId: taskModalSprint.id })
        )
      );

      const failed = updates.filter((u) => u.status === "rejected");
      if (failed.length > 0) {
        setError(`Assigned ${selectedTaskIds.length - failed.length} tasks, but ${failed.length} failed.`);
      }

      setTaskModalSprint(null);
      setSelectedTaskIds([]);
      await fetchSprints();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to assign tasks to sprint");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const openSprintDetails = async (sprint: Sprint) => {
    if (!selectedProjectId) return;

    setDetailSprint(sprint);
    setDetailLoading(true);
    setError("");

    try {
      const [analyticsRes, sprintTasksRes] = await Promise.all([
        analyticsApi.getSprintAnalytics(selectedProjectId, sprint.id),
        (async () => {
          const allTasks: TaskLite[] = [];
          let page = 1;

          while (true) {
            const res = await tasksApi.getSprintTasks(selectedProjectId, sprint.id, {
              page,
              limit: TASK_PAGE_LIMIT,
            });

            const payload = res as {
              data: TaskLite[];
              pagination?: { page?: number; totalPages?: number };
            };

            const tasks = Array.isArray(payload.data) ? payload.data : [];
            allTasks.push(...tasks);

            const currentPage = payload.pagination?.page ?? page;
            const totalPages = payload.pagination?.totalPages ?? currentPage;
            if (currentPage >= totalPages || tasks.length === 0) {
              break;
            }
            page += 1;
          }

          return allTasks;
        })(),
      ]);

      const analyticsPayload = analyticsRes as { data: SprintAnalytics };
      setDetailAnalytics(analyticsPayload.data || null);
      setDetailTasks(sprintTasksRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sprint details");
      setDetailSprint(null);
      setDetailAnalytics(null);
      setDetailTasks([]);
    } finally {
      setDetailLoading(false);
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
          <button
            className="button"
            onClick={() => {
              if (showCreate) {
                setShowCreate(false);
                return;
              }
              void openCreateModal();
            }}
          >
            {showCreate ? "Cancel" : "+ New Sprint"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

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
                  <button
                    className="button button-sm secondary"
                    onClick={() => openSprintDetails(sprint)}
                  >
                    View Details
                  </button>
                  {sprint.status !== "COMPLETED" && (
                    <button
                      className="button button-sm secondary"
                      onClick={() => openTaskModal(sprint)}
                    >
                      + Add Tasks
                    </button>
                  )}
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

      {/* Add tasks modal */}
      {taskModalSprint && (
        <div className="modal-overlay" onClick={() => !taskSubmitting && setTaskModalSprint(null)}>
          <div className="modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="card-heading">Add Tasks to {taskModalSprint.name}</h3>
            <p className="text-muted" style={{ marginBottom: 12 }}>
              Goal: {taskModalSprint.goal || MAX_TASK_GOAL}
            </p>

            {taskLoading ? (
              <div className="loading-inline"><div className="spinner" /></div>
            ) : candidateTasks.length === 0 ? (
              <p className="text-muted">No unassigned backlog tasks available.</p>
            ) : (
              <div className="table-wrapper" style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}></th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateTasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                          />
                        </td>
                        <td>{task.title}</td>
                        <td>
                          <span className={`status-badge ${
                            task.status === "DONE"
                              ? "status-completed"
                              : task.status === "IN_PROGRESS"
                              ? "status-progress"
                              : task.status === "BLOCKED"
                              ? "status-blocked"
                              : "status-todo"
                          }`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td>{task.story_points || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setTaskModalSprint(null)}
                disabled={taskSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button"
                onClick={handleAssignTasksToSprint}
                disabled={taskSubmitting || selectedTaskIds.length === 0 || taskLoading}
              >
                {taskSubmitting ? "Adding..." : `Add ${selectedTaskIds.length} Task${selectedTaskIds.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sprint details modal */}
      {detailSprint && (
        <div className="modal-overlay" onClick={() => !detailLoading && setDetailSprint(null)}>
          <div className="modal" style={{ maxWidth: 980 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="card-heading">{detailSprint.name} - Sprint Insights</h3>
            <p className="text-muted" style={{ marginBottom: 14 }}>
              {new Date(detailSprint.start_date).toLocaleDateString()} to {new Date(detailSprint.end_date).toLocaleDateString()} | Status: {detailSprint.status}
            </p>

            {detailLoading ? (
              <div className="loading-inline"><div className="spinner" /></div>
            ) : (
              <>
                {detailAnalytics && (
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div className="form-row" style={{ gap: 12 }}>
                      <div className="metric-card" style={{ flex: 1 }}>
                        <p className="metric-label">Total Tasks</p>
                        <p className="metric-value">{detailAnalytics.summary.totalTasks}</p>
                      </div>
                      <div className="metric-card" style={{ flex: 1 }}>
                        <p className="metric-label">Done</p>
                        <p className="metric-value">{detailAnalytics.summary.completedTasks}</p>
                      </div>
                      <div className="metric-card" style={{ flex: 1 }}>
                        <p className="metric-label">In Progress</p>
                        <p className="metric-value">{detailAnalytics.summary.inProgressTasks}</p>
                      </div>
                      <div className="metric-card" style={{ flex: 1 }}>
                        <p className="metric-label">Blocked</p>
                        <p className="metric-value">{detailAnalytics.summary.blockedTasks}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <p className="text-muted" style={{ marginBottom: 6 }}>
                        Completion: {detailAnalytics.summary.completionPercentage}% ({detailAnalytics.summary.completedStoryPoints}/{detailAnalytics.summary.totalStoryPoints} story points)
                      </p>
                      <div style={{ width: "100%", height: 10, background: "#e5e7eb", borderRadius: 999 }}>
                        <div
                          style={{
                            width: `${Math.max(0, Math.min(100, detailAnalytics.summary.completionPercentage))}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, #22c55e, #16a34a)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <h4 className="card-heading" style={{ marginBottom: 8 }}>Sprint Tasks</h4>
                {detailTasks.length === 0 ? (
                  <p className="text-muted">No tasks are currently part of this sprint.</p>
                ) : (
                  <div className="table-wrapper" style={{ maxHeight: 320, overflowY: "auto" }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Status</th>
                          <th>Points</th>
                          <th>Assignee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailTasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.title}</td>
                            <td>
                              <span className={`status-badge ${
                                task.status === "DONE"
                                  ? "status-completed"
                                  : task.status === "IN_PROGRESS"
                                  ? "status-progress"
                                  : task.status === "BLOCKED"
                                  ? "status-blocked"
                                  : "status-todo"
                              }`}>
                                {task.status.replace("_", " ")}
                              </span>
                            </td>
                            <td>{task.story_points || "-"}</td>
                            <td>
                              {task.assignee_name || "Unassigned"}
                              {task.assignee_public_id ? ` (${task.assignee_public_id})` : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {detailAnalytics && detailAnalytics.userContribution.length > 0 && (
                  <>
                    <h4 className="card-heading" style={{ marginTop: 14, marginBottom: 8 }}>Contributor Performance</h4>
                    <div className="table-wrapper" style={{ maxHeight: 220, overflowY: "auto" }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Completed Tasks</th>
                            <th>Completed Story Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailAnalytics.userContribution.map((member) => (
                            <tr key={member.userId}>
                              <td>
                                {member.userName || member.publicUserId || member.userId}
                                {member.publicUserId ? ` (${member.publicUserId})` : ""}
                              </td>
                              <td>{member.completedTasks}</td>
                              <td>{member.completedStoryPoints}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="button" className="button secondary" onClick={() => setDetailSprint(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create sprint modal */}
      {showCreate && (
        <div
          className="modal-overlay"
          onClick={() => !submitting && !createTaskLoading && setShowCreate(false)}
        >
          <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
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
                    disabled={maximizeGoal}
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={maximizeGoal}
                      onChange={(e) => setMaximizeGoal(e.target.checked)}
                    />
                    Set sprint goal to "{MAX_TASK_GOAL}"
                  </label>
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

              <div>
                <h4 className="card-heading" style={{ marginBottom: 8 }}>Add Backlog Tasks (optional)</h4>
                {createTaskLoading ? (
                  <div className="loading-inline"><div className="spinner" /></div>
                ) : createCandidateTasks.length === 0 ? (
                  <p className="text-muted">No unassigned backlog tasks available.</p>
                ) : (
                  <div className="table-wrapper" style={{ maxHeight: 280, overflowY: "auto" }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th>Task</th>
                          <th>Status</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {createCandidateTasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={createSelectedTaskIds.includes(task.id)}
                                onChange={() => toggleCreateTaskSelection(task.id)}
                              />
                            </td>
                            <td>{task.title}</td>
                            <td>
                              <span className={`status-badge ${
                                task.status === "DONE"
                                  ? "status-completed"
                                  : task.status === "IN_PROGRESS"
                                  ? "status-progress"
                                  : task.status === "BLOCKED"
                                  ? "status-blocked"
                                  : "status-todo"
                              }`}>
                                {task.status.replace("_", " ")}
                              </span>
                            </td>
                            <td>{task.story_points || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowCreate(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={submitting}>
                  {submitting
                    ? "Creating..."
                    : `Create Sprint${createSelectedTaskIds.length > 0 ? ` + ${createSelectedTaskIds.length} Task${createSelectedTaskIds.length === 1 ? "" : "s"}` : ""}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
