"use client"

import { useState } from "react"
import type { CallLog } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, MessageSquare, Clock, BotIcon, Hash, Zap, Database, Webhook } from "lucide-react"
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

              {/* Function Call Results */}
              {metadata?.functionCalls && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Function Call Results
                  </h4>
                  <div className="space-y-2">
                    {Array.isArray(metadata.functionCalls) ? metadata.functionCalls.map((call: any, index: number) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Function: {call.name || 'Unknown'}
                        </div>
                        <div className="text-sm">
                          <strong>Input:</strong> {JSON.stringify(call.arguments || call.input, null, 2)}
                        </div>
                        <div className="text-sm mt-1">
                          <strong>Result:</strong> {typeof call.result === 'object' ? JSON.stringify(call.result, null, 2) : call.result}
                        </div>
                      </div>
                    )) : (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <pre className="text-sm">{JSON.stringify(metadata.functionCalls, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pre-call Data */}
              {metadata?.preCallData && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    Pre-call Data Retrieved
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <pre className="text-sm">{JSON.stringify(metadata.preCallData, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Webhook Processing */}
              {(metadata?.webhookProcessed || metadata?.processedAt) && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Webhook className="h-4 w-4 text-purple-500" />
                    Webhook Processing
                  </h4>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                    <div className="text-sm space-y-1">
                      {metadata.processedAt && (
                        <div><strong>Processed At:</strong> {new Date(metadata.processedAt).toLocaleString()}</div>
                      )}
                      {metadata.webhookProcessed && (
                        <div><strong>Status:</strong> Successfully processed by post-call webhook</div>
                      )}
                      {metadata.callId && (
                        <div><strong>Call ID:</strong> {metadata.callId}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Other Metadata */}
              {Object.keys(metadata).filter(key => 
                !['functionCalls', 'preCallData', 'webhookProcessed', 'processedAt', 'callId'].includes(key)
              ).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Additional Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(metadata)
                      .filter(([key]) => !['functionCalls', 'preCallData', 'webhookProcessed', 'processedAt', 'callId'].includes(key))
                      .map(([key, value]) => (
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
