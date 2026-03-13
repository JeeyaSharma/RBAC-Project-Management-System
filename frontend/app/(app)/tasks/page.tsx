"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { tasksApi } from "@/lib/api";
import { toPublicUserId } from "@/lib/userId";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  story_points: number | null;
  assignee_id: string | null;
  assignee_name?: string;
  assignee_public_id?: string;
  sprint_id: string | null;
  created_at: string;
  updated_at?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const;
const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  BLOCKED: "Blocked",
};
const STATUS_STYLES: Record<string, string> = {
  TODO: "status-todo",
  IN_PROGRESS: "status-progress",
  DONE: "status-completed",
  BLOCKED: "status-blocked",
};

export default function TasksPage() {
  const { projects, selectedProjectId, setSelectedProjectId } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // Create task form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [assigneeIdentifier, setAssigneeIdentifier] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Task details modal
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError("");
    try {
      const res = await tasksApi.getProjectTasks(selectedProjectId, {
        page,
        limit: 50,
        status: filterStatus || undefined,
      });
      const data = res as { data: Task[]; pagination: Pagination };
      setTasks(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, page, filterStatus]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [selectedProjectId, filterStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError("");
    setSubmitting(true);
    try {
      await tasksApi.createTask(selectedProjectId, {
        title,
        description: description || undefined,
        storyPoints: storyPoints ? parseInt(storyPoints) : undefined,
        assigneeIdentifier: assigneeIdentifier || undefined,
        sprintId: sprintId || undefined,
      });
      setTitle("");
      setDescription("");
      setStoryPoints("");
      setAssigneeIdentifier("");
      setSprintId("");
      setShowCreate(false);
      await fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!selectedProjectId) return;
    setStatusLoading(taskId);
    try {
      await tasksApi.updateTaskStatus(selectedProjectId, taskId, newStatus);
      await fetchTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusLoading(null);
    }
  };

  const openTaskDetails = async (taskId: string) => {
    setDetailLoading(true);
    setError("");
    try {
      const res = await tasksApi.getTaskById(taskId);
      const payload = res as { data?: { task?: Task } | Task };
      const task = (payload.data && "task" in payload.data ? payload.data.task : payload.data) as Task | undefined;
      if (!task) {
        throw new Error("Task details not found");
      }
      setDetailTask(task);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load task details");
      setDetailTask(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const getNextStatuses = (current: string): string[] => {
    switch (current) {
      case "TODO": return ["IN_PROGRESS"];
      case "IN_PROGRESS": return ["DONE", "BLOCKED"];
      case "BLOCKED": return ["IN_PROGRESS"];
      case "DONE": return [];
      default: return [];
    }
  };

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="page-title">Tasks</h1>
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create a project first to manage tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <div className="page-header-actions task-header-actions">
          <select
            className="select task-control"
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            className="select task-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_COLUMNS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "board" ? "toggle-active" : ""}`}
              onClick={() => setViewMode("board")}
              title="Board view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </button>
            <button
              className={`toggle-btn ${viewMode === "list" ? "toggle-active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
          <button className="button" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "+ New Task"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && <div className="loading-inline"><div className="spinner" /></div>}

      {/* Board View */}
      {!loading && viewMode === "board" && (
        <div className="kanban-board">
          {STATUS_COLUMNS.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header">
                  <span className={`status-dot ${STATUS_STYLES[status]}`} />
                  <h3>{STATUS_LABELS[status]}</h3>
                  <span className="kanban-count">{columnTasks.length}</span>
                </div>
                <div className="kanban-cards">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onViewDetails={openTaskDetails}
                      onStatusChange={handleStatusChange}
                      getNextStatuses={getNextStatuses}
                      statusLoading={statusLoading}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="kanban-empty">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && (
        <div className="task-list">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Create a task to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Story Points</th>
                    <th>Assignee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <span className="task-title-cell">{task.title}</span>
                        {task.description && (
                          <span className="task-desc-cell">{task.description}</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_STYLES[task.status]}`}>
                          {STATUS_LABELS[task.status]}
                        </span>
                      </td>
                      <td>{task.story_points || "—"}</td>
                      <td>{task.assignee_name || task.assignee_public_id || "Unassigned"}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="button button-xs secondary"
                            onClick={() => openTaskDetails(task.id)}
                          >
                            View Details
                          </button>
                          {getNextStatuses(task.status).map((ns) => (
                            <button
                              key={ns}
                              className="button button-xs"
                              onClick={() => handleStatusChange(task.id, ns)}
                              disabled={statusLoading === task.id}
                            >
                              → {STATUS_LABELS[ns]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="button button-sm secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="button button-sm secondary"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {detailTask && (
        <div className="modal-overlay" onClick={() => !detailLoading && setDetailTask(null)}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="card-heading">Task Details</h3>

            {detailLoading ? (
              <div className="loading-inline"><div className="spinner" /></div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                <div>
                  <p className="text-muted">Title</p>
                  <p>{detailTask.title}</p>
                </div>
                <div>
                  <p className="text-muted">Description</p>
                  <p>{detailTask.description || "No description"}</p>
                </div>
                <div className="form-row">
                  <div>
                    <p className="text-muted">Status</p>
                    <span className={`status-badge ${STATUS_STYLES[detailTask.status] || "status-todo"}`}>
                      {STATUS_LABELS[detailTask.status] || detailTask.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted">Story Points</p>
                    <p>{detailTask.story_points ?? "-"}</p>
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <p className="text-muted">Assignee</p>
                    <p>
                      {detailTask.assignee_name || detailTask.assignee_public_id || toPublicUserId(detailTask.assignee_id) || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Sprint</p>
                    <p>{detailTask.sprint_id || "Backlog"}</p>
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <p className="text-muted">Created</p>
                    <p>{detailTask.created_at ? new Date(detailTask.created_at).toLocaleString() : "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Last Updated</p>
                    <p>{detailTask.updated_at ? new Date(detailTask.updated_at).toLocaleString() : "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted">Task ID</p>
                  <p style={{ fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>{detailTask.id}</p>
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="button" className="button secondary" onClick={() => setDetailTask(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => !submitting && setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreate} className="create-form">
              <h3 className="card-heading">Create Task</h3>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="task-title">Title</label>
                  <input
                    id="task-title"
                    className="input"
                    placeholder="Implement user login"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="task-points">Story Points</label>
                  <input
                    id="task-points"
                    type="number"
                    className="input"
                    placeholder="5"
                    min={1}
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="task-desc">Description (optional)</label>
                <textarea
                  id="task-desc"
                  className="input textarea"
                  placeholder="Describe the task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="task-assignee">Assignee (Public ID or email)</label>
                  <input
                    id="task-assignee"
                    className="input"
                    placeholder="USR-XXXXXXXXXX or email"
                    value={assigneeIdentifier}
                    onChange={(e) => setAssigneeIdentifier(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="task-sprint">Sprint ID (optional)</label>
                  <input
                    id="task-sprint"
                    className="input"
                    placeholder="Sprint UUID"
                    value={sprintId}
                    onChange={(e) => setSprintId(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowCreate(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onViewDetails,
  onStatusChange,
  getNextStatuses,
  statusLoading,
}: {
  task: { id: string; title: string; description: string | null; status: string; story_points: number | null; assignee_name?: string; assignee_public_id?: string; assignee_id?: string | null };
  onViewDetails: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  getNextStatuses: (status: string) => string[];
  statusLoading: string | null;
}) {
  const nextStatuses = getNextStatuses(task.status);

  return (
    <div className="kanban-card">
      <h4 className="kanban-card-title">{task.title}</h4>
      {task.description && (
        <p className="kanban-card-desc">{task.description}</p>
      )}
      <div className="kanban-card-footer">
        {task.story_points && (
          <span className="story-points">{task.story_points} pts</span>
        )}
        {(task.assignee_name || task.assignee_public_id || task.assignee_id) && (
          <span className="assignee-tag">{task.assignee_name || task.assignee_public_id || toPublicUserId(task.assignee_id)}</span>
        )}
      </div>
      <div className="kanban-card-actions" style={{ marginBottom: nextStatuses.length > 0 ? 8 : 0 }}>
        <button
          className="button button-xs secondary"
          onClick={() => onViewDetails(task.id)}
        >
          View Details
        </button>
      </div>
      {nextStatuses.length > 0 && (
        <div className="kanban-card-actions">
          {nextStatuses.map((ns) => (
            <button
              key={ns}
              className="button button-xs"
              onClick={() => onStatusChange(task.id, ns)}
              disabled={statusLoading === task.id}
            >
              → {STATUS_LABELS[ns]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
