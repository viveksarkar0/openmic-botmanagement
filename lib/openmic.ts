import crypto from "crypto"

export class OpenMicService {
  private apiKey: string
  private baseUrl: string = "https://api.openmic.ai/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature || !this.apiKey) return false

    try {
      const expectedSignature = crypto.createHmac("sha256", this.apiKey).update(payload).digest("hex")

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSignature}`))
    } catch (error) {
      return false
    }
  }

  async createBot(botData: {
    name: string
    domain: string
    prompt?: string
    voice?: string
  }): Promise<{ success: boolean; botId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "API key not configured" }
      }

      const prompt = this.getDomainPrompt(botData.domain, botData.name)
      const functions = this.getDomainFunctions(botData.domain)
      
      const requestBody = {
        name: botData.name,
        prompt: botData.prompt || prompt,
        voice: botData.voice || "alloy",
        language: "en",
        functions: functions,
      }
      
      const possibleEndpoints = [
        'agents',
        'agent',
        'bots',
        'bot',
        'create-agent',
        'create-bot'
      ]
      
      for (const endpoint of possibleEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })

          if (response.ok) {
            const result = await response.json()
            return { 
              success: true, 
              botId: result.id || result.agent_id || result.uid || result.bot_id || result.agentId
            }
          }
        } catch (endpointError) {
          continue
        }
      }
      
      const generatedUid = `${botData.domain}_${Date.now()}`
      
      return { 
        success: false, 
        botId: generatedUid,
        error: "API endpoints not available - manual creation required"
      }
      
    } catch (error) {
      const generatedUid = `${botData.domain}_${Date.now()}`
      return { 
        success: false, 
        botId: generatedUid,
        error: `Failed to create bot in OpenMic: ${error}` 
      }
    }
  }

  async updateBot(botId: string, botData: {
    name?: string
    prompt?: string
    voice?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "API key not configured" }
      }

      const response = await fetch(`${this.baseUrl}/bots/${botId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(botData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: `OpenMic API error: ${response.status}` }
      }

