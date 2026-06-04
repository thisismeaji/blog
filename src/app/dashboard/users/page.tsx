import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UsersTable } from "@/components/users-table"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

async function getUsers() {
  try {
    const client = await clientPromise
    const db = client.db()
    const users = await db.collection("users").find({}).toArray()
    return users.map(user => ({
      id: user.id,
      header: user.header,
      type: user.type,
      role: user.role,
      status: user.status,
      target: user.target,
      limit: user.limit,
      reviewer: user.reviewer,
    }))
  } catch (error) {
    console.error("Error fetching users on server:", error)
    return []
  }
}

export default async function Page() {
  const users = await getUsers()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 py-4 min-w-0">
          <div className="px-4 lg:px-6">
            <h2 className="text-lg font-semibold tracking-tight">User Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage user roles, authorizations, and administrative permissions.</p>
          </div>
          <UsersTable data={users} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

