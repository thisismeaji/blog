"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  FileTextIcon,
  FolderIcon,
  MessageSquareIcon,
  ChartBarIcon,
  UsersIcon,
  FileIcon,
  CommandIcon,
  Settings2Icon,
  SearchIcon,
  CircleHelpIcon,
  LayoutDashboardIcon,
} from "lucide-react"
import { SearchDialog } from "@/components/search-dialog"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="size-4" />,
    },
    {
      title: "Post",
      url: "/dashboard/post",
      icon: <FileTextIcon className="size-4" />,
    },
    {
      title: "Category",
      url: "/dashboard/category",
      icon: <FolderIcon className="size-4" />,
    },
    {
      title: "Comments",
      url: "/dashboard/comments",
      icon: <MessageSquareIcon className="size-4" />,
    },
    {
      title: "Analytic",
      url: "/dashboard/analytic",
      icon: <ChartBarIcon className="size-4" />,
    },
    {
      title: "Pengguna",
      url: "/dashboard/users",
      icon: <UsersIcon className="size-4" />,
    },
    {
      title: "Halaman",
      url: "/dashboard/pages",
      icon: <FileIcon className="size-4" />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon className="size-4" />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon className="size-4" />,
    },
    {
      title: "Search",
      url: "#search",
      icon: <SearchIcon className="size-4" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()

  const sidebarUser = React.useMemo(() => {
    if (session?.user) {
      return {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
      }
    }
    return {
      name: "shadcn",
      email: "m@example.com",
      avatar: "",
    }
  }, [session])

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <a href="#">
                  <CommandIcon className="size-5!" />
                  <span className="text-base font-semibold">Blog CMS</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={sidebarUser} isLoading={status === "loading"} />
        </SidebarFooter>
      </Sidebar>
      <SearchDialog />
    </>
  )
}
