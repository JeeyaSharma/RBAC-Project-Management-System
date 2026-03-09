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

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  story_points: number | null;
  assignee_name?: string;
};

type Props = {
  task: Task;
  onStatusChange?: (id: string, newStatus: string) => void;
  nextStatuses?: string[];
  loading?: boolean;
};

export default function TaskCard({ task, onStatusChange, nextStatuses = [], loading }: Props) {
  return (
    <div className="kanban-card">
      <h4 className="kanban-card-title">{task.title}</h4>
      {task.description && (
        <p className="kanban-card-desc">{task.description}</p>
      )}
      <div className="kanban-card-footer">
        <span className={`status-badge ${STATUS_STYLES[task.status] || ""}`}>
          {STATUS_LABELS[task.status] || task.status}
        </span>
        {task.story_points && (
          <span className="story-points">{task.story_points} pts</span>
        )}
        {task.assignee_name && (
          <span className="assignee-tag">{task.assignee_name}</span>
        )}
      </div>
      {onStatusChange && nextStatuses.length > 0 && (
        <div className="kanban-card-actions">
          {nextStatuses.map((ns) => (
            <button
              key={ns}
              className="button button-xs"
              onClick={() => onStatusChange(task.id, ns)}
              disabled={loading}
            >
              → {STATUS_LABELS[ns] || ns}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}