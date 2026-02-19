"use client"

import { AppProvider } from "@/context/AppContext"
import Link from "next/link"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body>
        <AppProvider>
        <div className="app-container">
          
          {/* Sidebar */}
          <aside className="sidebar">
            <h2>PM Tool</h2>
            <nav>
              <Link href="/dashboard" style={{ color: "white" }}>
                Dashboard
              </Link>
              <Link href="/projects" style={{ color: "white" }}>
                Projects
              </Link>
              <Link href="/sprints" style={{color: "white"}}>
                Sprints
              </Link>
              <Link href="/tasks" style={{ color: "white" }}>
                Tasks
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>

        </div>
        </AppProvider>
      </body>
    </html>
  )
}