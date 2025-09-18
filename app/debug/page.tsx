"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)

  const testOpenMicConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug/openmic')
      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      setDebugResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncBots = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bots?sync=true')
      const result = await response.json()
      console.log("Sync result:", result)
      alert(`Sync completed! Found ${result.data?.length || 0} bots.`)
    } catch (error) {
      alert("Sync failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const createTestCall = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-call', { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        alert(`Test call created! Bot: ${result.data.botName} (${result.data.domain}). Check the Call Logs page to see function call data.`)
      } else {
        alert(`Failed to create test call: ${result.error}`)
      }
    } catch (error) {
      alert("Test call creation failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">OpenMic Debug Console</h1>
          <p className="text-muted-foreground mt-2">
            Test your OpenMic API connection and debug bot synchronization issues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test OpenMic Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will test your OpenMic API key and try to fetch bots from all possible endpoints.
              </p>
              <Button 
                onClick={testOpenMicConnection} 
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Test Connection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Bots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Force sync bots from OpenMic to your local database.
              </p>
              <Button 
                onClick={syncBots} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Sync Bots Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Test Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a test call log with function call data to see how it appears in the UI.
              </p>
              <Button 
                onClick={createTestCall} 
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Create Test Call
              </Button>
            </CardContent>
          </Card>
        </div>

        {debugResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {debugResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Debug Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">API Key Status</label>
                  <div className="mt-1">
                    <Badge variant={debugResult.data?.apiKeyConfigured ? "default" : "destructive"}>
                      {debugResult.data?.apiKeyConfigured ? "Configured" : "Missing"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">API Key Length</label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {debugResult.data?.apiKeyLength || 0} characters
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Connection Status</label>
                  <div className="mt-1">
                    <Badge variant={debugResult.success ? "default" : "destructive"}>
                      {debugResult.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </div>
              </div>

              {debugResult.data?.fetchResult && (
                <div>
                  <label className="text-sm font-medium">Fetch Result</label>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium">Success: </span>
                        <Badge variant={debugResult.data.fetchResult.success ? "default" : "destructive"}>
                          {debugResult.data.fetchResult.success ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Bots Found: </span>
                        <Badge variant="secondary">
                          {debugResult.data.fetchResult.data?.length || 0}
                        </Badge>
                      </div>
                    </div>
                    
                    {debugResult.data.fetchResult.error && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-red-600">Error: </span>
                        <span className="text-sm">{debugResult.data.fetchResult.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Raw Debug Data</label>
                <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Troubleshooting Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>If no bots are found:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Check that your OPENMIC_API_KEY is correctly set in your .env file</li>
                <li>Verify the API key is valid and has the correct permissions</li>
                <li>Make sure you have bots created in your OpenMic dashboard</li>
                <li>Check the browser console and server logs for detailed error messages</li>
              </ul>
              
              <p className="mt-4"><strong>Where to see function call data:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Call Logs page</strong>: Click on any call log to expand it</li>
                <li><strong>Function Call Results</strong>: Blue section showing function name, input, and results</li>
                <li><strong>Pre-call Data</strong>: Green section showing data retrieved before the call</li>
                <li><strong>Webhook Processing</strong>: Purple section showing post-call processing info</li>
                <li><strong>Test Data</strong>: Use "Create Test Call" button above to see example data</li>
              </ul>
              
              <p className="mt-4"><strong>Expected bot format from your screenshot:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Bot Name: "MedBoys"</li>
                <li>Bot ID: "cmfpamjmn000dqf7gllqsxr"</li>
                <li>Should be detected as "legal" domain based on the prompt</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
