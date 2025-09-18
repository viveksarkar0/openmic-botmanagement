"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bot, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  Search,
  Filter,
  Phone,
  Clock,
  DollarSign
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Bot as BotType } from "@prisma/client"

interface BotWithStats extends BotType {
  _count?: {
    callLogs: number
  }
  stats?: {
    totalCalls: number
    avgDuration: number
    totalCost: number
    successRate: number
    lastCallAt?: string
  }
}

interface EnhancedBotTableProps {
  bots: BotWithStats[]
  onUpdate: () => void
}

export function EnhancedBotTable({ bots, onUpdate }: EnhancedBotTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const { toast } = useToast()

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.uid.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = selectedDomain === "all" || bot.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  const handleDelete = async (bot: BotWithStats) => {
    if (!confirm(`Are you sure you want to delete "${bot.name}"?`)) return

    try {
      const response = await fetch(`/api/bots/${bot.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Bot "${bot.name}" deleted successfully`,
        })
        onUpdate()
      } else {
        throw new Error('Failed to delete bot')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bot",
        variant: "destructive",
      })
    }
  }

  const handleCopyUID = (uid: string) => {
    navigator.clipboard.writeText(uid)
    toast({
      title: "Copied",
      description: "Bot UID copied to clipboard",
    })
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'medical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'legal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'receptionist': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusColor = (callCount: number) => {
    if (callCount === 0) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    if (callCount < 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  const getStatusText = (callCount: number) => {
    if (callCount === 0) return 'Inactive'
    if (callCount < 5) return 'Low Activity'
    return 'Active'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot Management ({filteredBots.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedDomain === "all" ? "All Domains" : selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Domain</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedDomain("all")}>
                  All Domains
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDomain("medical")}>
                  Medical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDomain("legal")}>
                  Legal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedDomain("receptionist")}>
                  Receptionist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBots.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedDomain !== "all" ? "No matching bots" : "No bots yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedDomain !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Create your first AI intake bot to get started."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bot Details</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBots.map((bot) => {
                  const callCount = bot._count?.callLogs || 0
                  const stats = bot.stats || {
                    totalCalls: callCount,
                    avgDuration: 0,
                    totalCost: 0,
                    successRate: 0
                  }

                  return (
                    <TableRow key={bot.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bot.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Created {new Date(bot.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDomainColor(bot.domain)}>
                          {bot.domain.charAt(0).toUpperCase() + bot.domain.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(callCount)}>
                          {getStatusText(callCount)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{stats.totalCalls} calls</span>
                          </div>
                          {stats.avgDuration > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{stats.avgDuration}s avg</span>
                            </div>
                          )}
                          {stats.totalCost > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              <span>${stats.totalCost.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {bot.uid.length > 12 ? `${bot.uid.substring(0, 12)}...` : bot.uid}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUID(bot.uid)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Bot
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyUID(bot.uid)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy UID
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View in OpenMic
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(bot)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Bot
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
