"use client"

import { useState } from "react"
import { useAppContext } from "@/context/AppContext"

export default function Sprints(){
    const {projects, sprints, setSprints} = useAppContext()
    const [selectedProjectId, setSelectedProjectId] = useState(1)
    const [newSprintName, setNewSprintName] = useState("")

    const addSprint = () => {
        if(!newSprintName) return;

        const newSprint = {
            id: Date.now(),
            name: newSprintName,
            projectId: selectedProjectId
        }

        setSprints((prev) => [...prev, newSprint])
        setNewSprintName("")
    }

    const deleteSprint = (id: number) => {
        setSprints((prev) => 
            prev.filter((sprint) => sprint.id !== id)
        )
    }

    return (
        <div>
      <h1>Sprints</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          Select Project:
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) =>
            setSelectedProjectId(Number(e.target.value))
          }
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter sprint name"
          value={newSprintName}
          onChange={(e) =>
            setNewSprintName(e.target.value)
          }
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button onClick={addSprint}>
          Add Sprint
        </button>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {sprints
          .filter(
            (sprint) =>
              sprint.projectId === selectedProjectId
          )
          .map((sprint) => (
            <div
              key={sprint.id}
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{sprint.name}</span>
              <button
                onClick={() =>
                  deleteSprint(sprint.id)
                }
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
    )
}