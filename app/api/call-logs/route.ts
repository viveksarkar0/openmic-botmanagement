import { type NextRequest, NextResponse } from "next/server"
import { prisma, checkDatabaseSchema } from "@/lib/prisma"
import { openmic } from "@/lib/openmic"
import type { ApiResponse } from "@/lib/types"


function formatDuration(seconds: number): string {
  if (!seconds && seconds !== 0) return '0s'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (minutes === 0) return `${remainingSeconds}s`
  if (remainingSeconds === 0) return `${minutes}m`
  
  return `${minutes}m ${remainingSeconds}s`
}

type CallLogFilter = {
  botId?: string
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
  status?: 'registered' | 'ongoing' | 'ended' | 'error'
  searchQuery?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const schemaCheck = await checkDatabaseSchema()
    if (!schemaCheck.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Database tables not found. Please run the database migration script first.",
        },
        { status: 503 },
      )
    }
    const { searchParams } = new URL(request.url)
    const botId = searchParams.get("botId")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100) // Max 100 per page
    const page = Math.max(Number(searchParams.get("page")) || 1, 1)
    const offset = (page - 1) * limit
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status") as 'registered' | 'ongoing' | 'ended' | 'error' | null
    const searchQuery = searchParams.get("search")
    const source = searchParams.get("source") || "openmic"
    const allBots = await prisma.bot.findMany({
      select: { id: true, name: true, domain: true, uid: true }
    })
    const botsByUid = new Map(allBots.map(bot => [bot.uid, bot]))
    const botsById = new Map(allBots.map(bot => [bot.id, bot]))

    let openMicCallLogs: any[] = []
    let totalCount = 0

    if (source === "openmic" || source === "both") {
      let botUid: string | undefined
      if (botId) {
        const bot = botsById.get(botId)
        botUid = bot?.uid
      }

      const openMicParams: any = {
        botId: botUid,
        limit,
        offset,
        callStatus: status || 'ended' 
      }
      
      if (startDate) openMicParams.startDate = startDate
      if (endDate) openMicParams.endDate = endDate
      if (searchQuery?.match(/^[a-f0-9-]+$/)) {
        openMicParams.customerId = searchQuery 
      }
      
      const openMicResult = await openmic.fetchCallLogs(openMicParams)
      
      if (openMicResult.success && openMicResult.data) {
        if (openMicResult.success && openMicResult.data) {
          totalCount = openMicResult.pagination?.total || openMicResult.data.length
          
          openMicCallLogs = openMicResult.data.map((log: any) => {
            const botUid = log.agent_id || log.bot_id
            let bot = null
            
            // First try to find bot by UID
            if (botUid) {
              bot = botsByUid.get(botUid)
              
              // If not found by UID, try to find by bot_id in the log
              if (!bot && log.bot_id) {
                bot = Array.from(botsByUid.values()).find(b => b.uid === log.bot_id)
              }
            }
            
            // If still no bot found, try to get a default bot
            if (!bot && allBots.length > 0) {
              // Try to find a bot with a matching domain if available
              if (log.domain) {
                bot = allBots.find(b => b.domain === log.domain)
              }
              // Otherwise, just use the first available bot
              if (!bot) {
                bot = allBots[0]
              }
            }
            
            const callStatus = log.status?.toLowerCase() || 'unknown'
            const callDuration = log.duration_seconds || 0
            const callCost = log.cost ? parseFloat(log.cost) : 0
            const callDirection = log.direction || (log.to_number ? 'inbound' : 'outbound')
            const formatDate = (dateString?: string) => {
              if (!dateString) return ''
              return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
            
            return {
              id: log.call_id || log.id,
              botId: bot?.id || null,
              botUid: botUid || null,
              bot: {
                id: bot?.id || '',
                name: bot?.name || 'Unknown Bot',
                domain: bot?.domain || 'unknown'
              },
              callerNumber: log.from_number || log.caller_number || 'Unknown',
              status: callStatus,
              duration: callDuration,
              formattedDuration: formatDuration(callDuration),
              cost: callCost,
              formattedCost: callCost ? `$${callCost.toFixed(2)}` : 'N/A',
              recordingUrl: log.recording_url || null,
              transcript: log.transcript || '',
              metadata: log.metadata || {},
              createdAt: log.created_at || new Date().toISOString(),
              formattedCreatedAt: formatDate(log.created_at),
              endedAt: log.ended_at || null,
              formattedEndedAt: formatDate(log.ended_at),
              direction: callDirection,
              source: 'openmic',
              _searchText: [
                bot?.name || '',
                log.from_number || '',
                log.to_number || '',
                log.transcript || '',
                log.status || ''
              ].join(' ').toLowerCase()
            }
          })

          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase()
            openMicCallLogs = openMicCallLogs.filter(log => 
              log._searchText.includes(searchLower)
            )
          }
        }
        
        const response = {
          success: true,
          data: openMicCallLogs,
          pagination: {
            total: totalCount,
            page,
            pageSize: limit,
            pageCount: Math.ceil(totalCount / limit)
          },
          filters: {
            botId,
            startDate,
            endDate,
            status,
            searchQuery
          }
        }

        return NextResponse.json(response)
      } else {
        openMicCallLogs = []
      }
    }

    let localCallLogs: any[] = []
    let localTotal = 0
    
    if (source === "local" || source === "both") {
      const where = botId ? { botId } : {}

      const [logs, total] = await Promise.all([
        prisma.callLog.findMany({
          where,
          include: {
            bot: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.callLog.count({ where }),
      ])

      localCallLogs = logs
      localTotal = total
    }

    let finalCallLogs = localCallLogs
    let finalTotal = localTotal

    if (source === "both" && openMicCallLogs) {
      const combined = [...openMicCallLogs, ...localCallLogs]
      const seen = new Set()
      finalCallLogs = combined.filter(log => {
        const key = log.metadata?.call_id || log.metadata?.sessionId || log.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      finalTotal = finalCallLogs.length
    }

    const response = {
      success: true,
      data: finalCallLogs,
      pagination: {
        total: finalTotal,
        page,
        pageSize: limit,
        pageCount: Math.ceil(finalTotal / limit)
      },
      filters: {
        botId,
        startDate,
        endDate,
        status,
        searchQuery
      }
    }

    return NextResponse.json(response)
  } catch (error) {

    if (error instanceof Error && error.message.includes("connect")) {
      return NextResponse.json(
        { success: false, error: "Database connection failed. Please check your DATABASE_URL." },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: false, error: "Failed to fetch call logs" }, { status: 500 })
  }
}
