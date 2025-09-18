"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle,
  Users,
  DollarSign
} from "lucide-react"

interface AnalyticsData {
  totalCalls: number
  successfulCalls: number
  averageDuration: number
  totalCost: number
  callsByDomain: Array<{ domain: string; calls: number; color: string }>
  callsByHour: Array<{ hour: string; calls: number }>
  recentTrends: {
    callsChange: number
    durationChange: number
    successRateChange: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [logsResponse, botsResponse] = await Promise.all([
          fetch('/api/call-logs?limit=1000&source=both'),
          fetch('/api/bots')
        ])

        const [logsResult, botsResult] = await Promise.all([
          logsResponse.json(),
          botsResponse.json()
        ])

        if (logsResult.success && botsResult.success) {
          const logs = logsResult.data || []
          const bots = botsResult.data || []

          // Calculate analytics
          const totalCalls = logs.length
          const successfulCalls = logs.filter((log: any) => 
            log.status === 'ended' || log.status === 'completed'
          ).length

          const totalDuration = logs.reduce((sum: number, log: any) => 
            sum + (log.duration || 0), 0
          )
          const averageDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0

          const totalCost = logs.reduce((sum: number, log: any) => 
            sum + (parseFloat(log.cost) || 0), 0
          )

          // Calls by domain
          const domainCounts = bots.reduce((acc: any, bot: any) => {
            const botCalls = logs.filter((log: any) => log.botId === bot.id).length
            acc[bot.domain] = (acc[bot.domain] || 0) + botCalls
            return acc
          }, {})

          const callsByDomain = Object.entries(domainCounts).map(([domain, calls], index) => ({
            domain: domain.charAt(0).toUpperCase() + domain.slice(1),
            calls: calls as number,
            color: COLORS[index % COLORS.length]
          }))

          // Calls by hour (last 24 hours)
          const now = new Date()
          const callsByHour = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
            const hourCalls = logs.filter((log: any) => {
              const logTime = new Date(log.createdAt)
              return logTime.getHours() === hour.getHours() && 
                     logTime.toDateString() === hour.toDateString()
            }).length

            return {
              hour: hour.getHours().toString().padStart(2, '0') + ':00',
              calls: hourCalls
            }
          })

          // Calculate trends (mock data for demo)
          const recentTrends = {
            callsChange: Math.floor(Math.random() * 20) - 10,
            durationChange: Math.floor(Math.random() * 30) - 15,
            successRateChange: Math.floor(Math.random() * 10) - 5
          }

          setAnalytics({
            totalCalls,
            successfulCalls,
            averageDuration,
            totalCost,
            callsByDomain,
            callsByHour,
            recentTrends
          })
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>
  }

  const successRate = analytics.totalCalls > 0 
    ? Math.round((analytics.successfulCalls / analytics.totalCalls) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCalls}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.recentTrends.callsChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(analytics.recentTrends.callsChange)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <Progress value={successRate} className="mt-2" />
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {analytics.recentTrends.successRateChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(analytics.recentTrends.successRateChange)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageDuration}s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.recentTrends.durationChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(analytics.recentTrends.durationChange)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${(analytics.totalCost / Math.max(analytics.totalCalls, 1)).toFixed(3)} per call
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calls by Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.callsByDomain}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ domain, calls }) => `${domain}: ${calls}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="calls"
                >
                  {analytics.callsByDomain.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calls by Hour (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.callsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
