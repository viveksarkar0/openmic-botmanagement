"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface OpenMicStatusProps {
  onSync?: () => void
  isLoading?: boolean
}

export function OpenMicStatus({ onSync, isLoading = false }: OpenMicStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const checkStatus = async () => {
    setStatus('checking')
    setErrorMessage(null)
    
    try {
      const response = await fetch('/api/health')
      const result = await response.json()
      
      if (result.success && result.data.openmic) {
        if (result.data.openmic.status === 'connected') {
          setStatus('connected')
          setLastSync(new Date())
          setErrorMessage(null)
        } else {
          setStatus('error')
          setErrorMessage(result.data.openmic.error || 'Unknown OpenMic error')
        }
      } else {
        setStatus('disconnected')
        setErrorMessage('Health check failed')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Network error')
    }
  }

  useEffect(() => {
    checkStatus()
    // Check status every 2 minutes
    const interval = setInterval(checkStatus, 120000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking connection...'
      case 'connected':
        return 'OpenMic Connected'
      case 'disconnected':
        return 'OpenMic Disconnected'
      case 'error':
        return 'Connection Error'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'secondary'
      case 'connected':
        return 'default'
      case 'disconnected':
        return 'secondary'
      case 'error':
        return 'destructive'
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{getStatusText()}</span>
                <Badge variant={getStatusColor() as any} className="text-xs">
                  {status.toUpperCase()}
                </Badge>
              </div>
              {lastSync && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last sync: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={checkStatus}
              disabled={status === 'checking'}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${status === 'checking' ? "animate-spin" : ""}`} />
              Check
            </Button>
            {onSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
            )}
          </div>
        </div>
        
        {status === 'disconnected' && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              OpenMic API connection is not available. Some features may be limited.
            </p>
            {errorMessage && (
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Details: {errorMessage}
              </p>
            )}
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-xs text-red-800 dark:text-red-200">
              Unable to connect to OpenMic API.
            </p>
            {errorMessage && (
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-mono">
                Error: {errorMessage}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
