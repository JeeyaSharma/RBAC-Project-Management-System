"use client"

import { useState } from "react"
import TaskCard from "@/components/TaskCard"
import { useAppContext } from "@/context/AppContext"
import "../globals.css"

export default function Tasks(){
  const {projects, tasks, setTasks, sprints} = useAppContext()
  const [selectedProjectId, setSelectedProjectId] = useState(1)
  const [selectedSprintId, setSelectedSprintId] = useState<number | null> (null)

  const [newTaskTitle, setNewTaskTitle] = useState("")

  const addTask = () => {
    if(!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      status: "Todo",
      projectId: selectedProjectId,
      sprintId: selectedSprintId ?? undefined
    }

    setTasks((prev) => [...prev,newTask])
    setNewTaskTitle("")
  }

  const deleteTask = (id: number) =>{
    setTasks((prev)=>prev.filter((task)=>task.id !== id))
  }

  const cycleStatus = (id: number) => {
    setTasks((prev) => 
      prev.map((task)=>{
        if(task.id !== id) return task

        const nextStatus = 
        task.status === "Todo"
        ? "In Progress"
        : task.status === "In Progress"
        ? "Done"
        : "Todo"

        return {...task, status: nextStatus}
      })
    )
  }

  const sprintTasks = tasks.filter(
    (task) => 
      task.projectId === selectedProjectId &&
      task.sprintId === selectedSprintId
  )

  const completedCount = sprintTasks.filter(
    (task) => task.status == "Done"
  ).length

  const totalCount = sprintTasks.length
  return (
    <div>
      <h1>Tasks</h1>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Select Project:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(Number(e.target.value))}
          className="select"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          Select Sprint:
        </label>

        <select
          value={selectedSprintId ?? ""}
          className="select"
          onChange={(e) =>
            setSelectedSprintId(
              e.target.value ? Number(e.target.value) : null
            )
          }
        >
          <option value="">All</option>
          {sprints
            .filter(
              (sprint) =>
                sprint.projectId === selectedProjectId
            )
            .map((sprint) => (
              <option
                key={sprint.id}
                value={sprint.id}
              >
                {sprint.name}
              </option>
            ))}
        </select>
      </div>

      {/* Add Task */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Enter task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          // style={{ padding: "8px", marginRight: "8px" }}
          className="input"
        />
        <button onClick={addTask} className="button success">
          + Add Task
        </button>
      </div>

      {selectedSprintId && (
        <div style={{ marginBottom: "20px" }}>
          <strong>
            Sprint Progress: {completedCount} / {totalCount}
          </strong>
        </div>
      )}


      {/* Task List */}
      <div style={{ display: "flex", gap: "20px",alignItems: "flex-start" }}>
  
      {["Todo", "In Progress", "Done"].map((column) => (
        <div
          key={column}
          className="column"
          style={{ flex: 1 }}
        >
          <h2 style={{ marginBottom: "16px" }}>{column}</h2>

          <div style={{ display: "grid", gap: "10px" }}>
            {tasks.filter(
              (task) => 
                task.status === column &&
                task.projectId === selectedProjectId &&
                (!selectedSprintId || task.sprintId === selectedSprintId)
            )
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onStatusChange={cycleStatus}
                />
              ))}
          </div>
      </div>
  ))}

</div>

    </div>
  )
}