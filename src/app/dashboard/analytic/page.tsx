"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, Clock, Percent } from "lucide-react"

// Mock category traffic data
const categoryData = [
  { name: "Technology", views: 4200 },
  { name: "Design", views: 3100 },
  { name: "Tutorials", views: 2450 },
  { name: "Marketing", views: 1890 },
  { name: "Management", views: 1240 },
]

const categoryConfig = {
  views: {
    label: "Views",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// Mock traffic referrer data
const sourceData = [
  { name: "Google Search", value: 5400, fill: "var(--color-google)" },
  { name: "Direct Traffic", value: 3200, fill: "var(--color-direct)" },
  { name: "Social Media", value: 2100, fill: "var(--color-social)" },
  { name: "Newsletter", value: 1500, fill: "var(--color-newsletter)" },
]

const sourceConfig = {
  google: {
    label: "Google Search",
    color: "var(--chart-1)",
  },
  direct: {
    label: "Direct Traffic",
    color: "var(--chart-2)",
  },
  social: {
    label: "Social Media",
    color: "var(--chart-3)",
  },
  newsletter: {
    label: "Newsletter",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

// Mock engagement trends data
const trendData = [
  { month: "Jan", bounceRate: 48, avgDuration: 120 },
  { month: "Feb", bounceRate: 45, avgDuration: 140 },
  { month: "Mar", bounceRate: 42, avgDuration: 165 },
  { month: "Apr", bounceRate: 40, avgDuration: 190 },
  { month: "May", bounceRate: 38, avgDuration: 210 },
  { month: "Jun", bounceRate: 35, avgDuration: 225 },
]

const trendConfig = {
  bounceRate: {
    label: "Bounce Rate (%)",
    color: "var(--destructive)",
  },
  avgDuration: {
    label: "Avg. Duration (s)",
    color: "var(--primary)",
  },
} satisfies ChartConfig

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
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-auto">
          {/* Page Title */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Analytics Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed breakdown of traffic volume, referrers, categories, and reader engagement trends.
            </p>
          </div>

          {/* Simple KPI metrics bar */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 select-none">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Unique Visitors</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">12,200</div>
                <p className="text-[10px] text-muted-foreground mt-1">+12.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Avg. Session Time</CardTitle>
                <Clock className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">3m 45s</div>
                <p className="text-[10px] text-muted-foreground mt-1">+8.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Bounce Rate</CardTitle>
                <Percent className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">42.0%</div>
                <p className="text-[10px] text-muted-foreground mt-1">-5.2% decrease (better)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">1,540</div>
                <p className="text-[10px] text-muted-foreground mt-1">+24.5% new subscribers</p>
              </CardContent>
            </Card>
          </div>

          {/* Row 1: Main traffic area chart (Interactive) */}
          <div className="w-full">
            <ChartAreaInteractive />
          </div>

          {/* Row 2: Category Views Bar Chart & Referrers Donut Chart */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart: Views by Category */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Views by Category</CardTitle>
                <CardDescription>Performance comparison across article themes</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <ChartContainer config={categoryConfig} className="mx-auto aspect-square max-h-[300px] w-full">
                  <BarChart data={categoryData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="views"
                      fill="var(--color-views)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Donut Chart: Traffic Referrers */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Traffic Referrers</CardTitle>
                <CardDescription>Top channels driving visits to your blog</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <ChartContainer
                  config={sourceConfig}
                  className="mx-auto aspect-square max-h-[300px] w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Bounce Rate & Session Duration double line chart */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Reader Engagement Trends</CardTitle>
                <CardDescription>Monthly progression of Session Duration & Bounce Rate</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer config={trendConfig} className="aspect-auto h-[250px] w-full">
                  <LineChart data={trendData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Line
                      dataKey="bounceRate"
                      type="monotone"
                      stroke="var(--color-bounceRate)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="avgDuration"
                      type="monotone"
                      stroke="var(--color-avgDuration)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      className="pt-4"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
