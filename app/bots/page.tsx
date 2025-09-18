"use client"

import { useState, useEffect } from "react"
import type { Bot } from "@prisma/client"
import { Navbar } from "@/components/navbar"
import { BotForm } from "@/components/bot-form"
import { BotTable } from "@/components/bot-table"
import { OpenMicStatus } from "@/components/openmic-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BotIcon, Activity, MessageSquare, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BotWithCount extends Bot {
  _count?: {
    callLogs: number
  }
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchBots = async (sync = false) => {
    try {
      const url = sync ? "/api/bots?sync=true" : "/api/bots"
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setBots(result.data)
        if (sync) {
          toast({
            title: "Success",
            description: "Bots synchronized with OpenMic",
          })
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: sync ? "Failed to sync bots" : "Failed to fetch bots",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBots()
  }, [])

  const totalCalls = bots.reduce((sum, bot) => sum + (bot._count?.callLogs || 0), 0)
  const activeBots = bots.filter((bot) => (bot._count?.callLogs || 0) > 0).length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground text-balance">Bot Management</h1>
              <p className="mt-2 text-muted-foreground">Create and manage your AI intake bots for different domains</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fetchBots(true)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Sync with OpenMic
              </Button>
              <BotForm onSuccess={() => fetchBots()} />
            </div>
          </div>
        </div>

        {/* OpenMic Status */}
        <div className="mb-6">
          <OpenMicStatus onSync={() => fetchBots(true)} isLoading={isLoading} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
              <BotIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bots.length}</div>
              <p className="text-xs text-muted-foreground">Across all domains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBots}</div>
              <p className="text-xs text-muted-foreground">With call history</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Bots Table */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading bots...</div>
            </CardContent>
          </Card>
        ) : (
          <BotTable bots={bots} onUpdate={fetchBots} />
        )}
      </main>
    </div>
  )
}
