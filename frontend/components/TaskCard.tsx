type Task = {
    id: number
    title: string
    status: string
}

type Props = {
    task: Task,
    onDelete : (id: number) => void
    onStatusChange: (id: number) => void
}

export default function TaskCard({
    task,
    onDelete,
    onStatusChange,
}: Props){
    return (
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="card-content">
            <strong style={{ fontSize: "16px", color: "#111827" }}>
                {task.title}
            </strong>
            <p>
                <span className="status-label">Status:</span>{" "}
                <span
                    style={{
                    color:
                        task.status === "Done"
                        ? "green"
                        : task.status === "In Progress"
                        ? "orange"
                        : "red",
                    }}
                >
                    {task.status}
                </span>
            </p>
        </div>

        <div className="card-actions">
            <button onClick={() => onStatusChange(task.id)} className="button">
            Next
            </button>
            <button onClick={() => onDelete(task.id)} className="button danger">
            Delete
            </button>
        </div>
        </div>
    )
}