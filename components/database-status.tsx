"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface HealthStatus {
  status: "healthy" | "unhealthy" | "checking"
  services?: {
    database: string
    api: string
    schema?: string
  }
  error?: string
  timestamp?: string
}

export function DatabaseStatus() {
  const [health, setHealth] = useState<HealthStatus>({ status: "checking" })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkHealth = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      setHealth({
        status: "unhealthy",
        error: "Failed to connect to health endpoint",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusIcon = () => {
    switch (health.status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (health.status) {
      case "healthy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "unhealthy":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          System Status
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={checkHealth} disabled={isRefreshing} className="h-8 w-8 p-0">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Overall Status</span>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{health.status}</span>
          </Badge>
        </div>

        {health.services && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant={health.services.database === "connected" ? "default" : "destructive"}>
                {health.services.database}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API</span>
              <Badge variant={health.services.api === "operational" ? "default" : "destructive"}>
                {health.services.api}
              </Badge>
            </div>
            {health.services.schema && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Schema</span>
                <Badge variant={health.services.schema === "ready" ? "default" : "destructive"}>
                  {health.services.schema}
                </Badge>
              </div>
            )}
          </>
        )}

        {health.error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded">
            {health.error}
            {health.error.includes("Database tables not found") && (
              <div className="mt-2 text-xs">
                <p>Run the database initialization script to create required tables.</p>
              </div>
            )}
          </div>
        )}

        {health.timestamp && (
          <div className="text-xs text-muted-foreground">
            Last checked: {new Date(health.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
