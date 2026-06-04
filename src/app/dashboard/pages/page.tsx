import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PagesTable } from "@/components/pages-table"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

async function getPages() {
  try {
    const client = await clientPromise
    const db = client.db()
    const pages = await db.collection("pages").find({}).toArray()
    return pages.map(page => ({
      id: Number(page.id),
      header: String(page.header || ""),
      type: String(page.type || ""),
      layout: String(page.layout || ""),
      status: String(page.status || ""),
      target: String(page.target || ""),
      limit: String(page.limit || ""),
      reviewer: String(page.reviewer || ""),
    }))
  } catch (error) {
    console.error("Error fetching pages on server:", error)
    return []
  }
}

export default async function Page() {
  const pages = await getPages()

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
            <h2 className="text-lg font-semibold tracking-tight">Pages Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage static pages like About, Contact, Privacy Policy, and Terms.</p>
          </div>
          <PagesTable data={pages} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

