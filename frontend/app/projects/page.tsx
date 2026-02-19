"use client"

import ProjectCard from "@/components/ProjectCard"
import { useState } from "react"
import { useAppContext } from "@/context/AppContext"
import "../globals.css"

export default function Projects() {
  const {projects,setProjects} = useAppContext();

  const [newProjectName, setNewProjectName] = useState("")

  const addProject = () => {
    if (!newProjectName.trim()) return

    const newProject = {
      id: Date.now(),
      name: newProjectName,
      status: "Planning",
    }

    setProjects((prev) => [...projects, newProject])
    setNewProjectName("")
  }

  const cycleStatus = (id : number) => {
    setProjects((prevProjects) => 
      prevProjects.map((project) => {
        if(project.id !== id) return project

        const nextStatus = 
          project.status === "Planning"
          ? "In Progress"
          : project.status === "In Progress"
          ? "Completed"
          : "Planning"

          return {...project, status: nextStatus};
      })
    )
  }

  const deleteProject = (id: number) => {
    setProjects((prevProjects) => 
      prevProjects.filter((project) => project.id !== id)
    )
  }

  return (
    <div>
      <h1>Projects</h1>

      {/* Add Project Section */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "20px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="input"
        />
        <button className="button success" onClick={addProject}>
          + Add Project
        </button>
      </div>

      {/* Project Cards */}
      <div style={{ display: "grid", gap: "16px" }}>
        {projects.map((project) => (
            <ProjectCard
            key={project.id}
            project={project}
            onDelete={deleteProject}
            onStatusChange={cycleStatus}
            />
        ))}
      </div>
    </div>
  )
}