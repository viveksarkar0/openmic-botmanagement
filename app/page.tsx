"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { DatabaseStatus } from "@/components/database-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, MessageSquare, Activity, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DashboardStats {
  totalBots: number
  totalCalls: number
  activeBots: number
  recentCalls: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBots: 0,
    totalCalls: 0,
    activeBots: 0,
    recentCalls: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [botsResponse, logsResponse] = await Promise.all([fetch("/api/bots"), fetch("/api/call-logs?limit=100")])

        if (!botsResponse.ok) {
          const errorText = await botsResponse.text()
          throw new Error(`Bots API failed: ${botsResponse.status} - ${errorText}`)
        }

        if (!logsResponse.ok) {
          const errorText = await logsResponse.text()
          throw new Error(`Logs API failed: ${logsResponse.status} - ${errorText}`)
        }

        const botsResult = await botsResponse.json()
        const logsResult = await logsResponse.json()

        if (botsResult.success && logsResult.success) {
          const bots = botsResult.data || []
          const logs = logsResult.data || []

          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          const recentCalls = logs.filter((log: any) => {
            const logDate = log.createdAt || log.formattedCreatedAt
            return logDate && new Date(logDate) > oneDayAgo
          }).length

          setStats({
            totalBots: bots.length,
            totalCalls: logs.length,
            activeBots: bots.filter((bot: any) => (bot._count?.callLogs || 0) > 0).length,
            recentCalls,
          })
          setError(null)
        } else {
          const errorMsg = botsResult.error || logsResult.error || "Unknown API error"
          setError(errorMsg)
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("Database connection failed")) {
            setError("Database connection failed. Please set up your DATABASE_URL environment variable.")
          } else if (error.message.includes("Database tables not found")) {
            setError("Database tables not found. Please run the database initialization script.")
          } else {
            setError(`Failed to load dashboard data: ${error.message}`)
          }
        } else {
          setError("Failed to load dashboard data. Please check your setup.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-balance">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your AI intake agent performance and activity</p>
        </div>

        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes("Database tables not found") && (
                <div className="mt-2 text-sm">
                  <p>To fix this issue, run the database initialization script in the Scripts section below.</p>
                </div>
              )}
              {error.includes("Database connection failed") && (
                <div className="mt-2 text-sm">
                  <p>To fix this issue:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Check your DATABASE_URL environment variable in Vercel project settings</li>
                    <li>Ensure your database is running and accessible</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <DatabaseStatus />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalBots}</div>
              <p className="text-xs text-muted-foreground">Active AI agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalCalls}</div>
              <p className="text-xs text-muted-foreground">All time interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.activeBots}</div>
              <p className="text-xs text-muted-foreground">With call history</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Calls</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.recentCalls}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Bot Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create and manage your AI intake bots for different domains including medical, legal, and receptionist
                services.
              </p>
              <Link href="/bots">
                <Button className="w-full">Manage Bots</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Call Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                View detailed call transcripts, analyze conversations, and track bot performance across all
                interactions.
              </p>
              <Link href="/logs">
                <Button variant="outline" className="w-full bg-transparent">
                  View Call Logs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
