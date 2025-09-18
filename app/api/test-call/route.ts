import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // Find a bot to use for the test
    const bot = await prisma.bot.findFirst()
    
    if (!bot) {
      return NextResponse.json({
        success: false,
        error: "No bot found. Please create a bot first."
      })
    }

    // Create a test call log with function call data
    const testCallLog = await prisma.callLog.create({
      data: {
        botId: bot.id,
        transcript: `Hello, I'm ${bot.name}, your ${bot.domain} assistant. How can I help you today?

User: Hi, I need to check my information for patient ID 123.

Assistant: Let me look up your information right away. I'm calling the fetch_patient_details function with your ID.

[Function Call: fetch_patient_details(id: "123")]
[Function Result: Found patient John Smith (ID: 123). Medical history: No known allergies. Current medications: Aspirin. Notes: Regular checkup needed.]

Great! I found your information, John Smith. According to your records, you have no known allergies and are currently taking Aspirin. Your notes indicate you need a regular checkup. Is there anything specific you'd like to discuss about your medical care today?

User: That's perfect, thank you!

Assistant: You're welcome! Is there anything else I can help you with today?`,
        metadata: {
          callId: `test_call_${Date.now()}`,
          processedAt: new Date().toISOString(),
          webhookProcessed: true,
          domain: bot.domain,
          duration: 120,
          cost: 0.15,
          sentiment: "positive",
          functionCalls: [
            {
              name: "fetch_patient_details",
              arguments: { id: "123" },
              result: {
                id: "123",
                name: "John Smith",
                allergies: ["None"],
                medications: ["Aspirin"],
                notes: "Regular checkup needed"
              },
              timestamp: new Date().toISOString()
            }
          ],
          preCallData: {
            patientId: "123",
            name: "John Smith",
            age: 35,
            lastVisit: new Date().toISOString().split("T")[0],
            summary: "Regular checkup"
          }
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        message: "Test call log created successfully",
        logId: testCallLog.id,
        botName: bot.name,
        domain: bot.domain
      }
    })
  } catch (error) {
    console.error("Error creating test call:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create test call log"
    }, { status: 500 })
  }
}
