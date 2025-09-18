import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UpdateBotSchema, type ApiResponse } from "@/lib/types"
import { openmic } from "@/lib/openmic"
import type { Bot } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Bot>>> {
  try {
    const bot = await prisma.bot.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { callLogs: true },
        },
      },
    })

    if (!bot) {
      return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: bot,
    })
  } catch (error) {
    console.error("Error fetching bot:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bot" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Bot>>> {
  try {
    const body = await request.json()
    const validatedData = UpdateBotSchema.parse(body)

    const currentBot = await prisma.bot.findUnique({
      where: { id: params.id },
    })

    if (!currentBot) {
      return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 })
    }

    if (currentBot.uid) {
      const openMicResult = await openmic.updateBot(currentBot.uid, {
        name: validatedData.name,
      })
      console.log(`[INFO] OpenMic update result:`, openMicResult)
    }

    const bot = await prisma.bot.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: bot,
    })
  } catch (error) {
    console.error("Error updating bot:", error)
    return NextResponse.json({ success: false, error: "Failed to update bot" }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse>> {
  try {
    const currentBot = await prisma.bot.findUnique({
      where: { id: params.id },
    })

    if (!currentBot) {
      return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 })
    }

    if (currentBot.uid) {
      const openMicResult = await openmic.deleteBot(currentBot.uid)
      console.log(`[INFO] OpenMic delete result:`, openMicResult)
    }

    await prisma.bot.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting bot:", error)
    return NextResponse.json({ success: false, error: "Failed to delete bot" }, { status: 400 })
  }
}
