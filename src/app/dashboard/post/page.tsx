import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DataTable } from "@/components/data-table"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

async function getPostData() {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db.collection("posts").find({}).toArray()
    const categories = await db.collection("categories").find({}).toArray()
    return {
      posts: posts.map(p => ({
        id: Number(p.id),
        header: String(p.header || ""),
        type: String(p.type || ""),
        status: String(p.status || ""),
        target: String(p.target || ""),
        limit: String(p.limit || ""),
        reviewer: String(p.reviewer || ""),
        uploadedImage: p.uploadedImage ? String(p.uploadedImage) : undefined,
      })),
      categories: categories.map(c => ({
        id: Number(c.id),
        header: String(c.header || ""),
        type: String(c.type || ""),
        status: String(c.status || ""),
        target: String(c.target || ""),
        limit: String(c.limit || ""),
        reviewer: String(c.reviewer || ""),
        level: c.level ? String(c.level) : undefined,
      })),
    }
  } catch (error) {
    console.error("Error fetching post data on server:", error)
    return { posts: [], categories: [] }
  }
}

export default async function Page() {
  const { posts, categories } = await getPostData()

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
            <h2 className="text-lg font-semibold tracking-tight">Post Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage all post content, edit drafts, and write new articles.</p>
          </div>
          <DataTable data={posts} categories={categories} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

