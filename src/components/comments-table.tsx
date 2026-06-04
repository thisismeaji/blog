"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Trash2Icon, CircleCheckIcon, LoaderIcon, EllipsisVerticalIcon, Columns3Icon, ChevronDownIcon, PlusIcon, ChevronsLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsRightIcon, TrendingUpIcon } from "lucide-react"

export const schema = z.object({
  id: z.number(),
  header: z.string(),   // Commenter
  type: z.string(),     // Post Title
  content: z.string(),  // Comment Content
  status: z.string(),   // Done = Approved, In Process = Pending, Deleted = Trash/Spam
  target: z.string(),   // Likes
  limit: z.string(),    // Replies
  reviewer: z.string(), // Date
})

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "header",
    header: "Commenter",
    cell: ({ row, table }) => {
      const onView = (table.options.meta as any)?.onView
      return (
        <Button
          variant="link"
          className="w-fit px-0 text-left text-foreground hover:no-underline font-medium"
          onClick={() => onView?.(row.original)}
        >
          {row.original.header}
        </Button>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "content",
    header: "Comment Text",
    cell: ({ row }) => {
      const text = row.original.content
      const truncated = text.length > 50 ? text.slice(0, 50) + "..." : text
      return (
        <span className="text-muted-foreground block max-w-xs truncate" title={text}>
          {truncated}
        </span>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Post Target",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground line-clamp-1 max-w-44">
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      if (status === "Done") {
        return (
          <Badge variant="outline" className="px-1.5 text-muted-foreground gap-1">
            <CircleCheckIcon className="size-3 fill-green-500 dark:fill-green-400 text-background" />
            <span>Approved</span>
          </Badge>
        )
      }
      if (status === "Deleted") {
        return (
          <Badge variant="destructive" className="px-1.5 gap-1 bg-destructive/10 text-destructive dark:bg-destructive/20 border-destructive/20">
            <Trash2Icon className="size-3" />
            <span>Spam</span>
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground gap-1">
          <LoaderIcon className="size-3 animate-spin text-muted-foreground" />
          <span>Pending</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Likes</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}'s comment`,
            success: "Done",
            error: "Error",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Likes
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Replies</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.header}'s comment`,
            success: "Done",
            error: "Error",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Replies
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Date",
    cell: ({ row }) => {
      return row.original.reviewer
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const onView = (table.options.meta as any)?.onView
      const onEdit = (table.options.meta as any)?.onEdit
      const onDelete = (table.options.meta as any)?.onDelete
      const onRestore = (table.options.meta as any)?.onRestore
      const isDeleted = row.original.status === "Deleted"

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onView?.(row.original)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isDeleted ? (
              <DropdownMenuItem onClick={() => onRestore?.(row.original.id)}>
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(row.original.id)}
              >
                Spam
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const columnLabels: Record<string, string> = {
  header: "Commenter",
  content: "Comment Text",
  type: "Post Target",
  status: "Status",
  target: "Likes",
  limit: "Replies",
  reviewer: "Date",
}

export function CommentsTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>(initialData)
  const [isLoading, setIsLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("all")
  const [skeletonCount, setSkeletonCount] = React.useState(3)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("comments-table-count")
      if (saved) {
        setSkeletonCount(Number(saved))
      }
    }
  }, [])
  const isMobile = useIsMobile()
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  React.useEffect(() => {
    if (isMobile) {
      setColumnVisibility({
        type: false,
        target: false,
        limit: false,
        reviewer: false,
      })
    } else {
      setColumnVisibility({})
    }
  }, [isMobile])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [selectedItem, setSelectedItem] = React.useState<z.infer<typeof schema> | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [drawerMode, setDrawerMode] = React.useState<"view" | "edit">("view")

  const loadData = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/comments")
      const json = await res.json()
      if (Array.isArray(json)) {
        setData(json)
      }
    } catch (err) {
      console.error("Failed to load comments", err)
    } finally {
      setIsLoading(false)
    }
  }


  const handleSave = async (updatedItem: z.infer<typeof schema>) => {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      })
      if (res.ok) {
        setData((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        )
      } else {
        toast.error("Failed to save comment")
      }
    } catch (err) {
      console.error("Save error", err)
      toast.error("An error occurred while saving")
    }
  }

  const displayedData = React.useMemo(() => {
    if (activeTab === "published") {
      return data.filter((item) => item.status === "Done")
    }
    if (activeTab === "drafts") {
      return data.filter((item) => item.status === "In Process")
    }
    if (activeTab === "deleted") {
      return data.filter((item) => item.status === "Deleted")
    }
    return data.filter((item) => item.status !== "Deleted")
  }, [data, activeTab])

  React.useEffect(() => {
    if (!isLoading && typeof window !== "undefined" && activeTab === "all") {
      localStorage.setItem("comments-table-count", displayedData.length.toString())
      setSkeletonCount(displayedData.length > 0 ? displayedData.length : 3)
    }
  }, [isLoading, displayedData.length, activeTab])

  const table = useReactTable({
    data: displayedData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onView: (item: z.infer<typeof schema>) => {
        setSelectedItem(item)
        setDrawerMode("view")
        setDrawerOpen(true)
      },
      onEdit: (item: z.infer<typeof schema>) => {
        setSelectedItem(item)
        setDrawerMode("edit")
        setDrawerOpen(true)
      },
      onDelete: async (id: number) => {
        try {
          const res = await fetch(`/api/comments?id=${id}`, {
            method: "DELETE",
          })
          if (res.ok) {
            setData((prev) =>
              prev.map((item) => (item.id === id ? { ...item, status: "Deleted" } : item))
            )
            toast.success("Comment marked as Spam")
          } else {
            toast.error("Failed to delete comment")
          }
        } catch (err) {
          console.error("Delete error", err)
          toast.error("An error occurred while deleting")
        }
      },
      onRestore: async (id: number) => {
        try {
          const res = await fetch("/api/comments", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "In Process" }),
          })
          if (res.ok) {
            setData((prev) =>
              prev.map((item) => (item.id === id ? { ...item, status: "In Process" } : item))
            )
            toast.success("Comment restored to pending")
          } else {
            toast.error("Failed to restore comment")
          }
        } catch (err) {
          console.error("Restore error", err)
          toast.error("An error occurred while restoring")
        }
      },
    },
  })

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 lg:px-6 w-full">
          <TabsList className="w-full flex justify-start overflow-x-auto no-scrollbar md:w-auto **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
            <TabsTrigger value="all">
              All Comments <Badge variant="secondary">{data.filter(d => d.status !== "Deleted").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="published">
              Approved <Badge variant="secondary">{data.filter(d => d.status === "Done").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts">
              Pending <Badge variant="secondary">{data.filter(d => d.status === "In Process").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="deleted">
              Spam <Badge variant="secondary">{data.filter(d => d.status === "Deleted").length}</Badge>
            </TabsTrigger>
          </TabsList>
          <div className="flex w-full flex-col md:flex-row items-center gap-2 *:w-full md:*:w-auto md:w-auto md:*:flex-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Columns3Icon data-icon="inline-start" />
                  Columns
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {columnLabels[column.id] || column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => toast.info("Comments must be submitted by visitors on the active blog posts.")}
            >
              <PlusIcon />
              <span>Add Comment</span>
            </Button>
          </div>
        </div>
        <TabsContent
          value={activeTab}
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: skeletonCount }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                      {table.getVisibleFlatColumns().map((column) => {
                        let cellClass = ""
                        let skeletonClass = "h-4 rounded bg-muted-foreground/10 animate-pulse"
                        
                        if (column.id === "header") {
                          skeletonClass += " w-24"
                        } else if (column.id === "content") {
                          skeletonClass += " w-64"
                        } else if (column.id === "type") {
                          skeletonClass += " w-40"
                        } else if (column.id === "status") {
                          skeletonClass += " w-20 h-5 rounded-full"
                        } else if (column.id === "target" || column.id === "limit") {
                          cellClass = "text-right"
                          skeletonClass += " w-12 ml-auto"
                        } else if (column.id === "reviewer") {
                          skeletonClass += " w-24"
                        } else if (column.id === "actions") {
                          skeletonClass += " size-8 rounded-md ml-auto"
                        } else {
                          skeletonClass += " w-full max-w-[100px]"
                        }
                        
                        return (
                          <TableCell key={column.id} className={cellClass}>
                            <div className={skeletonClass} />
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end px-4">
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <TableCellViewer
        item={selectedItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        onSave={handleSave}
      />
    </>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface TableCellViewerProps {
  item: z.infer<typeof schema> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "view" | "edit"
  onSave?: (updatedItem: z.infer<typeof schema>) => void
}

function TableCellViewer({ item, open, onOpenChange, mode, onSave }: TableCellViewerProps) {
  const isMobile = useIsMobile()

  // Form states
  const [header, setHeader] = React.useState("")
  const [type, setType] = React.useState("")
  const [content, setContent] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [target, setTarget] = React.useState("")
  const [limit, setLimit] = React.useState("")
  const [reviewer, setReviewer] = React.useState("")

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setHeader(item.header)
      setType(item.type)
      setContent(item.content)
      setStatus(item.status)
      setTarget(item.target)
      setLimit(item.limit)
      setReviewer(item.reviewer)
    }
  }, [item])

  if (!item) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSave) {
      onSave({
        id: item.id,
        header,
        type,
        content,
        status,
        target,
        limit,
        reviewer,
      })
    }
    onOpenChange(false)
    toast.success(`Comment by "${header}" updated successfully`)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{header ? `Comment by ${header}` : "Comment Details"}</DrawerTitle>
          <DrawerDescription>
            {mode === "edit" ? "Edit Comment Details & Meta" : "Comment Details & Meta"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Trending up by 5.2% this month{" "}
                  <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing engagement statistics for this comment thread over the last 6 months.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form id="drawer-post-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="header">Commenter</Label>
                <Input
                  id="header"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={mode === "view"}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Done">Approved</SelectItem>
                      <SelectItem value="In Process">Pending</SelectItem>
                      <SelectItem value="Deleted">Spam</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="type">Post Title</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="content">Comment Text</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={mode === "view"}
                className="min-h-24 leading-relaxed"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Likes</Label>
                <Input
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Replies</Label>
                <Input
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  disabled={mode === "view"}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="reviewer">Date</Label>
                <Input
                  id="reviewer"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  disabled={mode === "view"}
                />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          {mode === "edit" ? (
            <Button type="submit" form="drawer-post-form">Submit</Button>
          ) : null}
          <DrawerClose asChild>
            <Button variant="outline">{mode === "edit" ? "Cancel" : "Done"}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
