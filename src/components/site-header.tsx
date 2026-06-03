"use client"

import * as React from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"

// Map of URL path segments to readable Indonesian/English display labels
const routeMap: Record<string, string> = {
  dashboard: "Dashboard",
  post: "Post",
  category: "Category",
  comments: "Comments",
  analytic: "Analytic",
  users: "Pengguna",
  pages: "Halaman",
  "add-post": "Add Post",
}

export function SiteHeader() {
  const pathname = usePathname() || "/dashboard"
  const segments = pathname.split("/").filter(Boolean) // e.g. ["dashboard", "post"]

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          
          <Breadcrumb>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const label = routeMap[segment] || segment.replace(/-/g, " ")
                const isLast = index === segments.length - 1
                
                if (index === 0) {
                  // First segment (dashboard)
                  if (isLast) {
                    return (
                      <BreadcrumbItem key={segment}>
                        <BreadcrumbPage className="capitalize font-medium text-foreground">{label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )
                  } else {
                    return (
                      <React.Fragment key={segment}>
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link href="/dashboard" className="capitalize">{label}</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </React.Fragment>
                    )
                  }
                }

                // Subsegments (e.g. post, category)
                return (
                  <React.Fragment key={segment}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      <BreadcrumbPage className="capitalize font-medium text-foreground">{label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
