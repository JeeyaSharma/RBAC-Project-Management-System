"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { projectsApi } from "@/lib/api";

export default function ProjectsPage() {
  const { projects, refreshProjects, setSelectedProjectId } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // -- Add Member state --
  const [memberModal, setMemberModal] = useState<string | null>(null);
  const [memberId, setMemberId] = useState("");
  const [memberRole, setMemberRole] = useState("DEVELOPER");
  const [memberError, setMemberError] = useState("");
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await projectsApi.createProject(name, description || undefined);
      setName("");
      setDescription("");
      setShowCreate(false);
      await refreshProjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberModal) return;
    setMemberError("");
    setMemberSubmitting(true);
    try {
      await projectsApi.addMember(memberModal, memberId, memberRole);
      setMemberModal(null);
      setMemberId("");
      setMemberRole("DEVELOPER");
      await refreshProjects();
    } catch (err: unknown) {
      setMemberError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setMemberSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="button" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {/* Create project form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <form onSubmit={handleCreate} className="create-form">
            <h3 className="card-heading">Create New Project</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="proj-name">Project Name</label>
              <input
                id="proj-name"
                className="input"
                placeholder="My Awesome Project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="proj-desc">Description (optional)</label>
              <textarea
                id="proj-desc"
                className="input textarea"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No projects yet</h3>
          <p>Create your first project to get started.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card card">
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
              <div className="project-actions">
                <button
                  className="button button-sm"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    window.location.href = `/projects/${project.id}`;
                  }}
                >
                  Open Dashboard
                </button>
                {(project.role === "OWNER" || project.role === "PROJECT_MANAGER") && (
                  <button
                    className="button button-sm secondary"
                    onClick={() => setMemberModal(project.id)}
                  >
                    + Member
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {memberModal && (
        <div className="modal-overlay" onClick={() => setMemberModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="card-heading">Add Team Member</h3>
            {memberError && <div className="alert alert-error">{memberError}</div>}
            <form onSubmit={handleAddMember} className="create-form">
              <div className="form-group">
                <label htmlFor="member-id">User ID</label>
                <input
                  id="member-id"
                  className="input"
                  placeholder="Enter user UUID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="member-role">Role</label>
                <select
                  id="member-role"
                  className="select"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                >
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setMemberModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="button" disabled={memberSubmitting}>
                  {memberSubmitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
