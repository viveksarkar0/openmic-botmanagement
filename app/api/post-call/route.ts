import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PostCallSchema, type ApiResponse } from "@/lib/types"



export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    console.log("[DEBUG] Post-call webhook received:", JSON.stringify(body, null, 2))
    
    const validatedData = PostCallSchema.parse(body)
    
    let actualBotUid = validatedData.botUid
    
    console.log("[DEBUG] Parsed post-call data:", {
      originalBotUid: validatedData.botUid,
      actualBotUid: actualBotUid,
      callId: validatedData.callId,
      transcriptLength: validatedData.transcript.length,
      metadata: validatedData.metadata,
    })

    let bot = await prisma.bot.findUnique({
      where: { uid: actualBotUid },
    })

    if (!bot && validatedData.botUid === "unknown") {
      console.log("[DEBUG] Bot UID is unknown, finding most recently used bot")
      bot = await prisma.bot.findFirst({
        orderBy: { updatedAt: "desc" },
      })
    }

    if (!bot && validatedData.botUid !== "unknown") {
      console.log(`[DEBUG] Bot with UID ${validatedData.botUid} not found, searching by domain`)
      bot = await prisma.bot.findFirst({
        where: { domain: "medical" },
      })
    }

    if (!bot) {
      console.log("[DEBUG] No specific bot found, using first available bot")
      bot = await prisma.bot.findFirst()
    }

    if (bot) {
      const callLog = await prisma.callLog.create({
        data: {
          botId: bot.id,
          transcript: validatedData.transcript,
          metadata: {
            ...validatedData.metadata,
            callId: validatedData.callId,
            processedAt: new Date().toISOString(),
          },
        },
      })

      console.log(`[SUCCESS] Post-call webhook processed for bot ${bot.name}`, {
        callId: validatedData.callId,
        logId: callLog.id,
        transcriptLength: validatedData.transcript.length,
        summary: validatedData.metadata.summary,
      })

      return NextResponse.json({
        success: true,
        data: { logId: callLog.id },
      })
    } else {
      console.log("[WARNING] No bot found in database, but webhook processed successfully")
      return NextResponse.json({
        success: true,
        data: { message: "Post-call webhook processed - no bot found" },
      })
    }
  } catch (error) {
    console.error("Error processing post-call webhook:", error)
    console.error("Error details:", error instanceof Error ? error.message : error)
    return NextResponse.json({ 
      success: true, 
      data: { message: "Post-call webhook processed with error", error: error instanceof Error ? error.message : "Unknown error" } 
    })
  }
}
