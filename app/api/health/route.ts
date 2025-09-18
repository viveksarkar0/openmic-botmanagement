import { NextResponse } from "next/server"
import { prisma, checkDatabaseSchema } from "@/lib/prisma"
import { openmic } from "@/lib/openmic"


export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    const schemaCheck = await checkDatabaseSchema()

    // Check OpenMic connection
    let openMicStatus = "disconnected"
    let openMicError = null
    
    try {
      // Simple API key check first
      const apiKey = process.env.OPENMIC_API_KEY
      if (!apiKey) {
        openMicStatus = "error"
        openMicError = "API key not configured"
      } else {
        // Try a simple API call
        const response = await fetch('https://api.openmic.ai/v1/bots', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          openMicStatus = "connected"
        } else if (response.status === 401) {
          openMicStatus = "error"
          openMicError = "Invalid API key"
        } else {
          openMicStatus = "error"
          openMicError = `API returned ${response.status}`
        }
      }
    } catch (error) {
      openMicStatus = "error"
      openMicError = error instanceof Error ? error.message : "Connection failed"
    }

    const allServicesHealthy = schemaCheck.exists && openMicStatus === "connected"

    const health = {
      success: true,
      data: {
        status: allServicesHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        services: {
          database: "connected",
          api: "operational",
          schema: schemaCheck.exists ? "ready" : "missing",
          openmic: openMicStatus === "connected",
        },
        openmic: {
          status: openMicStatus,
          error: openMicError,
          hasApiKey: !!process.env.OPENMIC_API_KEY
        },
        version: process.env.npm_package_version || "1.0.0",
        error: schemaCheck.exists ? undefined : "Database tables not found. Please run the initialization script.",
      }
    }

    console.log("[HEALTH] Health check performed:", health)

    return NextResponse.json(health, {
      status: schemaCheck.exists ? 200 : 503,
    })
  } catch (error) {
    console.error("[HEALTH] Health check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Health check failed",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          services: {
            database: "disconnected",
            api: "operational",
            schema: "unknown",
            openmic: false,
          },
          error: "Database connection failed",
        }
      },
      { status: 503 },
    )
  }
}
