import { type NextRequest, NextResponse } from "next/server"
import { prisma, checkDatabaseSchema } from "@/lib/prisma"
import { CreateBotSchema, type ApiResponse } from "@/lib/types"
import { openmic } from "@/lib/openmic"
import type { Bot } from "@prisma/client"

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Bot[]>>> {
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
    const sync = searchParams.get("sync") === "true"

    // If sync requested, fetch from OpenMic first
    if (sync) {
      console.log("[API] Syncing bots from OpenMic...")
      const openMicResult = await openmic.fetchBots()
      
      if (openMicResult.success && openMicResult.data) {
        // Process and save OpenMic bots
        for (const openMicBot of openMicResult.data) {
          try {
            const botUid = openMicBot.id || openMicBot.uid || openMicBot.agent_id
            const botName = openMicBot.name || `OpenMic Bot ${botUid}`
            
            if (!botUid) continue

            // Determine domain
            let domain = "medical"
            if (botName.toLowerCase().includes("legal") || openMicBot.prompt?.toLowerCase().includes("legal")) {
              domain = "legal"
            } else if (botName.toLowerCase().includes("reception") || openMicBot.prompt?.toLowerCase().includes("reception")) {
              domain = "receptionist"
            }

            // Upsert bot
            await prisma.bot.upsert({
              where: { uid: botUid },
              update: {
                name: botName,
                domain: domain as any,
                updatedAt: new Date()
              },
              create: {
                name: botName,
                domain: domain as any,
                uid: botUid
              }
            })
          } catch (error) {
            console.error("[API] Error processing OpenMic bot:", error)
          }
        }
      }
    }

    const bots = await prisma.bot.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { callLogs: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: bots,
    })
  } catch (error) {
    console.error("Error fetching bots:", error)

    if (error instanceof Error && error.message.includes("connect")) {
      return NextResponse.json(
        { success: false, error: "Database connection failed. Please check your DATABASE_URL." },
        { status: 503 },
      )
    }

    return NextResponse.json({ success: false, error: "Failed to fetch bots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Bot>>> {
  try {
    const body = await request.json()
    const validatedData = CreateBotSchema.parse(body)

    const openMicResult = await openmic.createBot({
      name: validatedData.name,
      domain: validatedData.domain,
    })

    const uid = openMicResult.botId || validatedData.uid || `${validatedData.domain}_${Date.now()}`

    const bot = await prisma.bot.create({
      data: {
        name: validatedData.name,
        domain: validatedData.domain,
        uid,
      },
    })

    console.log(`[SUCCESS] Bot created - Local ID: ${bot.id}, OpenMic ID: ${uid}`)
    console.log(`[INFO] OpenMic Integration:`, {
      success: openMicResult.success,
      error: openMicResult.error,
    })

    return NextResponse.json(
      {
        success: true,
        data: bot,
        openMicSync: openMicResult.success,
        openMicInstructions: openMicResult.error,
        message: openMicResult.success 
          ? "Bot created successfully in both systems"
          : `Bot created locally. To complete integration: 1) Go to OpenMic dashboard, 2) Create a new bot, 3) Use UID: ${uid}, 4) Configure webhooks with your ngrok URL`
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating bot:", error)
    return NextResponse.json({ success: false, error: "Failed to create bot" }, { status: 400 })
  }
}
