"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Save, Globe, Sliders, ShieldAlert } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Page() {
  // General settings state
  const [siteName, setSiteName] = React.useState("My CMS Blog")
  const [siteTagline, setSiteTagline] = React.useState("Thoughts, tutorials, and insights on modern web development.")
  const [siteUrl, setSiteUrl] = React.useState("https://mycmsblog.com")

  // Writing/Reading settings state
  const [defaultCategory, setDefaultCategory] = React.useState("Technology")
  const [categories, setCategories] = React.useState<any[]>([])

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        if (Array.isArray(data)) {
          setCategories(data.filter((c) => c.status !== "Deleted"))
        }
      } catch (err) {
        console.error("Failed to fetch categories", err)
      }
    }
    fetchCategories()
  }, [])

  const [postsPerPage, setPostsPerPage] = React.useState("10")
  const [allowComments, setAllowComments] = React.useState(true)

  // SEO & Integration settings state
  const [googleAnalyticsId, setGoogleAnalyticsId] = React.useState("G-E7B6C8D9")
  const [metaKeywords, setMetaKeywords] = React.useState("nextjs, tailwindcss, react, typescript, blog, cms")

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Settings saved successfully!")
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
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-auto">
          <form onSubmit={handleSaveSettings} className="space-y-6 w-full">
            {/* Header Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">System Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure your blog's preferences, general metadata, and SEO integrations.
                </p>
              </div>
              <Button type="submit" size="sm" className="w-full sm:w-auto shrink-0">
                <Save className="size-4 mr-1.5" /> Save Settings
              </Button>
            </div>

            {/* Left and Right Grid Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column: General Settings */}
              <div className="space-y-6">
                <Card className="h-full flex flex-col">
                  <CardHeader className="flex flex-row items-start gap-4 pb-4">
                    <Globe className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">General Settings</CardTitle>
                      <CardDescription>
                        Configure the fundamental attributes of your blog site.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="grid gap-3">
                      <Label htmlFor="site-name">Blog Title</Label>
                      <Input
                        id="site-name"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="Enter blog title"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="site-tagline">Tagline / Description</Label>
                      <Textarea
                        id="site-tagline"
                        value={siteTagline}
                        onChange={(e) => setSiteTagline(e.target.value)}
                        placeholder="Describe what your blog is about..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="site-url">Site URL</Label>
                      <Input
                        id="site-url"
                        type="url"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Writing & Reading + SEO Configs */}
              <div className="space-y-6">
                {/* Writing & Reading Preferences */}
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 pb-4">
                    <Sliders className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">Writing & Reading Preferences</CardTitle>
                      <CardDescription>
                        Manage default parameters for creating and reading blog content.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="default-category">Default Post Category</Label>
                        <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                          <SelectTrigger id="default-category" className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
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
                      <div className="grid gap-3">
                        <Label htmlFor="posts-per-page">Posts Per Page</Label>
                        <Input
                          id="posts-per-page"
                          type="number"
                          min="1"
                          max="100"
                          value={postsPerPage}
                          onChange={(e) => setPostsPerPage(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Checkbox
                        id="allow-comments"
                        checked={allowComments}
                        onCheckedChange={(checked) => setAllowComments(!!checked)}
                      />
                      <Label
                        htmlFor="allow-comments"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                      >
                        Allow readers to submit comments on new articles
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO & Integrations Settings */}
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4 pb-4">
                    <ShieldAlert className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">SEO & Third-party Integrations</CardTitle>
                      <CardDescription>
                        Optimize discoverability and set up statistics analytics tools.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <Label htmlFor="ga-id">Google Analytics Measurement ID</Label>
                      <Input
                        id="ga-id"
                        value={googleAnalyticsId}
                        onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="meta-keywords">Meta Keywords (Comma-separated)</Label>
                      <Input
                        id="meta-keywords"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
