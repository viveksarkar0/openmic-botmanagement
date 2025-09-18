"use client"

import { useState } from "react"
import type { Bot } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, BotIcon, Calendar, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { BotForm } from "./bot-form"

interface BotWithCount extends Bot {
  _count?: {
    callLogs: number
  }
}

interface BotTableProps {
  bots: BotWithCount[]
  onUpdate: () => void
}

const domainColors = {
  medical: "bg-blue-100 text-blue-800 border-blue-200",
  legal: "bg-purple-100 text-purple-800 border-purple-200",
  receptionist: "bg-green-100 text-green-800 border-green-200",
}

const domainIcons = {
  medical: "🏥",
  legal: "⚖️",
  receptionist: "📞",
}

export function BotTable({ bots, onUpdate }: BotTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/bots/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Bot deleted successfully",
        })
        onUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete bot",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (bots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BotIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No bots yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Create your first AI intake bot to start managing calls and interactions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BotIcon className="h-5 w-5" />
          AI Bots ({bots.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>UID</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{domainIcons[bot.domain as keyof typeof domainIcons]}</div>
                      <div>
                        <div className="font-medium text-foreground">{bot.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {bot.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={domainColors[bot.domain as keyof typeof domainColors]}>
                      {bot.domain}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      {bot.uid}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{bot._count?.callLogs || 0} calls</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(bot.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <BotForm
                        editBot={bot}
                        onSuccess={onUpdate}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Bot</AlertDialogTitle>
                            <AlertDialogDescription className="text-balance">
                              Are you sure you want to delete "{bot.name}"? This action cannot be undone and will also
                              delete all associated call logs.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(bot.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deletingId === bot.id}
                            >
                              {deletingId === bot.id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
