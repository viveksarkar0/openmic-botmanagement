import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UpdateBotSchema, type ApiResponse } from "@/lib/types"
import { openmic } from "@/lib/openmic"
import type { Bot } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Bot>>> {
  try {
    const { id } = await params
    const bot = await prisma.bot.findUnique({
      where: { id },
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
    return NextResponse.json({ success: false, error: "Failed to fetch bot" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Bot>>> {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateBotSchema.parse(body)

    const currentBot = await prisma.bot.findUnique({
      where: { id },
    })

    if (!currentBot) {
      return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 })
    }

    if (currentBot.uid) {
      const openMicResult = await openmic.updateBot(currentBot.uid, {
        name: validatedData.name,
      })
    }

    const bot = await prisma.bot.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: bot,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update bot" }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params
    const currentBot = await prisma.bot.findUnique({
      where: { id },
    })

    if (!currentBot) {
      return NextResponse.json({ success: false, error: "Bot not found" }, { status: 404 })
    }

    if (currentBot.uid) {
      const openMicResult = await openmic.deleteBot(currentBot.uid)
    }

    await prisma.bot.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete bot" }, { status: 400 })
  }
}
