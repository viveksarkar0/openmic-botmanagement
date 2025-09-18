"use client"

import { useState } from "react"
import type { CallLog } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, MessageSquare, Clock, BotIcon, Hash } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface CallLogWithBot extends CallLog {
  bot?: {
    id?: string
    name?: string
    domain?: string
  }
}

interface LogCardProps {
  log: CallLogWithBot
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

export function LogCard({ log }: LogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const metadata = log.metadata as Record<string, any>
  const duration = metadata?.duration
    ? `${Math.floor(metadata.duration / 60)}:${(metadata.duration % 60).toString().padStart(2, "0")}`
    : "Unknown"
  const sentiment = metadata?.sentiment || "neutral"

  return (
    <Card className="transition-all hover:shadow-md">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {domainIcons[log.bot?.domain as keyof typeof domainIcons] || '🤖'}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <BotIcon className="h-4 w-4" />
                    {log.bot?.name || 'Unknown Bot'}
                    {log.bot?.domain && (
                      <Badge 
                        variant="outline" 
                        className={domainColors[log.bot.domain as keyof typeof domainColors] || 'bg-gray-100 text-gray-800 border-gray-200'}
                      >
                        {log.bot.domain}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {log.id.slice(0, 8)}
                    </div>
                    <div>Duration: {duration}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    sentiment === "positive" ? "default" : sentiment === "negative" ? "destructive" : "secondary"
                  }
                  className="capitalize"
                >
                  {sentiment}
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Transcript */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Call Transcript
                </h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{log.transcript}</p>
                </div>
              </div>

              {/* Metadata */}
              {Object.keys(metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Call Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(metadata).map(([key, value]) => (
                      <div key={key} className="bg-card border rounded-lg p-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-sm font-medium mt-1">
                          {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div>Created {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</div>
                <div>Log ID: {log.id}</div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
