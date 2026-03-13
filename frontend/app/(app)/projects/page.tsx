"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { projectsApi } from "@/lib/api";

export default function ProjectsPage() {
  const { projects, refreshProjects, setSelectedProjectId } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newMembers, setNewMembers] = useState<Array<{ identifier: string; role: string }>>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // -- Add Member state --
  const [memberModal, setMemberModal] = useState<string | null>(null);
  const [memberIdentifier, setMemberIdentifier] = useState("");
  const [memberRole, setMemberRole] = useState("DEVELOPER");
  const [memberError, setMemberError] = useState("");
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await projectsApi.createProject(name, description || undefined);
      const createdProjectId = (created as { data?: { id?: string } })?.data?.id;

      const membersToAdd = newMembers
        .map((m) => ({ identifier: m.identifier.trim(), role: m.role }))
        .filter((m) => m.identifier.length > 0);

      if (createdProjectId && membersToAdd.length > 0) {
        const results = await Promise.allSettled(
          membersToAdd.map((m) =>
            projectsApi.addMember(createdProjectId, m.identifier, m.role)
          )
        );

        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
          setError(
            `Project created, but ${failed} of ${membersToAdd.length} members failed to add.`
          );
        }
      }

      setName("");
      setDescription("");
      setNewMembers([]);
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
      await projectsApi.addMember(memberModal, memberIdentifier, memberRole);
      setMemberModal(null);
      setMemberIdentifier("");
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

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

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

      {/* Create Project Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => !submitting && setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
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
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label>Add Members (optional)</label>
                  <button
                    type="button"
                    className="button button-xs secondary"
                    onClick={() =>
                      setNewMembers((prev) => [...prev, { identifier: "", role: "DEVELOPER" }])
                    }
                  >
                    + Member
                  </button>
                </div>

                {newMembers.length === 0 && (
                  <p className="text-muted">No members selected. You can add them now or later.</p>
                )}

                <div style={{ display: "grid", gap: 8 }}>
                  {newMembers.map((member, index) => (
                    <div key={index} className="form-row" style={{ alignItems: "center" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          className="input"
                          placeholder="Public ID or email"
                          value={member.identifier}
                          onChange={(e) =>
                            setNewMembers((prev) =>
                              prev.map((m, i) =>
                                i === index ? { ...m, identifier: e.target.value } : m
                              )
                            )
                          }
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0, maxWidth: 180 }}>
                        <select
                          className="select"
                          value={member.role}
                          onChange={(e) =>
                            setNewMembers((prev) =>
                              prev.map((m, i) =>
                                i === index ? { ...m, role: e.target.value } : m
                              )
                            )
                          }
                        >
                          <option value="PROJECT_MANAGER">Project Manager</option>
                          <option value="DEVELOPER">Developer</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="button button-xs secondary"
                        onClick={() =>
                          setNewMembers((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowCreate(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
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
                <label htmlFor="member-id">User Public ID or Email</label>
                <input
                  id="member-id"
                  className="input"
                  placeholder="Enter public ID or email"
                  value={memberIdentifier}
                  onChange={(e) => setMemberIdentifier(e.target.value)}
                  required
                />
                <p className="form-help">Use a short public ID like `USR-ABC1234DEF` or the user&apos;s email.</p>
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
