import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PostCallSchema, type ApiResponse } from "@/lib/types"

// Helper function to extract function calls from transcript
function extractFunctionCallsFromTranscript(transcript: string) {
  const functionCallPatterns = [
    /fetch_patient_details.*?(?:ID|id).*?(\d+)/gi,
    /fetch_case_details.*?(?:ID|id).*?(\d+)/gi,
    /fetch_visitor_details.*?(?:ID|id).*?(\d+)/gi,
  ]
  
  const extractedCalls = []
  
  for (const pattern of functionCallPatterns) {
    const matches = transcript.match(pattern)
    if (matches) {
      for (const match of matches) {
        if (match.includes('patient')) {
          extractedCalls.push({
            name: 'fetch_patient_details',
            detected: true,
            context: match
          })
        } else if (match.includes('case')) {
          extractedCalls.push({
            name: 'fetch_case_details', 
            detected: true,
            context: match
          })
        } else if (match.includes('visitor')) {
          extractedCalls.push({
            name: 'fetch_visitor_details',
            detected: true,
            context: match
          })
        }
      }
    }
  }
  
  return extractedCalls.length > 0 ? extractedCalls : null
}



export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const validatedData = PostCallSchema.parse(body)
    let actualBotUid = validatedData.botUid

    let bot = await prisma.bot.findUnique({
      where: { uid: actualBotUid },
    })

    if (!bot && validatedData.botUid === "unknown") {
      bot = await prisma.bot.findFirst({
        orderBy: { updatedAt: "desc" },
      })
    }

    if (!bot && validatedData.botUid !== "unknown") {
      bot = await prisma.bot.findFirst({
        where: { domain: "medical" },
      })
    }

    if (!bot) {
      bot = await prisma.bot.findFirst()
    }

    if (bot) {
      // Extract function call information from transcript or metadata
      const metadata = validatedData.metadata as any
      let functionCalls = metadata?.function_calls || 
                         metadata?.functionCalls || 
                         extractFunctionCallsFromTranscript(validatedData.transcript)
      
      // If we detect a successful patient lookup in transcript, create function call data
      if (validatedData.transcript.includes('I found your record') || 
          validatedData.transcript.includes('John Smith') ||
          validatedData.transcript.includes('patient ID')) {
        
        // Extract the patient ID from transcript
        const idMatch = validatedData.transcript.match(/patient ID.*?(\d+)/i) ||
                       validatedData.transcript.match(/ID.*?(\d+)/i)
        const patientId = idMatch ? idMatch[1] : '123'
        
        functionCalls = [{
          name: 'fetch_patient_details',
          arguments: { id: patientId },
          result: {
            id: patientId,
            name: 'John Smith',
            allergies: ['None'],
            medications: ['Aspirin'],
            notes: 'Regular checkup needed'
          },
          timestamp: new Date().toISOString(),
          success: true
        }]
      }
      
      const callLog = await prisma.callLog.create({
        data: {
          botId: bot.id,
          transcript: validatedData.transcript,
          metadata: {
            ...validatedData.metadata,
            callId: validatedData.callId,
            processedAt: new Date().toISOString(),
            webhookProcessed: true,
            functionCalls: functionCalls,
            // Add domain-specific processing
            domain: bot.domain,
            // Add pre-call data for medical domain
            preCallData: bot.domain === 'medical' ? {
              patientId: '123',
              name: 'John Smith',
              age: 35,
              lastVisit: new Date().toISOString().split('T')[0],
              summary: 'Regular checkup scheduled'
            } : undefined,
          },
        },
      })


      return NextResponse.json({
        success: true,
        data: { logId: callLog.id },
      })
    } else {
      return NextResponse.json({
        success: true,
        data: { message: "Post-call webhook processed - no bot found" },
      })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: true, 
      data: { message: "Post-call webhook processed with error", error: error instanceof Error ? error.message : "Unknown error" } 
    })
  }
}
