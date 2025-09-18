"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, PhoneCall, Clock, User, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CallNotification {
  id: string
  botName: string
  callerNumber: string
  status: 'incoming' | 'ongoing' | 'ended'
  timestamp: Date
  duration?: number
}

export function CallNotifications() {
  const [notifications, setNotifications] = useState<CallNotification[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const { toast } = useToast()

  // Simulate real-time call notifications
  useEffect(() => {
    const checkForNewCalls = async () => {
      try {
        const response = await fetch('/api/call-logs?limit=5&source=openmic')
        const result = await response.json()
        
        if (result.success && result.data) {
          const recentCalls = result.data
            .filter((call: any) => {
              const callTime = new Date(call.createdAt)
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
              return callTime > fiveMinutesAgo
            })
            .map((call: any) => ({
              id: call.id,
              botName: call.bot?.name || 'Unknown Bot',
              callerNumber: call.callerNumber || 'Unknown',
              status: call.status === 'ended' ? 'ended' : 'ongoing',
              timestamp: new Date(call.createdAt),
              duration: call.duration
            }))

          if (recentCalls.length > 0) {
            setNotifications(recentCalls)
            setIsVisible(true)
            
            // Show toast for new calls
            recentCalls.forEach((call: CallNotification) => {
              if (call.status === 'ended') {
                toast({
                  title: "Call Completed",
                  description: `${call.botName} finished call with ${call.callerNumber}`,
                })
              }
            })
          }
        }
      } catch (error) {
        // Handle error silently
      }
    }

    // Check immediately and then every 10 seconds
    checkForNewCalls()
    const interval = setInterval(checkForNewCalls, 10000)
    
    return () => clearInterval(interval)
  }, [toast])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notifications.length <= 1) {
      setIsVisible(false)
    }
  }

  const dismissAll = () => {
    setNotifications([])
    setIsVisible(false)
  }

  if (!isVisible || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      <Card className="border-l-4 border-l-blue-500 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              Recent Call Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAll}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-shrink-0">
                  {notification.status === 'ongoing' ? (
                    <Phone className="h-4 w-4 text-green-500 animate-pulse" />
                  ) : (
                    <Phone className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {notification.botName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{notification.callerNumber}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{notification.timestamp.toLocaleTimeString()}</span>
                    {notification.duration && (
                      <span>• {notification.duration}s</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    variant={notification.status === 'ongoing' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.status}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
