import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { openmic } from "@/lib/openmic"
import { PreCallSchema, type ApiResponse } from "@/lib/types"


export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const validatedData = PreCallSchema.parse(body)

    let bot = await prisma.bot.findUnique({
      where: { uid: validatedData.botUid },
    })

    if (!bot && validatedData.botUid !== "unknown") {
      bot = await prisma.bot.findFirst({
        where: { domain: "medical" },
      })
    }

    if (!bot) {
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

   


    return NextResponse.json({
      success: true,
      data: preCallData,
    })
  } catch (error) {
    return NextResponse.json({ 
      success: true, 
      data: { message: "Pre-call webhook processed with error", error: error instanceof Error ? error.message : "Unknown error" } 
    })
  }
}
