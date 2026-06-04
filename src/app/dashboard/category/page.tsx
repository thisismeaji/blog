import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CategoryTable } from "@/components/category-table"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

async function getCategories() {
  try {
    const client = await clientPromise
    const db = client.db()
    const categories = await db.collection("categories").find({}).toArray()
    return categories.map(cat => ({
      id: cat.id,
      header: cat.header,
      type: cat.type,
      status: cat.status,
      target: cat.target,
      limit: cat.limit,
      reviewer: cat.reviewer,
      level: cat.level,
    }))
  } catch (error) {
    console.error("Error fetching categories on server:", error)
    return []
  }
}

export default async function Page() {
  const categories = await getCategories()

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
            <h2 className="text-lg font-semibold tracking-tight">Category Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Organize and manage article categories for classification.</p>
          </div>
          <CategoryTable data={categories} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

