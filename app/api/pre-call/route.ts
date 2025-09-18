import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { openmic } from "@/lib/openmic"
import { PreCallSchema, type ApiResponse } from "@/lib/types"


export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    console.log("[DEBUG] Pre-call webhook received:", JSON.stringify(body, null, 2))
    
    const validatedData = PreCallSchema.parse(body)
    console.log("[DEBUG] Parsed webhook data:", {
      botUid: validatedData.botUid,
      callId: validatedData.callId,
      event: validatedData.event,
      call: validatedData.call,
    })

    let bot = await prisma.bot.findUnique({
      where: { uid: validatedData.botUid },
    })

    if (!bot && validatedData.botUid !== "unknown") {
      console.log(`[DEBUG] Bot with UID ${validatedData.botUid} not found, searching by domain`)
      bot = await prisma.bot.findFirst({
        where: { domain: "medical" },
      })
    }

    if (!bot) {
      console.log("[DEBUG] No bot found in database, using default bot")
      bot = {
        id: "default",
        name: "Default Medical Bot",
        domain: "medical",
        uid: "default",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    const preCallData = openmic.generatePreCallData(bot.domain, validatedData.metadata)

   

    console.log(`[SUCCESS] Pre-call webhook for bot ${bot.name} (${bot.domain})`, {
      botUid: validatedData.botUid,
      callId: validatedData.callId,
      preCallData,
    })

    return NextResponse.json({
      success: true,
      data: preCallData,
    })
  } catch (error) {
    console.error("Error processing pre-call webhook:", error)
    console.error("Error details:", error instanceof Error ? error.message : error)
    return NextResponse.json({ 
      success: true, 
      data: { message: "Pre-call webhook processed with error", error: error instanceof Error ? error.message : "Unknown error" } 
    })
  }
}
