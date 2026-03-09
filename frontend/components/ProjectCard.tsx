type Project = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  created_at: string;
};

type Props = {
  project: Project;
  onSelect: (id: string) => void;
};

export default function ProjectCard({ project, onSelect }: Props) {
  return (
    <div className="project-card card" onClick={() => onSelect(project.id)} style={{ cursor: "pointer" }}>
      <div className="project-card-header">
        <h3 className="project-name">{project.name}</h3>
        <span className={`role-badge role-${project.role?.toLowerCase()}`}>
          {project.role}
        </span>
      </div>
      {project.description && (
        <p className="project-desc">{project.description}</p>
      )}
      <div className="project-meta">
        <span className="text-muted">
          Created {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}