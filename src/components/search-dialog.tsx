"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

interface SearchItem {
  title: string
  url: string
}

export function SearchDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"app" | "pages">("app")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Listen to open event and keyboard shortcuts
  React.useEffect(() => {
    const handleOpen = () => {
      setOpen(true)
      setSearchQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleOpen()
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("open-search", handleOpen)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("open-search", handleOpen)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  if (!open) return null

  // Items based on tabs
  const appItems: SearchItem[] = [
    { title: "Introduction", url: "#" },
    { title: "Getting Started", url: "#" },
    { title: "App Router", url: "#" },
    { title: "Architecture", url: "#" },
    { title: "Pages Router", url: "#" },
    { title: "API Reference", url: "#" },
    { title: "Accessibility", url: "#" },
  ]

  const pageItems: SearchItem[] = [
    { title: "Introduction", url: "#" },
    { title: "Getting Started", url: "#" },
    { title: "App Router", url: "#" },
    { title: "Architecture", url: "#" },
    { title: "Pages Router", url: "#" },
    { title: "API Reference", url: "#" },
    { title: "Accessibility", url: "#" },
  ]

  const items = activeTab === "app" ? appItems : pageItems

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (url: string) => {
    setOpen(false)
    if (url !== "#") {
      router.push(url)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border bg-popover text-popover-foreground shadow-2xl flex flex-col overflow-hidden select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header containing tabs & search bar */}
        <div className="p-4 space-y-3 border-b">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("app")}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "app"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              App
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "pages"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              Pages
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="What are you searching for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 text-foreground text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded font-mono select-none hover:text-foreground hover:bg-accent cursor-pointer shrink-0"
            >
              Esc
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-[320px] overflow-y-auto space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for "{searchQuery}"
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => handleSelect(item.url)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150 cursor-pointer"
              >
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{item.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
