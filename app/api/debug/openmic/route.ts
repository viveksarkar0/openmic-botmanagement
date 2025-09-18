import { NextResponse } from "next/server"
import { openmic } from "@/lib/openmic"

export async function GET() {
  try {
    console.log("[DEBUG] Testing OpenMic API connection...")
    
    // Test the API key
    const apiKey = process.env.OPENMIC_API_KEY
    console.log("[DEBUG] API Key configured:", !!apiKey)
    console.log("[DEBUG] API Key length:", apiKey?.length || 0)
    console.log("[DEBUG] API Key prefix:", apiKey?.substring(0, 10) + "...")
    
    // Test bot fetching
    const result = await openmic.fetchBots()
    
    return NextResponse.json({
      success: true,
      data: {
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        fetchResult: result,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("[DEBUG] OpenMic test failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: {
        apiKeyConfigured: !!process.env.OPENMIC_API_KEY,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
