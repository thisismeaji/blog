import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UsersTable } from "@/components/users-table"

export default function Page() {
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
        <div className="flex flex-1 flex-col gap-4 py-4">
          <div className="px-4 lg:px-6">
            <h2 className="text-lg font-semibold tracking-tight">User Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage user roles, authorizations, and administrative permissions.</p>
          </div>
          <UsersTable data={[]} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
