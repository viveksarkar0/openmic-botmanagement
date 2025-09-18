import { NextResponse } from "next/server"
import { prisma, checkDatabaseSchema } from "@/lib/prisma"
import { logger } from "@/lib/logger"


export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const schemaCheck = await checkDatabaseSchema()

    const health = {
      status: schemaCheck.exists ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        api: "operational",
        schema: schemaCheck.exists ? "ready" : "missing",
      },
      version: process.env.npm_package_version || "1.0.0",
      error: schemaCheck.exists ? undefined : "Database tables not found. Please run the initialization script.",
    }

    logger.info("Health check performed", health)

    return NextResponse.json(health, {
      status: schemaCheck.exists ? 200 : 503,
    })
  } catch (error) {
    logger.error("Health check failed", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "disconnected",
          api: "operational",
          schema: "unknown",
        },
        error: "Database connection failed",
      },
      { status: 503 },
    )
  }
}