      const result = await response.json()

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update bot in OpenMic" }
    }
  }

  async deleteBot(botId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "API key not configured" }
      }

      const response = await fetch(`${this.baseUrl}/bots/${botId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: `OpenMic API error: ${response.status}` }
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to delete bot from OpenMic" }
    }
  }

  getDomainPrompt(domain: string, botName: string): string {
    const prompts = {
      medical: `You are ${botName}, a professional medical intake assistant. Your role is to:
1. Greet patients warmly and introduce yourself
2. Ask for their patient ID or name to look up their information
3. When a patient provides their ID, immediately call the fetch_patient_details function to retrieve their medical history
4. Help schedule appointments or answer basic questions about their care
5. Be empathetic and professional at all times
6. Never provide medical advice - only administrative assistance

When a patient provides their ID (like 123), immediately call the fetch_patient_details function with their ID to get their medical information and read it back to them.`,

      legal: `You are ${botName}, a professional legal intake assistant. Your role is to:
1. Greet clients professionally and introduce yourself
2. Ask for their case ID or name to look up their information
3. When a client provides their case ID, immediately call the fetch_case_details function to retrieve case information
4. Help schedule consultations with attorneys
5. Maintain strict confidentiality
6. Never provide legal advice - only administrative assistance

When a client provides their case ID (like 456), immediately call the fetch_case_details function with their ID to get their case information and read it back to them.`,

      receptionist: `You are ${botName}, a professional virtual receptionist. Your role is to:
1. Greet callers warmly and introduce yourself
2. Ask for their name or visitor ID to look up their information
3. When a caller provides their visitor ID, immediately call the fetch_visitor_details function to retrieve their information
4. Help with appointment scheduling and general inquiries
5. Provide office hours and location information
6. Transfer calls when necessary

When a caller provides their visitor ID (like 789), immediately call the fetch_visitor_details function with their ID to get their information and read it back to them.`
    }

    return prompts[domain as keyof typeof prompts] || prompts.medical
  }

  generatePreCallData(domain: string, metadata?: Record<string, any>) {
    switch (domain) {
      case "medical":
        return {
          patientId: metadata?.patientId || "123",
          name: metadata?.name || "John Smith",
          age: metadata?.age || 35,
          lastVisit: metadata?.lastVisit || new Date().toISOString().split("T")[0],
          summary: metadata?.summary || "Regular checkup",
        }
      case "legal":
        return {
          clientId: metadata?.clientId || "456",
          name: metadata?.name || "Mary Johnson",
          caseType: metadata?.caseType || "Contract case",
          priority: metadata?.priority || "Medium",
        }
      case "receptionist":
        return {
          visitorId: metadata?.visitorId || "789",
          name: metadata?.name || "Tom Wilson",
          appointment: metadata?.appointment || "Walk-in",
          purpose: metadata?.purpose || "Meeting",
        }
      default:
        return {}
    }
  }

  generateFetchDetails(id: string, domain: string) {
    switch (domain) {
      case "medical":
        return {
          id,
          name: "John Smith",
          allergies: ["None"],
          medications: ["Aspirin"],
          notes: "Regular checkup needed",
        }
      case "legal":
        return {
          id,
          name: "Mary Johnson",
          cases: ["Contract case"],
          status: "Active",
          notes: "Meeting scheduled",
        }
      case "receptionist":
        return {
          id,
          name: "Tom Wilson",
          appointments: ["Today 2 PM"],
          status: "Confirmed",
          notes: "First visit",
        }
      default:
        return { id }
    }
  }

  async fetchCallLogs(options?: {
    botId?: string
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
    customerId?: string
    fromNumber?: string
    toNumber?: string
    callStatus?: 'registered' | 'ongoing' | 'ended' | 'error'
    callType?: 'phonecall' | 'webcall'
  }): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "API key not configured" }
      }

      // Build query parameters according to OpenMic API spec
      const params = new URLSearchParams()
      if (options?.botId) params.append('bot_id', options.botId)
      if (options?.limit) params.append('limit', Math.min(options.limit, 100).toString()) // Max 100
      if (options?.offset) params.append('offset', Math.max(options.offset, 0).toString()) // Min 0
      if (options?.customerId) params.append('customer_id', options.customerId)
      if (options?.fromNumber) params.append('from_number', options.fromNumber)
      if (options?.toNumber) params.append('to_number', options.toNumber)
      if (options?.callStatus) params.append('call_status', options.callStatus)
      if (options?.callType) params.append('call_type', options.callType)
      if (options?.startDate) params.append('from_date', options.startDate) // ISO 8601 format
      if (options?.endDate) params.append('to_date', options.endDate) // ISO 8601 format

      const url = `${this.baseUrl}/calls${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { 
          success: false, 
          error: `OpenMic API error: ${response.status} - ${errorText}` 
        }
      }

      const result = await response.json()

      return { 
        success: true, 
        data: result.calls || [],
        pagination: result.pagination
      }
      
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to fetch call logs from OpenMic: ${error}` 
      }
    }
  }

  async fetchBots(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "API key not configured" }
      }

      // Try multiple possible endpoints for fetching bots
      const possibleEndpoints = [
        'bots',
        'agents', 
        'agent',
        'simple-agents',
        'workflow-agents'
      ]
      
      for (const endpoint of possibleEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const result = await response.json()
            
            let bots = []
            if (Array.isArray(result)) {
              bots = result
            } else if (result.data && Array.isArray(result.data)) {
              bots = result.data
            } else if (result.agents && Array.isArray(result.agents)) {
              bots = result.agents
            } else if (result.bots && Array.isArray(result.bots)) {
              bots = result.bots
            } else if (typeof result === 'object' && result !== null) {
              bots = [result]
            }

            return { 
              success: true, 
              data: bots
            }
          } else {
            if (response.status === 401) {
              return {
                success: false,
                error: `Unauthorized: Please check your OpenMic API key`
              }
            }
          }
        } catch (endpointError) {
          continue
        }
      }
      
      return { 
        success: true, 
        data: []
      }
      
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to fetch bots from OpenMic: ${error}` 
      }
    }
  }

  getDomainFunctions(domain: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-ngrok-url.ngrok.io"
    
    switch (domain) {
      case "medical":
        return [
          {
            name: "fetch_patient_details",
            description: "Fetch detailed patient information including medical history, allergies, and current medications",
            parameters: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The patient ID to look up"
                }
              },
              required: ["id"]
            },
            url: `${baseUrl}/api/functions/fetch_patient_details`
          }
        ]
      case "legal":
        return [
          {
            name: "fetch_case_details",
            description: "Fetch detailed case information including case type, status, and notes",
            parameters: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The case ID to look up"
                }
              },
              required: ["id"]
            },
            url: `${baseUrl}/api/functions/fetch_case_details`
          }
        ]
      case "receptionist":
        return [
          {
            name: "fetch_visitor_details",
            description: "Fetch visitor information including appointments and status",
            parameters: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "The visitor ID to look up"
                }
              },
              required: ["id"]
            },
            url: `${baseUrl}/api/functions/fetch_visitor_details`
          }
        ]
      default:
        return []
    }
  }
}

export const openmic = new OpenMicService(process.env.OPENMIC_API_KEY || "")
