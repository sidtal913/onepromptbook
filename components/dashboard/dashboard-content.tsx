"use client"

import { useSession } from "next-auth/react"
import { DashboardLayout } from "./dashboard-layout"
import { ProjectsGrid } from "./projects-grid"
import { DashboardStats } from "./dashboard-stats"
import { QuickActions } from "./quick-actions"

export function DashboardContent() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {session.user.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-2">Ready to create some magical stories today?</p>
        </div>

        <DashboardStats />
        <QuickActions />
        <ProjectsGrid />
      </div>
    </DashboardLayout>
  )
}
