"use client"

import { useState, useEffect, useMemo } from "react"
import type { CallLog, Bot } from "@prisma/client"
import { Navbar } from "@/components/navbar"
import { LogCard } from "@/components/log-card"
import { LogFilters, type LogFilters as LogFiltersType } from "@/components/log-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, RefreshCw, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CallLogWithBot extends CallLog {
  bot: {
    id: string
    name: string
    domain: string
  }
  callerNumber?: string
  source?: string
  _searchText?: string
}

export default function CallLogsPage() {
  const [logs, setLogs] = useState<CallLogWithBot[]>([])
  const [bots, setBots] = useState<Bot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<LogFiltersType>({
    search: "",
    botId: "all",
    domain: "all",
    sentiment: "all",
  })
  const { toast } = useToast()

  const fetchData = async (showToast = false) => {
    setIsLoading(true)
    try {
      // Fetch from both OpenMic and local sources
      const [logsResponse, botsResponse] = await Promise.all([
        fetch("/api/call-logs?limit=100&source=both"), 
        fetch("/api/bots?sync=true")
      ])

      const [logsResult, botsResult] = await Promise.all([logsResponse.json(), botsResponse.json()])

      if (logsResult.success && botsResult.success) {
        setLogs(logsResult.data || [])
        setBots(botsResult.data || [])
        if (showToast) {
          toast({
            title: "Success",
            description: "Call logs refreshed successfully",
          })
        }
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch call logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return []
    return logs.filter((log) => {
      // Search filter - search in transcript, caller number, and bot name
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase().trim()
        const transcript = (log.transcript || '').toLowerCase()
        const callerNumber = ((log as any).callerNumber || '').toLowerCase()
        const botName = (log.bot?.name || '').toLowerCase()
        const searchText = `${transcript} ${callerNumber} ${botName}`
        
        if (!searchText.includes(searchTerm)) {
          return false
        }
      }

      // Bot filter
      if (filters.botId && filters.botId !== "all" && log.botId !== filters.botId) {
        return false
      }

      // Domain filter - safely access bot.domain and handle case sensitivity
      const botDomain = log.bot?.domain?.toLowerCase() || ''
      if (filters.domain && filters.domain !== 'all' && botDomain !== filters.domain.toLowerCase()) {
        return false
      }

      // Sentiment filter
      if (filters.sentiment && filters.sentiment !== "all") {
        const metadata = log.metadata as Record<string, any>
        const sentiment = metadata?.sentiment || "neutral"
        if (sentiment !== filters.sentiment) {
          return false
        }
      }

      return true
    })
  }, [logs, filters])

  const exportLogs = () => {
    const csvContent = [
      ["Date", "Bot Name", "Domain", "Duration", "Sentiment", "Transcript"].join(","),
      ...filteredLogs.map((log) => {
        const metadata = log.metadata as Record<string, any>
        const duration = metadata?.duration || 0
        const sentiment = metadata?.sentiment || "neutral"
        const transcript = (log.transcript || '').replace(/"/g, '""')
        const botName = log.bot?.name || 'Unknown Bot'
        const botDomain = log.bot?.domain || 'unknown'
        
        return [
          new Date(log.createdAt).toISOString(),
          `"${botName.replace(/"/g, '""')}"`,,
          `"${botDomain}"`,,
          duration.toString(),
          sentiment,
          `"${transcript}"`,,
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `call-logs-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Call logs exported successfully",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground text-balance">Call Logs</h1>
              <p className="mt-2 text-muted-foreground">View and analyze all AI bot interactions and transcripts</p>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing with OpenMic...
                </div>
              )}
              <Button variant="outline" onClick={exportLogs} disabled={filteredLogs.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => fetchData(true)} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <LogFilters onFilterChange={setFilters} bots={bots} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">All time calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <p className="text-xs text-muted-foreground">Matching filters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLogs.length > 0
                  ? Math.round(
                      filteredLogs.reduce((sum, log) => {
                        const metadata = log.metadata as Record<string, any>
                        return sum + (metadata?.duration || 0)
                      }, 0) / filteredLogs.length,
                    )
                  : 0}
                s
              </div>
              <p className="text-xs text-muted-foreground">Call duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Call Logs */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading call logs...</div>
            </CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {logs.length === 0 ? "No call logs yet" : "No matching logs"}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {logs.length === 0
                  ? "Call logs will appear here once your bots start receiving calls."
                  : "Try adjusting your filters to see more results."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
