import "../app/globals.css"


type Project = {
  id: number
  name: string
  status: string
}

type Props = {
  project: Project
  onDelete: (id: number) => void
  onStatusChange: (id: number) => void
}

export default function ProjectCard({ project, onDelete, onStatusChange }: Props) {
  return (
    <div className="card">
      <div className="card-content">
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
          {project.name}
        </h3>
        <p>
          <span className="status-label">Status:</span>{" "}
          <span 
            style={{
              fontWeight: 600,
              color:
                project.status === "Completed"
                  ? "green"
                  : project.status === "In Progress"
                  ? "orange"
                  : "red",
            }}
          >
            {project.status}
          </span>
        </p>
      </div>

      {/* <div style={{ display: "flex", gap: "8px" }}> */}
      <div className="card-actions">
        <button
          onClick={() => onStatusChange(project.id)}
          className="button">
          Next Status
        </button>

        <button
          onClick={() => onDelete(project.id)}
          className="button danger"
        >
          Delete
        </button>
      </div>
    </div>
  )
}