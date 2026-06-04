"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  TrendingUp,
  MessageSquare,
  Plus,
  Check,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
export default function Page() {
  const [posts, setPosts] = React.useState<any[]>([])
  const [comments, setComments] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftContent, setDraftContent] = React.useState("")
  const [draftCategory, setDraftCategory] = React.useState("Technology")

  const loadData = async () => {
    try {
      const postsRes = await fetch("/api/posts")
      const postsJson = await postsRes.json()
      if (Array.isArray(postsJson)) {
        setPosts(postsJson)
      }
      const commentsRes = await fetch("/api/comments")
      const commentsJson = await commentsRes.json()
      if (Array.isArray(commentsJson)) {
        setComments(commentsJson)
      }
      const catRes = await fetch("/api/categories")
      const catJson = await catRes.json()
      if (Array.isArray(catJson)) {
        setCategories(catJson)
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  // Filter out deleted posts and sort by views count (descending)
  const popularPosts = React.useMemo(() => {
    return [...posts]
      .filter((p) => p.status !== "Deleted")
      .sort((a, b) => {
        const aVal = parseInt(a.target?.toString().replace(/,/g, "")) || 0
        const bVal = parseInt(b.target?.toString().replace(/,/g, "")) || 0
        return bVal - aVal
      })
      .slice(0, 4)
  }, [posts])

  // Comments awaiting moderation ("In Process")
  const pendingComments = React.useMemo(() => {
    return comments.filter((c) => c.status === "In Process")
  }, [comments])

  const handleApproveComment = async (id: number) => {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Done" }),
      })
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "Done" } : c))
        )
        toast.success("Comment approved successfully!")
      } else {
        toast.error("Failed to approve comment")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred")
    }
  }

  const handleSpamComment = async (id: number) => {
    try {
      const res = await fetch(`/api/comments?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "Deleted" } : c))
        )
        toast.success("Comment marked as spam!")
      } else {
        toast.error("Failed to spam comment")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred")
    }
  }

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftTitle.trim()) {
      toast.error("Please enter a title for your draft.")
      return
    }

    const draftData = {
      header: draftTitle,
      type: draftCategory,
      status: "In Process",
      target: "0",
      limit: "0",
      reviewer: "Admin",
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setPosts((prev) => [data.post, ...prev])
        toast.success(`Draft "${draftTitle}" saved successfully!`)
        setDraftTitle("")
        setDraftContent("")
      } else {
        toast.error("Failed to save draft")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while saving draft")
    }
  }

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
        <div className="flex flex-1 flex-col pb-6 min-w-0">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Grid Layout for Draf Cepat, Komentar Terbaru, and Artikel Terpopuler */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4 lg:px-6">
                {/* Popular Articles */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Popular Articles</CardTitle>
                    <CardDescription>Most viewed stories on your blog</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      {popularPosts.map((post) => (
                        <div
                          key={post.id}
                          className="flex items-start justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-sm font-medium leading-none truncate" title={post.header}>
                              {post.header}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px] font-normal leading-normal"
                              >
                                {post.type}
                              </Badge>
                              <span className="truncate">by {post.reviewer}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="size-3 text-emerald-500" />
                              <span>{post.target}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="size-3" />
                              <span>{post.limit}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Comment moderation queue */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Comment Queue</CardTitle>
                    <CardDescription>Latest remarks awaiting moderation</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    {pendingComments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground flex-1">
                        <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">
                          No comments pending review.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {pendingComments.slice(0, 3).map((comment) => (
                          <div
                            key={comment.id}
                            className="flex gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                          >
                            <Avatar className="size-8 shrink-0">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {(comment.header || "")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold truncate">{comment.header}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {comment.reviewer}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                "{comment.content}"
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                on <span className="font-medium">{comment.type}</span>
                              </p>
                              <div className="flex gap-2 pt-1.5 justify-end">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                                  onClick={() => handleApproveComment(comment.id)}
                                >
                                  <Check className="size-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 border-destructive/30 text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-950/20"
                                  onClick={() => handleSpamComment(comment.id)}
                                >
                                  <Trash2 className="size-3 mr-1" /> Spam
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Draft */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Quick Draft</CardTitle>
                    <CardDescription>Jot down article ideas quickly</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <form onSubmit={handleSaveDraft} className="space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Input
                            placeholder="Title of the draft..."
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Select value={draftCategory} onValueChange={setDraftCategory}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {categories.length > 0 ? (
                                  categories
                                    .filter((cat) => cat.status !== "Deleted")
                                    .map((cat) => (
                                      <SelectItem key={cat.id} value={cat.header}>
                                        {cat.header}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                    <SelectItem value="Tutorials">Tutorials</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Management">Management</SelectItem>
                                  </>
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Textarea
                            placeholder="What's on your mind?..."
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                            className="min-h-[90px] resize-none"
                          />
                        </div>
                      </div>
                      <Button type="submit" size="sm" className="w-full mt-3">
                        <Plus className="size-4 mr-1" /> Save Draft
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
