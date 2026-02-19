"use client"

import { createContext, useContext, useState } from "react"

type Project = {
  id: number
  name: string
  status: string
}

type Task = {
    id: number
    title: string
    status: string
    projectId: number
    sprintId?: number
}

type Sprint = {
    id: number
    name: string
    projectId: number
}

type AppContextType = {
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>

  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>

  sprints: Sprint[]
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: "Agile PM System",status:"Planning"},
    { id: 2, name: "AI Study App",status:"In Progress"},
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {id: 1, title: "Design UI Layout", status:"Todo", projectId: 1, sprintId: 1},
    {id:2, title:"Implement Auth", status:"Done",projectId:2, sprintId: 2}
  ])

  const [sprints, setSprints] = useState<Sprint[]>([
    {id:1, name:"Sprint 1", projectId: 1},
    {id:2, name:"Sprint 2", projectId:1},
    {id:3,name:"Sprint 3", projectId:2}
  ])

  return (
    <AppContext.Provider value={{ projects, setProjects, tasks, setTasks, sprints, setSprints}}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider")
  }
  return context
}
