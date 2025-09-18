import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { openmic } from "@/lib/openmic"
import type { ApiResponse } from "@/lib/types"

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    console.log("[SYNC] Starting bot sync from OpenMic...")
    
    const openMicResult = await openmic.fetchBots()
    
    if (!openMicResult.success) {
      return NextResponse.json({
        success: false,
        error: openMicResult.error
      }, { status: 400 })
    }

    let savedCount = 0
    let skippedCount = 0
    let updatedCount = 0
    const errors: string[] = []

    if (openMicResult.data && Array.isArray(openMicResult.data)) {
      console.log(`[SYNC] Processing ${openMicResult.data.length} bots from OpenMic`)
      
      for (const openMicBot of openMicResult.data) {
        try {
          // Extract bot info from OpenMic response
          const botUid = openMicBot.id || openMicBot.uid || openMicBot.agent_id
          const botName = openMicBot.name || `OpenMic Bot ${botUid}`
          
          if (!botUid) {
            errors.push(`Bot missing UID: ${JSON.stringify(openMicBot)}`)
            continue
          }

          // Try to determine domain from bot name or prompt
          let domain = "medical" // default
          if (botName.toLowerCase().includes("legal") || openMicBot.prompt?.toLowerCase().includes("legal")) {
            domain = "legal"
          } else if (botName.toLowerCase().includes("reception") || openMicBot.prompt?.toLowerCase().includes("reception")) {
            domain = "receptionist"
          }

          // Check if bot already exists
          const existingBot = await prisma.bot.findUnique({
            where: { uid: botUid }
          })

          if (existingBot) {
            // Update existing bot
            await prisma.bot.update({
              where: { uid: botUid },
              data: {
                name: botName,
                domain: domain as any,
                updatedAt: new Date()
              }
            })
            updatedCount++
            console.log(`[SYNC] Updated existing bot: ${botName} (${botUid})`)
          } else {
            // Create new bot
            await prisma.bot.create({
              data: {
                name: botName,
                domain: domain as any,
                uid: botUid
              }
            })
            savedCount++
            console.log(`[SYNC] Created new bot: ${botName} (${botUid})`)
          }

        } catch (error) {
          const errorMsg = `Error processing bot ${openMicBot.id || openMicBot.name}: ${error}`
          console.error("[SYNC]", errorMsg)
          errors.push(errorMsg)
        }
      }
    }

    console.log(`[SYNC] Completed: ${savedCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      data: {
        totalFetched: openMicResult.data?.length || 0,
        created: savedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully synced bots from OpenMic: ${savedCount} created, ${updatedCount} updated`
      }
    })

  } catch (error) {
    console.error("[SYNC] Error syncing bots:", error)
    return NextResponse.json({
      success: false,
      error: `Failed to sync bots: ${error instanceof Error ? error.message : error}`
    }, { status: 500 })
  }
}
